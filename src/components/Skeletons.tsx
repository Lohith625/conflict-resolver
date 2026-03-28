'use client'

interface Props {
  lines?: number
  style?: React.CSSProperties
}

function SkeletonLine({ width = '100%', height = 16 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: 'var(--stone-200)',
        animation: 'skeleton-pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
      <div style={{ flex: 1, display: 'grid', gap: '0.5rem' }}>
        <SkeletonLine width="60%" height={14} />
        <SkeletonLine width="30%" height={11} />
      </div>
      <SkeletonLine width={64} height={22} />
    </div>
  )
}

export function SkeletonAnalysis() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      {[80, 65, 75, 70, 85].map((w, i) => (
        <div key={i} style={{ borderRadius: 10, padding: '1rem 1.125rem', background: 'var(--bg-subtle)', display: 'grid', gap: '0.5rem' }}>
          <SkeletonLine width="30%" height={10} />
          <SkeletonLine width={`${w}%`} height={14} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonDraft() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <style>{`@keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[1, 2, 3].map(i => <SkeletonLine key={i} width={90} height={52} />)}
      </div>
      <div style={{ borderRadius: 10, padding: '1.25rem', background: 'var(--bg-subtle)', display: 'grid', gap: '0.5rem' }}>
        <SkeletonLine width="90%" height={14} />
        <SkeletonLine width="75%" height={14} />
        <SkeletonLine width="60%" height={14} />
      </div>
    </div>
  )
}

export function PageSpinner({ message = 'Loading…' }: { message?: string }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ animation: 'spin 0.9s linear infinite' }}>
        <circle cx="14" cy="14" r="11" stroke="var(--stone-200)" strokeWidth="2.5"/>
        <path d="M14 3 A11 11 0 0 1 25 14" stroke="var(--stone-600)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-faint)', fontStyle: 'italic' }}>{message}</p>
    </div>
  )
}
