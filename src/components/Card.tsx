import type { Card as CardType } from '../types'

interface CardProps {
  card: CardType
  size?: 'xs' | 'sm' | 'md' | 'lg'
  selected?: boolean
  onClick?: () => void
}

export default function Card({ card, size = 'md', selected = false, onClick }: CardProps) {
  const sizeMap = {
    xs: { w: 38, h: 52, rankSize: '24px', suitSize: '12px' },
    sm: { w: 48, h: 66, rankSize: '32px', suitSize: '16px' },
    md: { w: 58, h: 80, rankSize: '40px', suitSize: '20px' },
    lg: { w: 70, h: 96, rankSize: '48px', suitSize: '24px' }
  }

  const { w, h, rankSize, suitSize } = sizeMap[size]

  // スートごとの色
  const suitColors: Record<string, string> = {
    '♠': '#000000',  // スペード: 黒
    '♥': '#e60000',  // ハート: 赤
    '♦': '#1e90ff',  // ダイヤ: 青
    '♣': '#00c853',  // クローバー: 緑
  }

  const suitColor = suitColors[card.suit] || '#000'

  return (
    <div
      onClick={onClick}
      style={{
        width: w,
        height: h,
        backgroundColor: 'white',
        border: selected ? '2px solid var(--gold)' : '1.5px solid #ddd',
        boxShadow: selected ? '0 0 12px var(--gold)' : '0 3px 10px rgba(0,0,0,0.5)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        position: 'relative',
      }}
      className="rounded font-bold transition-transform active:scale-95 flex items-center justify-center"
    >
      {/* 右上のスート */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          fontSize: suitSize,
          color: suitColor,
          lineHeight: 1,
        }}
      >
        {card.suit}
      </div>

      {/* 中央の数字 */}
      <div
        style={{
          fontSize: rankSize,
          color: suitColor,
          fontWeight: 'bold',
          lineHeight: 1,
        }}
      >
        {card.rank}
      </div>

      {/* 左下のスート */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '4px',
          fontSize: suitSize,
          color: suitColor,
          lineHeight: 1,
        }}
      >
        {card.suit}
      </div>
    </div>
  )
}
