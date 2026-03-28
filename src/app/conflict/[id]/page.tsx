import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { DraftPicker } from '@/components/DraftPicker'
import { ShareButton } from '@/components/ShareButton'

export default async function ConflictPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const conflict = await prisma.conflict.findUnique({
    where: { id: params.id },
    include: { coSession: true },
  })

  if (!conflict || conflict.userId !== session.user.id) notFound()

  const analysis = conflict.analysis as any
  const drafts = conflict.drafts as any

  const insights = [
    { label: 'What you probably need',         value: analysis?.their_underlying_need,    color: '#e8f4fd', textColor: '#1a5276' },
    { label: 'What they probably feel',         value: analysis?.other_party_likely_feels, color: '#eafaf1', textColor: '#1a6633' },
    { label: 'What triggered the escalation',   value: analysis?.escalation_trigger,       color: '#fef9e7', textColor: '#7d6608' },
    { label: 'Where you both agree',            value: analysis?.common_ground,            color: '#f4ecf7', textColor: '#6c3483' },
    { label: 'Your honest blind spot',          value: analysis?.blind_spot,               color: '#fdf2f8', textColor: '#922b21' },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <a href="/" className="nav-logo">resolve</a>
        <Link href="/dashboard" className="btn-ghost">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          All conflicts
        </Link>
      </nav>

      <main className="container-md" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>

        {/* Header */}
        <div className="animate-in" style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
            Analysis
          </p>
          <h1 style={{ fontSize: '1.625rem', marginBottom: '0.375rem' }}>
            {conflict.title}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 300 }}>
            {new Date(conflict.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Original description — collapsed */}
        <details className="animate-in animate-in-delay-1 card-subtle" style={{ marginBottom: '2rem', cursor: 'pointer' }}>
          <summary style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400, userSelect: 'none', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            What you wrote
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </summary>
          <p style={{ marginTop: '0.875rem', fontSize: '0.9rem', color: 'var(--stone-600)', fontWeight: 300, lineHeight: 1.7 }}>
            {conflict.description}
          </p>
        </details>

        {/* Perspective insights */}
        <section className="animate-in animate-in-delay-2" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Neutral perspective</h2>
          <div style={{ display: 'grid', gap: '0.625rem' }}>
            {insights.map((item, i) => (
              item.value && (
                <div
                  key={i}
                  style={{
                    background: item.color,
                    borderRadius: 10,
                    padding: '1rem 1.125rem',
                    display: 'grid',
                    gap: '0.3rem',
                  }}
                >
                  <p style={{ fontSize: '0.75rem', fontWeight: 500, color: item.textColor, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.75 }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '0.9375rem', color: item.textColor, fontWeight: 300, lineHeight: 1.6 }}>
                    {item.value}
                  </p>
                </div>
              )
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* Draft message picker */}
        {drafts && (
          <section className="animate-in animate-in-delay-3" style={{ marginBottom: '2.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Draft messages</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                Three versions — pick the one that feels right, or mix and match.
              </p>
            </div>
            <DraftPicker drafts={drafts} />
          </section>
        )}

        <hr className="divider" />

        {/* Co-draft CTA */}
        <section className="animate-in animate-in-delay-4">
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: '1.0625rem', marginBottom: '0.3rem' }}>Write it together</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 300, maxWidth: 360 }}>
                Invite the other person to a shared room. Both of you type, AI flags anything inflammatory in real time.
              </p>
            </div>
            <ShareButton conflictId={conflict.id} existingSessionId={conflict.coSession?.id} />
          </div>
        </section>

      </main>
    </div>
  )
}
