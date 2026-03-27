interface CardBackProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export default function CardBack({ size = 'md' }: CardBackProps) {
  const sizeMap = {
    xs: { w: 28, h: 40 },
    sm: { w: 36, h: 50 },
    md: { w: 50, h: 68 },
    lg: { w: 62, h: 85 }
  }

  const { w, h } = sizeMap[size]

  return (
    <div
      style={{
        width: w,
        height: h,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)',
        border: '1.5px solid var(--gold-dim)',
        boxShadow: '0 3px 10px rgba(0,0,0,0.5)',
      }}
      className="rounded flex items-center justify-center"
    >
      <div style={{ color: 'var(--gold-dim)', fontSize: '20px', fontFamily: 'Cinzel' }}>
        PLO
      </div>
    </div>
  )
}
