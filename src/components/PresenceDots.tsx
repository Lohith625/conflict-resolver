'use client'

interface User {
  userId: string
  userName: string
}

interface Props {
  users: User[]
  maxShow?: number
}

const COLORS = [
  { bg: '#e8f4fd', text: '#1a5276', border: '#aed6f1' },
  { bg: '#eafaf1', text: '#1a6633', border: '#a9dfbf' },
  { bg: '#fef9e7', text: '#7d6608', border: '#f9e79f' },
  { bg: '#f4ecf7', text: '#6c3483', border: '#d7bde2' },
]

export function PresenceDots({ users, maxShow = 4 }: Props) {
  const visible = users.slice(0, maxShow)
  const overflow = users.length - maxShow

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {visible.map((user, i) => {
        const color = COLORS[i % COLORS.length]
        const initials = user.userName
          .split(' ')
          .map((w: string) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        return (
          <div
            key={user.userId}
            title={user.userName}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: color.bg,
              border: `1.5px solid ${color.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 500,
              color: color.text,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )
      })}
      {overflow > 0 && (
        <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>+{overflow}</span>
      )}
      {users.length === 0 && (
        <span style={{ fontSize: '12px', color: 'var(--text-faint)', fontStyle: 'italic' }}>
          Waiting for others…
        </span>
      )}
    </div>
  )
}
