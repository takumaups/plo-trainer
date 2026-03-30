interface PokerTableProps {
  playerCount: number
  activePositions?: number[]
}

// 人数別ポジション定義（BTNから始まり時計回りにSB→BB→UTG→...→CO）
const POSITIONS_BY_COUNT: Record<number, string[]> = {
  2: ['BTN', 'BB'],
  3: ['BTN', 'SB', 'BB'],
  4: ['BTN', 'SB', 'BB', 'UTG'],
  5: ['BTN', 'SB', 'BB', 'UTG', 'CO'],
  6: ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'],
  7: ['BTN', 'SB', 'BB', 'UTG', 'LJ', 'HJ', 'CO'],
  8: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'LJ', 'HJ', 'CO'],
  9: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'LJ', 'MP', 'HJ', 'CO'],
}

export default function PokerTable({ playerCount, activePositions = [] }: PokerTableProps) {
  const positions = POSITIONS_BY_COUNT[playerCount] ?? POSITIONS_BY_COUNT[6]

  // BTNを下（6時）に固定し、時計回りにSB→BB→UTG→...→CO
  const getPosition = (index: number, total: number) => {
    // BTN(index=0)を下（π/2）に置き、時計回り
    const angle = Math.PI / 2 + (index / total) * 2 * Math.PI
    const rx = 155
    const ry = 90
    const cx = 200
    const cy = 115
    const x = cx + rx * Math.cos(angle)
    const y = cy + ry * Math.sin(angle)
    return { x, y }
  }

  return (
    <svg viewBox="0 0 400 240" className="w-full max-w-md mx-auto">
      <defs>
        <radialGradient id="feltGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e5c1e" />
          <stop offset="100%" stopColor="#0c2a0c" />
        </radialGradient>
      </defs>

      {/* テーブル外枠（木の縁） */}
      <ellipse cx="200" cy="115" rx="185" ry="108" fill="#5c3d1e" />

      {/* テーブルフェルト */}
      <ellipse
        cx="200"
        cy="115"
        rx="170"
        ry="95"
        fill="url(#feltGradient)"
        stroke="var(--gold)"
        strokeWidth="2"
      />

      {/* 中央のPLOテキスト */}
      <text
        x="200"
        y="122"
        textAnchor="middle"
        fill="rgba(201,168,76,0.35)"
        fontSize="28"
        fontFamily="Cinzel"
        fontWeight="bold"
      >
        PLO
      </text>

      {/* プレイヤーシート */}
      {positions.map((pos, idx) => {
        const { x, y } = getPosition(idx, playerCount)
        const isActive = activePositions.includes(idx)
        const isBtn = pos === 'BTN'
        // ポジション名が長い場合（UTG+1など）はフォント小さく
        const fontSize = pos.length > 3 ? '8' : '9'

        return (
          <g key={idx}>
            {/* BTNはディーラーボタン風に */}
            <circle
              cx={x}
              cy={y}
              r="19"
              fill={isActive ? 'var(--gold)' : isBtn ? '#2a2a2a' : '#1a1a1a'}
              stroke={isBtn ? 'var(--gold-light)' : 'var(--gold)'}
              strokeWidth={isBtn ? '2.5' : '1.5'}
            />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fill={isActive ? '#111' : isBtn ? 'var(--gold-light)' : 'var(--gold)'}
              fontSize={fontSize}
              fontFamily="Cinzel"
              fontWeight="700"
            >
              {pos}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
