'use client'

import { useState } from 'react'

interface PatternResult {
  recurring_theme: string
  common_trigger: string
  your_pattern: string
  honest_insight: string
  one_thing_to_try: string
}

export function PatternSection() {
  const [data, setData] = useState<PatternResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/patterns', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setData(json)
      setRevealed(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const insights = data ? [
    { label: 'Recurring theme',  value: data.recurring_theme,  color: '#f4ecf7', text: '#6c3483' },
    { label: 'Common trigger',   value: data.common_trigger,   color: '#fef9e7', text: '#7d6608' },
    { label: 'Your pattern',     value: data.your_pattern,     color: '#eafaf1', text: '#1a6633' },
    { label: 'Honest insight',   value: data.honest_insight,   color: '#fdf2f8', text: '#922b21' },
    { label: 'One thing to try', value: data.one_thing_to_try, color: '#e8f4fd', text: '#1a5276' },
  ] : []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.0625rem' }}>Your patterns</h2>
        {data && (
          <button
            onClick={load}
            disabled={loading}
            className="btn-ghost"
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
          >
            Refresh
          </button>
        )}
      </div>

      {!revealed ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--stone-500)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            What do your conflicts say about you?
          </p>
          <p style={{ fontSize: '0.8375rem', color: 'var(--text-faint)', fontWeight: 300, marginBottom: '1.25rem', lineHeight: 1.6 }}>
            AI analyses your past conflicts and finds honest patterns — triggers, blind spots, recurring themes.
          </p>
          <button
            onClick={load}
            disabled={loading}
            className="btn-secondary"
            style={{ width: '100%' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="18 12" strokeLinecap="round"/>
                </svg>
                Analysing…
              </span>
            ) : 'See my patterns'}
          </button>
          {error && (
            <p style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: '0.75rem' }}>{error}</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.625rem' }}>
          {insights.map((item, i) => (
            <div
              key={i}
              style={{
                background: item.color,
                borderRadius: 10,
                padding: '0.875rem 1rem',
                animation: `fadeUp 0.3s ease both`,
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
              <p style={{ fontSize: '0.7rem', fontWeight: 500, color: item.text, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7, marginBottom: '0.3rem' }}>
                {item.label}
              </p>
              <p style={{ fontSize: '0.875rem', color: item.text, fontWeight: 300, lineHeight: 1.55, margin: 0 }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
