import { SkeletonCard } from '@/components/Skeletons'

export default function DashboardLoading() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <a href="/" className="nav-logo">resolve</a>
      </nav>
      <main className="container-md" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ width: 180, height: 28, borderRadius: 6, background: 'var(--stone-200)', marginBottom: '0.5rem', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
          <div style={{ width: 240, height: 16, borderRadius: 6, background: 'var(--stone-200)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
          <style>{`@keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <div style={{ width: 40, height: 36, borderRadius: 6, background: 'var(--stone-200)', margin: '0 auto 0.5rem', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
              <div style={{ width: 70, height: 11, borderRadius: 4, background: 'var(--stone-200)', margin: '0 auto', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gap: '0.625rem' }}>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      </main>
    </div>
  )
}
