import type { ReportListItem } from '@bartools/types'
import { Button } from '../../../components/primitives/button'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import { ReportsEmptyScreen } from './reports-empty-screen'
import { ReportsListHeader } from './reports-list-header'
import { ReportsListRow } from './reports-list-row'
import { buildReportListRows } from '../view-models/report-list-view'

type ReportsListScreenProps = {
  errorMessage?: string | null
  onRetry?: () => void
  reports: ReportListItem[] | null
}

export function ReportsListScreen({
  errorMessage = null,
  onRetry,
  reports,
}: ReportsListScreenProps) {
  const rows = reports ? buildReportListRows(reports) : []

  return (
    <div className="bt-reports-screen">
      <ReportsListHeader />

      {errorMessage ? (
        <SurfaceCard className="bt-loading-panel" tone="low">
          <p className="bt-loading-panel__eyebrow">Reports Unavailable</p>
          <p className="bt-loading-panel__body">{errorMessage}</p>
          {onRetry ? (
            <div className="bt-loading-panel__actions">
              <Button onPress={onRetry} variant="secondary">
                Retry
              </Button>
            </div>
          ) : null}
        </SurfaceCard>
      ) : reports === null ? (
        <SurfaceCard className="bt-loading-panel" tone="low">
          <p className="bt-loading-panel__eyebrow">Reports</p>
          <p className="bt-loading-panel__body">Loading recent reports.</p>
        </SurfaceCard>
      ) : rows.length === 0 ? (
        <ReportsEmptyScreen />
      ) : (
        <section className="bt-reports-list">
          <div className="bt-reports-columns" aria-hidden="true">
            <div>Report</div>
            <div>Status</div>
            <div>Operator</div>
            <div>Started</div>
            <div>Completed</div>
            <div>Progress</div>
          </div>
          <div className="bt-reports-rows">
            {rows.map((report) => (
              <ReportsListRow key={report.id} report={report} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
