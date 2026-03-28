import { SkeletonAnalysis, SkeletonDraft } from '@/components/Skeletons'

export default function ConflictLoading() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <a href="/" className="nav-logo">resolve</a>
      </nav>
      <main className="container-md" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <style>{`@keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ width: 80, height: 11, borderRadius: 4, background: 'var(--stone-200)', marginBottom: '0.75rem', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
          <div style={{ width: 280, height: 26, borderRadius: 6, background: 'var(--stone-200)', marginBottom: '0.5rem', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
          <div style={{ width: 120, height: 13, borderRadius: 4, background: 'var(--stone-200)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ width: 160, height: 18, borderRadius: 6, background: 'var(--stone-200)', marginBottom: '1rem', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
          <SkeletonAnalysis />
        </div>

        <hr className="divider" />

        <div>
          <div style={{ width: 140, height: 18, borderRadius: 6, background: 'var(--stone-200)', marginBottom: '1rem', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
          <SkeletonDraft />
        </div>
      </main>
    </div>
  )
}
