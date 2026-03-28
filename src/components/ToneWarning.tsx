'use client'

interface Props {
  phrase: string
  suggestion: string | null
  onDismiss: () => void
}

export function ToneWarning({ phrase, suggestion, onDismiss }: Props) {
  return (
    <div
      style={{
        background: '#fef9e7',
        border: '1px solid #f9e79f',
        borderRadius: 8,
        padding: '0.75rem 1rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}
    >
      {/* Warning icon */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
        <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="#d4ac0d" strokeWidth="1.25" fill="#fef9e7" strokeLinejoin="round"/>
        <path d="M8 6v3.5M8 11v.5" stroke="#d4ac0d" strokeWidth="1.25" strokeLinecap="round"/>
      </svg>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.8125rem', color: '#7d6608', margin: '0 0 2px', fontWeight: 400 }}>
          "<span style={{ fontStyle: 'italic' }}>{phrase}</span>" may land as accusatory
        </p>
        {suggestion && (
          <p style={{ fontSize: '0.8125rem', color: '#5d4e0a', margin: 0, fontWeight: 300 }}>
            Try: <span style={{ fontStyle: 'italic' }}>{suggestion}</span>
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#a08020',
          fontSize: 16,
          lineHeight: 1,
          padding: '0 2px',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}
