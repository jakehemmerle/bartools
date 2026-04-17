import { SurfaceCard } from '../../../components/primitives/surface-card'

export function ReportsEmptyScreen() {
  return (
    <div className="bb-reports-empty">
      <SurfaceCard className="bb-empty-state" tone="low">
        <div className="bb-empty-state__icon" aria-hidden="true">
          ⧉
        </div>
        <h2 className="bb-empty-state__title">Reports</h2>
        <p className="bb-empty-state__body">
          No reports found. Recent reports will appear here once they are available.
        </p>
      </SurfaceCard>
    </div>
  )
}
