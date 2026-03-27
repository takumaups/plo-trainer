interface PanelProps {
  children: React.ReactNode
  className?: string
}

export default function Panel({ children, className = '' }: PanelProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
      className={`rounded-lg p-4 ${className}`}
    >
      {children}
    </div>
  )
}
