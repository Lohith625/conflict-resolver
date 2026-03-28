'use client'

interface Props {
  score: number // 1-10
}

export function ToneMeter({ score }: Props) {
  const pct = Math.round((score / 10) * 100)

  const getColor = () => {
    if (score <= 3) return { bar: '#e74c3c', label: 'Inflammatory', labelColor: '#922b21' }
    if (score <= 5) return { bar: '#e67e22', label: 'Tense',        labelColor: '#784212' }
    if (score <= 7) return { bar: '#f1c40f', label: 'Neutral',      labelColor: '#7d6608' }
    return               { bar: '#2ecc71', label: 'Constructive',  labelColor: '#1a6633' }
  }

  const { bar, label, labelColor } = getColor()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>Tone</span>
      <div style={{ flex: 1, height: 5, background: 'var(--stone-200)', borderRadius: 10, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: bar,
            borderRadius: 10,
            transition: 'width 0.4s ease, background 0.4s ease',
          }}
        />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 500, color: labelColor, minWidth: 80, textAlign: 'right' }}>
        {label}
      </span>
    </div>
  )
}
