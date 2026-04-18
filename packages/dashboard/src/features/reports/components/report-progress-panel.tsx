type ReportProgressPanelProps = {
  label: string
  progress: number
}

export function ReportProgressPanel({
  label,
  progress,
}: ReportProgressPanelProps) {
  const progressPercent = Math.round(progress * 100)

  return (
    <section className="bb-progress-panel">
      <div className="bb-progress-panel__meta">
        <span className="bb-field__label">Progress</span>
        <span className="bb-progress-panel__label">{label}</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progressPercent}
        className="bb-progress-bar"
        role="progressbar"
      >
        <span className="bb-progress-bar__fill" style={{ width: `${progressPercent}%` }} />
      </div>
    </section>
  )
}
