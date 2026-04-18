type AppWordmarkProps = {
  centered?: boolean
}

export function AppWordmark({ centered = false }: AppWordmarkProps) {
  return (
    <div className={`bt-wordmark${centered ? ' bt-wordmark--centered' : ''}`}>
      <span className="bt-wordmark__label">BARTOOLS</span>
      <span className="bt-wordmark__rule" aria-hidden="true" />
    </div>
  )
}
