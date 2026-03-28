'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { getSocket, disconnectSocket } from '@/lib/socket'
import { PresenceDots } from '@/components/PresenceDots'
import { ToneMeter } from '@/components/ToneMeter'
import { ToneWarning } from '@/components/ToneWarning'
import Link from 'next/link'

interface SessionData {
  id: string
  conflictId: string
  conflict: {
    id: string
    title: string
    description: string
    analysis: any
  }
  currentDraft: string | null
  resolvedAt: string | null
}

interface PresenceUser {
  userId: string
  userName: string
}

interface Warning {
  phrase: string
  suggestion: string | null
}

export default function SessionPage() {
  const { data: authSession, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [draft, setDraft] = useState('')
  const [presence, setPresence] = useState<PresenceUser[]>([])
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [toneScore, setToneScore] = useState(7)
  const [warning, setWarning] = useState<Warning | null>(null)
  const [resolveCount, setResolveCount] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [iResolved, setIResolved] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [finalDraft, setFinalDraft] = useState('')
  const [copied, setCopied] = useState(false)

  const debounceRef = useRef<NodeJS.Timeout>()
  const typingRef = useRef<NodeJS.Timeout>()
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)

  // ── Load session data ──────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/sessions/${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setSessionData(data)
        setDraft(data.currentDraft || '')
        setLoading(false)
      })
      .catch(() => { setError('Failed to load session'); setLoading(false) })
  }, [sessionId])

  // ── Connect WebSocket ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionData || !authSession?.user) return

    const socket = getSocket(sessionId, authSession.user.id, authSession.user.name || 'Someone')
    socketRef.current = socket

    // Send conflict context so the other user has it
    socket.emit('set_context', {
      context: sessionData.conflict.analysis?.common_ground || sessionData.conflict.title
    })

    socket.on('presence', (users: PresenceUser[]) => {
      setPresence(users)
      setTotalUsers(users.length)
    })

    socket.on('draft_sync', ({ draft }: { draft: string }) => {
      setDraft(draft)
    })

    socket.on('draft_update', ({ draft }: { draft: string }) => {
      setDraft(draft)
    })

    socket.on('typing', ({ userName, isTyping }: { userName: string; isTyping: boolean }) => {
      setTypingUser(isTyping ? userName : null)
      if (isTyping) {
        clearTimeout(typingRef.current)
        typingRef.current = setTimeout(() => setTypingUser(null), 2500)
      }
    })

    socket.on('resolve_status', ({ count, total }: { count: number; total: number }) => {
      setResolveCount(count)
      setTotalUsers(total)
    })

    socket.on('session_complete', ({ finalDraft }: { finalDraft: string }) => {
      setFinalDraft(finalDraft)
      setCompleted(true)
      // Persist to DB
      fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalDraft }),
      })
    })

    return () => {
      disconnectSocket()
    }
  }, [sessionData, authSession, sessionId])

  // ── Handle typing in the shared editor ────────────────────────────────────
  const handleDraftChange = useCallback((value: string) => {
    setDraft(value)

    // Emit to other user immediately
    socketRef.current?.emit('draft_update', { draft: value })

    // Typing indicator
    socketRef.current?.emit('typing', { isTyping: true })
    clearTimeout(typingRef.current)
    typingRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', { isTyping: false })
    }, 1500)

    // Debounced AI tone check — only after 1.5s of no typing
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (value.trim().length < 20) return
      try {
        const res = await fetch('/api/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draft: value,
            conflictSummary: sessionData?.conflict.analysis?.common_ground || '',
          }),
        })
        const result = await res.json()
        setToneScore(result.tone_score ?? 7)
        if (result.flag && result.flagged_phrase) {
          setWarning({ phrase: result.flagged_phrase, suggestion: result.suggestion })
        } else {
          setWarning(null)
        }
      } catch {
        // Silently ignore moderation errors
      }
    }, 1500)
  }, [sessionData])

  const handleResolve = () => {
    if (iResolved) return
    setIResolved(true)
    socketRef.current?.emit('mark_resolved')
  }

  const copyFinal = async () => {
    await navigator.clipboard.writeText(finalDraft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Loading / error states ─────────────────────────────────────────────────
  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Loading session…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--stone-600)' }}>{error}</p>
        <Link href="/dashboard" className="btn-secondary">Back to dashboard</Link>
      </div>
    )
  }

  // ── Completed state ────────────────────────────────────────────────────────
  if (completed) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <nav className="nav">
          <a href="/" className="nav-logo">resolve</a>
        </nav>
        <main className="container-sm" style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <div className="animate-in">
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#eafaf1', border: '1.5px solid #a9dfbf', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l5 5 7-7" stroke="#1a6633" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Resolution reached</h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: 300, marginBottom: '2rem' }}>
              Both of you agreed. Here's your final message.
            </p>

            <div className="card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.75, color: 'var(--stone-700)', margin: 0 }}>
                {finalDraft}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={copyFinal} className="btn-primary">
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Copied!
                  </>
                ) : 'Copy message'}
              </button>
              <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── Main co-draft room ─────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <a href="/" className="nav-logo">resolve</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <PresenceDots users={presence} />
          {typingUser && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
              {typingUser} is typing…
            </span>
          )}
        </div>
      </nav>

      <main className="container-sm" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>

        {/* Header */}
        <div className="animate-in" style={{ marginBottom: '1.75rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
            Co-draft session
          </p>
          <h1 style={{ fontSize: '1.5rem' }}>{sessionData?.conflict.title}</h1>
        </div>

        {/* Context reminder */}
        {sessionData?.conflict.analysis?.common_ground && (
          <div className="animate-in animate-in-delay-1 card-subtle" style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
              Common ground
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--stone-600)', fontWeight: 300, margin: 0 }}>
              {sessionData.conflict.analysis.common_ground}
            </p>
          </div>
        )}

        {/* Waiting for second user */}
        {presence.length < 2 && (
          <div
            className="animate-in animate-in-delay-1"
            style={{ padding: '1rem 1.25rem', background: '#e8f4fd', border: '1px solid #aed6f1', borderRadius: 10, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="6.5" stroke="#1a5276" strokeWidth="1.25"/>
              <path d="M8 5v3.5L10 10" stroke="#1a5276" strokeWidth="1.25" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: '0.875rem', color: '#1a5276', margin: 0, fontWeight: 300 }}>
              Waiting for the other person to join. Share this page's URL with them.
            </p>
          </div>
        )}

        {/* Tone meter */}
        <div className="animate-in animate-in-delay-2" style={{ marginBottom: '0.875rem' }}>
          <ToneMeter score={toneScore} />
        </div>

        {/* Tone warning */}
        {warning && (
          <div className="animate-in" style={{ marginBottom: '0.875rem' }}>
            <ToneWarning
              phrase={warning.phrase}
              suggestion={warning.suggestion}
              onDismiss={() => setWarning(null)}
            />
          </div>
        )}

        {/* Shared editor */}
        <div className="animate-in animate-in-delay-2">
          <label className="field-label" style={{ marginBottom: '0.625rem' }}>
            Write the message together
          </label>
          <textarea
            className="input"
            rows={8}
            value={draft}
            onChange={e => handleDraftChange(e.target.value)}
            placeholder="Start writing your resolution message here. Both of you can type and edit…"
            style={{ minHeight: 200, fontSize: '1rem', fontFamily: 'var(--font-display)', fontStyle: draft ? 'normal' : 'italic', lineHeight: 1.75 }}
          />
          <p className="field-hint" style={{ marginBottom: '1.5rem' }}>
            AI checks tone every 1.5 seconds and flags anything that might escalate.
          </p>
        </div>

        {/* Resolve section */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 400, marginBottom: '0.2rem', fontSize: '0.9375rem' }}>
              Happy with this message?
            </p>
            <p style={{ fontSize: '0.8375rem', color: 'var(--text-muted)', fontWeight: 300, margin: 0 }}>
              {resolveCount === 0
                ? 'Both of you need to agree to close the session.'
                : resolveCount === 1
                ? `${resolveCount} of ${totalUsers || 2} agreed — waiting for the other person.`
                : 'Both agreed!'}
            </p>
          </div>

          <button
            onClick={handleResolve}
            disabled={iResolved || draft.trim().length === 0}
            style={{
              padding: '0.625rem 1.375rem',
              borderRadius: 8,
              border: '1.5px solid',
              borderColor: iResolved ? '#a9dfbf' : '#1a6633',
              background: iResolved ? '#eafaf1' : 'white',
              color: iResolved ? '#1a6633' : '#1a6633',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              cursor: iResolved ? 'default' : 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
              opacity: draft.trim().length === 0 ? 0.5 : 1,
            }}
          >
            {iResolved ? '✓ You agreed' : 'I\'m satisfied with this'}
          </button>
        </div>

      </main>
    </div>
  )
}
