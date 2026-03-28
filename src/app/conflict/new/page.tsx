'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'

type FormData = {
  description: string
  userRole: string
  otherRole: string
}

const CHAR_MIN = 40

export default function NewConflictPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>()

  const descriptionVal = watch('description', '')
  const userRoleVal = watch('userRole', '')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Something went wrong')
      }
      const { conflictId } = await res.json()
      router.push(`/conflict/${conflictId}`)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <a href="/" className="nav-logo">resolve</a>
        <Link href="/dashboard" className="btn-ghost">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </Link>
      </nav>

      <main className="container-sm" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div className="animate-in" style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>What happened?</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 300, fontSize: '0.9375rem' }}>
            Be as honest as you can. The more context you give, the more useful the analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1.75rem' }}>

          {/* Description */}
          <div className="animate-in animate-in-delay-1">
            <label className="field-label">
              Describe the situation
            </label>
            <textarea
              className="input"
              rows={6}
              placeholder="e.g. My roommate and I have been fighting about cleaning. I asked them twice to clean the kitchen and they haven't. Last night I left a note and they got really defensive about it..."
              {...register('description', {
                required: 'Please describe what happened',
                minLength: { value: CHAR_MIN, message: `Give a bit more detail (at least ${CHAR_MIN} characters)` },
              })}
              style={{ minHeight: 140 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem' }}>
              {errors.description ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--warm-accent)' }}>{errors.description.message}</span>
              ) : (
                <span className="field-hint">Write as if explaining to a friend</span>
              )}
              <span style={{ fontSize: '0.75rem', color: descriptionVal.length < CHAR_MIN ? 'var(--text-faint)' : 'var(--warm-accent)' }}>
                {descriptionVal.length}
              </span>
            </div>
          </div>

          {/* User role */}
          <div className="animate-in animate-in-delay-2">
            <label className="field-label">
              Your role in this
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="e.g. I'm the one who has been asking for the kitchen to be cleaned. I feel like I'm always the one who has to bring this up..."
              {...register('userRole', {
                required: 'Describe your role',
                minLength: { value: 20, message: 'Add a bit more about your side' },
              })}
              style={{ minHeight: 90 }}
            />
            {errors.userRole && (
              <span style={{ fontSize: '0.8rem', color: 'var(--warm-accent)', marginTop: '0.375rem', display: 'block' }}>
                {errors.userRole.message}
              </span>
            )}
            {!errors.userRole && (
              <p className="field-hint">How do you see your own part in this?</p>
            )}
          </div>

          {/* Other person's role — optional */}
          <div className="animate-in animate-in-delay-3">
            <label className="field-label">
              The other person's perspective
              <span style={{ fontWeight: 300, color: 'var(--text-faint)', marginLeft: '0.4rem' }}>(optional)</span>
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="e.g. They might feel like I'm being picky or controlling. They've been stressed with exams lately and maybe feel like I picked the worst time to bring this up..."
              {...register('otherRole')}
              style={{ minHeight: 90 }}
            />
            <p className="field-hint">Try to steelman their side — it makes the AI analysis much more useful</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '0.875rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>
              <p style={{ fontSize: '0.875rem', color: '#b91c1c', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="animate-in animate-in-delay-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ minWidth: 160 }}
            >
              {loading ? (
                <>
                  <Spinner />
                  Analysing...
                </>
              ) : (
                <>
                  Get perspective
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </>
              )}
            </button>
            {loading && (
              <p style={{ fontSize: '0.8375rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>
                This takes about 10 seconds…
              </p>
            )}
          </div>

        </form>
      </main>
    </div>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 15" strokeLinecap="round"/>
    </svg>
  )
}
