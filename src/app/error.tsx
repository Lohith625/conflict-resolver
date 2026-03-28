'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="nav">
        <a href="/" className="nav-logo">resolve</a>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontStyle: 'italic', color: 'var(--stone-400)', marginBottom: '1rem' }}>
            Something went wrong
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 300, marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={reset} className="btn-primary">Try again</button>
            <Link href="/dashboard" className="btn-secondary">Go to dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
