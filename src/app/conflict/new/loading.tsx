export default function NewConflictLoading() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <a href="/" className="nav-logo">resolve</a>
      </nav>
      <main className="container-sm" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <style>{`@keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        <div style={{ display: 'grid', gap: '1.75rem' }}>
          {[140, 90, 90].map((h, i) => (
            <div key={i}>
              <div style={{ width: 160, height: 13, borderRadius: 4, background: 'var(--stone-200)', marginBottom: '0.5rem', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
              <div style={{ width: '100%', height: h, borderRadius: 8, background: 'var(--stone-200)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
