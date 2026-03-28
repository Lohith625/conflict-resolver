'use client'

import { useState } from 'react'

interface Drafts {
  direct: string
  gentle: string
  curious: string
}

const VARIANTS = [
  {
    key: 'direct' as const,
    label: 'Direct',
    description: 'Honest and clear',
    accent: '#44403c',
    bg: '#f5f5f4',
  },
  {
    key: 'gentle' as const,
    label: 'Gentle',
    description: 'Leads with empathy',
    accent: '#1a6633',
    bg: '#eafaf1',
  },
  {
    key: 'curious' as const,
    label: 'Curious',
    description: 'Opens with a question',
    accent: '#1a5276',
    bg: '#e8f4fd',
  },
]

export function DraftPicker({ drafts }: { drafts: Drafts }) {
  const [active, setActive] = useState<'direct' | 'gentle' | 'curious'>('gentle')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(drafts[active])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const variant = VARIANTS.find(v => v.key === active)!

  return (
    <div>
      {/* Tone selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {VARIANTS.map(v => (
          <button
            key={v.key}
            onClick={() => setActive(v.key)}
            style={{
              padding: '0.5rem 1.125rem',
              borderRadius: 8,
              border: active === v.key ? `1.5px solid ${v.accent}` : '1px solid var(--border)',
              background: active === v.key ? v.bg : 'white',
              color: active === v.key ? v.accent : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-body)',
              fontWeight: active === v.key ? 400 : 300,
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <span style={{ fontWeight: 500 }}>{v.label}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{v.description}</span>
          </button>
        ))}
      </div>

      {/* Draft text */}
      <div
        style={{
          background: variant.bg,
          border: `1px solid ${variant.accent}22`,
          borderRadius: 10,
          padding: '1.25rem 1.375rem',
          position: 'relative',
        }}
      >
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--stone-700)',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            lineHeight: 1.75,
            margin: 0,
            paddingRight: '2.5rem',
          }}
        >
          {drafts[active]}
        </p>

        {/* Copy button */}
        <button
          onClick={copy}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-body)',
            color: copied ? variant.accent : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            fontWeight: copied ? 500 : 300,
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: '0.625rem', fontWeight: 300 }}>
        Copy and send it as-is, or use it as a starting point.
      </p>
    </div>
  )
}
