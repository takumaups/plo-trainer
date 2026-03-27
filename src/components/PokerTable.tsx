interface PokerTableProps {
  playerCount: number
  activePositions?: number[]
}

export default function PokerTable({ playerCount, activePositions = [] }: PokerTableProps) {
  const positions = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'MP+1', 'CO', 'HJ']
  const displayPositions = positions.slice(0, playerCount)

  // プレイヤーの座席位置を楕円上に配置
  const getPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2
    const rx = 140
    const ry = 80
    const x = 200 + rx * Math.cos(angle)
    const y = 120 + ry * Math.sin(angle)
    return { x, y }
  }

  return (
    <svg viewBox="0 0 400 240" className="w-full max-w-md mx-auto">
      <defs>
        <radialGradient id="feltGradient">
          <stop offset="0%" stopColor="#1e4d1e" />
          <stop offset="100%" stopColor="#0f2a0f" />
        </radialGradient>
      </defs>

      {/* テーブル */}
      <ellipse
        cx="200"
        cy="120"
        rx="180"
        ry="100"
        fill="url(#feltGradient)"
        stroke="var(--gold)"
        strokeWidth="2.5"
      />

      {/* 中央のPLOテキスト */}
      <text
        x="200"
        y="130"
        textAnchor="middle"
        fill="var(--gold-dim)"
        fontSize="32"
        fontFamily="Cinzel"
        fontWeight="bold"
      >
        PLO
      </text>

      {/* プレイヤーシート */}
      {displayPositions.map((pos, idx) => {
        const { x, y } = getPosition(idx, playerCount)
        const isActive = activePositions.includes(idx)

        return (
          <g key={idx}>
            <circle
              cx={x}
              cy={y}
              r="20"
              fill={isActive ? 'var(--gold)' : '#111'}
              stroke="var(--gold)"
              strokeWidth="2"
            />
            <text
              x={x}
              y={y + 5}
              textAnchor="middle"
              fill={isActive ? '#111' : 'var(--gold)'}
              fontSize="10"
              fontFamily="Cinzel"
              fontWeight="600"
            >
              {pos}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
