type ReportProgressPanelProps = {
  label: string
  progress: number
}

export function ReportProgressPanel({
  label,
  progress,
}: ReportProgressPanelProps) {
  return (
    <section className="bb-progress-panel">
      <div className="bb-progress-panel__meta">
        <span className="bb-field__label">Progress</span>
        <span className="bb-progress-panel__label">{label}</span>
      </div>
      <div className="bb-progress-bar" aria-hidden="true">
        <span className="bb-progress-bar__fill" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </section>
  )
}
