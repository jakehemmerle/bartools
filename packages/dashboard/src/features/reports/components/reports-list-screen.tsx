import type { ReportListItem } from '@bartools/types'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import { ReportsEmptyScreen } from './reports-empty-screen'
import { ReportsListHeader } from './reports-list-header'
import { ReportsListRow } from './reports-list-row'
import { buildReportListRows } from '../view-models/report-list-view'

type ReportsListScreenProps = {
  errorMessage?: string | null
  reports: ReportListItem[] | null
}

export function ReportsListScreen({ errorMessage = null, reports }: ReportsListScreenProps) {
  const rows = reports ? buildReportListRows(reports) : []

  return (
    <div className="bb-reports-screen">
      <ReportsListHeader />

      {errorMessage ? (
        <SurfaceCard className="bb-loading-panel" tone="low">
          <p className="bb-loading-panel__eyebrow">Reports Unavailable</p>
          <p className="bb-loading-panel__body">{errorMessage}</p>
        </SurfaceCard>
      ) : reports === null ? (
        <SurfaceCard className="bb-loading-panel" tone="low">
          <p className="bb-loading-panel__eyebrow">Reports</p>
          <p className="bb-loading-panel__body">Loading recent reports.</p>
        </SurfaceCard>
      ) : rows.length === 0 ? (
        <ReportsEmptyScreen />
      ) : (
        <section className="bb-reports-list">
          <div className="bb-reports-columns" aria-hidden="true">
            <div>Report ID</div>
            <div>Status</div>
            <div>Operator</div>
            <div>Started</div>
            <div>Completed</div>
            <div>Bottle Count</div>
          </div>
          <div className="bb-reports-rows">
            {rows.map((report) => (
              <ReportsListRow key={report.id} report={report} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
