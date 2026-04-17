import { Link } from 'react-router-dom'
import { StatusChip } from '../../../components/primitives/status-chip'
import type { ReportListRowView } from '../view-models/report-list-view'

type ReportsListRowProps = {
  report: ReportListRowView
}

export function ReportsListRow({ report }: ReportsListRowProps) {
  return (
    <Link className="bb-reports-row" to={`/reports/${report.id}`}>
      <span className="bb-reports-row__hoverrail" aria-hidden="true" />
      <div className="bb-reports-row__id">
        <span className="bb-reports-row__field-label">Report ID</span>
        <span className="bb-reports-row__field-value">{report.id}</span>
      </div>
      <div className="bb-reports-row__status">
        <StatusChip status={report.status} />
      </div>
      <div className="bb-reports-row__operator">
        <span className="bb-reports-row__field-label">Operator</span>
        <span className="bb-reports-row__field-value">{report.operator}</span>
      </div>
      <div className="bb-reports-row__started">
        <span className="bb-reports-row__field-label">Started</span>
        <span className="bb-reports-row__field-value">{report.startedAt}</span>
      </div>
      <div className="bb-reports-row__completed">
        <span className="bb-reports-row__field-label">Completed</span>
        <span className="bb-reports-row__field-value">{report.completedAt}</span>
      </div>
      <div className="bb-reports-row__count">
        <span className="bb-reports-row__field-label">Bottles</span>
        <span className="bb-reports-row__count-value">{report.bottleCount}</span>
      </div>
    </Link>
  )
}
