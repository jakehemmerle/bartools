import { SurfaceCard } from '../../../components/primitives/surface-card'

export function ReportLoadingScreen() {
  return (
    <div className="bt-report-screen">
      <SurfaceCard className="bt-loading-panel" tone="low">
        <p className="bt-loading-panel__eyebrow">Report</p>
        <p className="bt-loading-panel__body">Loading report details.</p>
      </SurfaceCard>
    </div>
  )
}
