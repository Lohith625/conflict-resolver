'use client'

import Link from 'next/link'

interface Props {
  id: string
  title: string
  timeAgo: string
  statusLabel: string
}

export function ConflictCard({ id, title, timeAgo, statusLabel }: Props) {
  return (
    <Link href={`/conflict/${id}`} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          transition: 'border-color 0.15s',
          cursor: 'pointer',
          padding: '1rem 1.25rem',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--stone-300)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
      >
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontWeight: 400,
            marginBottom: '0.15rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '0.9375rem',
          }}>
            {title || 'Untitled conflict'}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 300 }}>
            {timeAgo}
          </p>
        </div>
        <span className={`badge badge-${statusLabel}`}>{statusLabel}</span>
      </div>
    </Link>
  )
}
