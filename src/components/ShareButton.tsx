'use client'

import { useState } from 'react'

interface Props {
  conflictId: string
  existingSessionId?: string | null
}

export function ShareButton({ conflictId, existingSessionId }: Props) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sessionId, setSessionId] = useState(existingSessionId || null)

  const createAndCopy = async () => {
    setLoading(true)
    try {
      let id = sessionId

      if (!id) {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conflictId }),
        })
        const data = await res.json()
        id = data.sessionId
        setSessionId(id)
      }

      const link = `${window.location.origin}/session/${id}`
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={createAndCopy}
      className="btn-primary"
      disabled={loading}
      style={{ flexShrink: 0 }}
    >
      {loading ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 15" strokeLinecap="round"/>
          </svg>
          Creating link...
        </>
      ) : copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Link copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 1.5H12.5V5.5M12.5 1.5L6 8M5.5 3H2.5C1.948 3 1.5 3.448 1.5 4V11.5C1.5 12.052 1.948 12.5 2.5 12.5H10C10.552 12.5 11 12.052 11 11.5V8.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {sessionId ? 'Copy invite link' : 'Create invite link'}
        </>
      )}
    </button>
  )
}
