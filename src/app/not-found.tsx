import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="nav">
        <a href="/" className="nav-logo">resolve</a>
      </nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 400, color: 'var(--stone-200)', marginBottom: '0.5rem', lineHeight: 1 }}>
            404
          </p>
          <h1 style={{ fontSize: '1.375rem', marginBottom: '0.75rem' }}>Page not found</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 300, fontSize: '0.9375rem', marginBottom: '2rem' }}>
            This page doesn't exist or you don't have access to it.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link href="/dashboard" className="btn-primary">Go to dashboard</Link>
            <Link href="/" className="btn-secondary">Home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
