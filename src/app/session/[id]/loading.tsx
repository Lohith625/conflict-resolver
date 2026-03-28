export default function SessionLoading() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <a href="/" className="nav-logo">resolve</a>
      </nav>
      <main className="container-sm" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <style>{`@keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ width: 100, height: 11, borderRadius: 4, background: 'var(--stone-200)', marginBottom: '0.625rem', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
          <div style={{ width: 240, height: 24, borderRadius: 6, background: 'var(--stone-200)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
        </div>
        <div style={{ width: '100%', height: 5, borderRadius: 10, background: 'var(--stone-200)', marginBottom: '1.5rem', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
        <div style={{ width: '100%', height: 200, borderRadius: 8, background: 'var(--stone-200)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
      </main>
    </div>
  )
}
