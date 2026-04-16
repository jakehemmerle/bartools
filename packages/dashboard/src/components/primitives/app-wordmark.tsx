type AppWordmarkProps = {
  centered?: boolean
}

export function AppWordmark({ centered = false }: AppWordmarkProps) {
  return (
    <div className={`bb-wordmark${centered ? ' bb-wordmark--centered' : ''}`}>
      <span className="bb-wordmark__label">BARBACK</span>
      <span className="bb-wordmark__rule" aria-hidden="true" />
    </div>
  )
}
