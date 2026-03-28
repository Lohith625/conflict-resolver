import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from './utils'
import { PatternSection } from '@/components/PatternSection'
import { ConflictCard } from '@/components/ConflictCard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const conflicts = await prisma.conflict.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { coSession: { select: { id: true, resolvedAt: true } } },
  })

  const analyzedCount = conflicts.filter(c => c.status !== 'DRAFT').length
  const resolvedCount = conflicts.filter(c => c.coSession?.resolvedAt || c.status === 'RESOLVED').length
  const firstName = session.user?.name?.split(' ')[0] || 'there'

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <a href="/" className="nav-logo">resolve</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{session.user?.name}</span>
          <Link href="/api/auth/signout" className="btn-ghost">Sign out</Link>
        </div>
      </nav>

      <main className="container-md" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>

        <div className="animate-in" style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Hey {firstName}</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 300, fontSize: '0.9375rem' }}>
            {conflicts.length === 0
              ? 'Nothing logged yet. When something is bothering you, bring it here.'
              : `${analyzedCount} situation${analyzedCount !== 1 ? 's' : ''} analysed${resolvedCount > 0 ? `, ${resolvedCount} resolved` : ''}.`}
          </p>
        </div>

        {conflicts.length > 0 && (
          <div
            className="animate-in animate-in-delay-1"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}
          >
            {[
              { label: 'Total logged', value: conflicts.length },
              { label: 'Analysed',     value: analyzedCount },
              { label: 'Resolved',     value: resolvedCount },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 400, marginBottom: '0.2rem' }}>{stat.value}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: conflicts.length >= 2 ? '1fr 320px' : '1fr',
          gap: '2rem',
          alignItems: 'start',
        }}>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.0625rem' }}>Your conflicts</h2>
              <Link href="/conflict/new" className="btn-primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
                New
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </Link>
            </div>

            {conflicts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontStyle: 'italic', color: 'var(--stone-400)', marginBottom: '0.75rem' }}>
                  Nothing yet
                </p>
                <p style={{ color: 'var(--text-faint)', fontSize: '0.875rem', fontWeight: 300, marginBottom: '1.5rem' }}>
                  When something is bothering you, bring it here.
                </p>
                <Link href="/conflict/new" className="btn-secondary">Describe a situation</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.625rem' }}>
                {conflicts.map((c) => {
                  const isResolved = c.coSession?.resolvedAt || c.status === 'RESOLVED'
                  const statusLabel = isResolved ? 'resolved' : c.status.toLowerCase()
                  return (
                    <ConflictCard
                      key={c.id}
                      id={c.id}
                      title={c.title}
                      timeAgo={formatDistanceToNow(c.createdAt)}
                      statusLabel={statusLabel}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {conflicts.length >= 2 && (
            <div className="animate-in animate-in-delay-2">
              <PatternSection />
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
