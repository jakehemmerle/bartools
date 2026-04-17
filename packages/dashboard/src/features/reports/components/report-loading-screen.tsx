import { SurfaceCard } from '../../../components/primitives/surface-card'

export function ReportLoadingScreen() {
  return (
    <div className="bb-report-screen">
      <SurfaceCard className="bb-loading-panel" tone="low">
        <p className="bb-loading-panel__eyebrow">Report</p>
        <p className="bb-loading-panel__body">Loading report details.</p>
      </SurfaceCard>
    </div>
  )
}
