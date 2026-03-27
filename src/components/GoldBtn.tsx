interface GoldBtnProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'outline'
  disabled?: boolean
  fullWidth?: boolean
}

export default function GoldBtn({
  children,
  onClick,
  variant = 'default',
  disabled = false,
  fullWidth = false
}: GoldBtnProps) {
  const baseStyle = {
    fontFamily: 'Cinzel, serif',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }

  const variantStyle = variant === 'outline'
    ? {
        background: 'transparent',
        color: 'var(--gold)',
        border: '2px solid var(--gold)',
      }
    : {
        background: 'linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 100%)',
        color: '#1a1010',
        border: 'none',
      }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...baseStyle, ...variantStyle, minHeight: '44px' }}
      className={`py-3 px-6 rounded-lg font-semibold transition-all active:scale-95 ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  )
}
