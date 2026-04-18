type ReportProgressPanelProps = {
  label: string
  progress: number
}

export function ReportProgressPanel({
  label,
  progress,
}: ReportProgressPanelProps) {
  const progressPercent = Math.max(0, Math.min(100, Math.round(progress * 100)))

  return (
    <section className="bt-progress-panel">
      <div className="bt-progress-panel__meta">
        <span className="bt-field__label">Progress</span>
        <span className="bt-progress-panel__label">{label}</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progressPercent}
        className="bt-progress-bar"
        role="progressbar"
      >
        <span className="bt-progress-bar__fill" style={{ width: `${progressPercent}%` }} />
      </div>
    </section>
  )
}
