import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="nav">
        <a href="/" className="nav-logo">resolve</a>
        <Link href="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          Sign in
        </Link>
      </nav>

      <main className="container-sm" style={{ paddingTop: '5rem', paddingBottom: '4rem', flex: 1 }}>
        <div className="animate-in">
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            A better way to handle conflict
          </p>
          <h1 style={{ fontSize: '2.75rem', marginBottom: '1.25rem', lineHeight: 1.15 }}>
            Say what you mean.<br />
            <em>Without making it worse.</em>
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: 480, fontWeight: 300 }}>
            Describe what happened. Get a neutral perspective, a draft message in your voice, and — if you want — a shared space to write the resolution together.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/login" className="btn-primary">
              Get started
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>Free to use</span>
          </div>
        </div>

        <div style={{ marginTop: '5rem', display: 'grid', gap: '1rem' }}>
          {[
            { step: '01', title: 'Describe the situation', body: 'Tell us what happened, your role, and a little about the other person.' },
            { step: '02', title: 'Get a neutral read', body: 'See what both sides probably need, what triggered the escalation, and one honest blind spot.' },
            { step: '03', title: 'Pick a draft message', body: 'Choose from direct, gentle, or curious — all written to not make things worse.' },
            { step: '04', title: 'Co-draft together', body: 'Invite the other person to a shared room. Write the resolution together, with AI flagging anything inflammatory.' },
          ].map((item, i) => (
            <div key={i} className="animate-in" style={{ animationDelay: `${i * 0.06}s`, display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--text-faint)', paddingTop: '0.125rem', minWidth: 24 }}>{item.step}</span>
              <div>
                <p style={{ fontWeight: 400, marginBottom: '0.2rem' }}>{item.title}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 300 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>Built with care. Your conflicts are private.</p>
      </footer>
    </div>
  )
}
