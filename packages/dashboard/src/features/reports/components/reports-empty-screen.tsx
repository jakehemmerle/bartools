import { Button } from '../../../components/primitives/button'
import { SurfaceCard } from '../../../components/primitives/surface-card'

export function ReportsEmptyScreen() {
  return (
    <div className="bt-reports-empty">
      <SurfaceCard className="bt-empty-state" tone="low">
        <div className="bt-empty-state__icon" aria-hidden="true">
          ⧉
        </div>
        <h2 className="bt-empty-state__title">Reports</h2>
        <p className="bt-empty-state__body">
          No reports found. Recent reports will appear here once they are available.
        </p>
        <div className="bt-loading-panel__actions">
          <Button to="/reports/backstock/new" variant="secondary">
            New Backstock Report
          </Button>
        </div>
      </SurfaceCard>
    </div>
  )
}
