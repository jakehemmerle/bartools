import { Link } from 'react-router-dom'
import { StatusChip } from '../../../components/primitives/status-chip'
import type { ReportListRowView } from '../view-models/report-list-view'

type ReportsListRowProps = {
  report: ReportListRowView
}

export function ReportsListRow({ report }: ReportsListRowProps) {
  return (
    <Link className="bt-reports-row" to={`/reports/${report.id}`}>
      <span className="bt-reports-row__hoverrail" aria-hidden="true" />
      <div className="bt-reports-row__id">
        <span className="bt-reports-row__field-label">Report</span>
        <span className="bt-reports-row__field-value">{report.id}</span>
        <span className="bt-reports-row__field-detail">{report.location}</span>
      </div>
      <div className="bt-reports-row__status">
        <StatusChip status={report.status} />
      </div>
      <div className="bt-reports-row__operator">
        <span className="bt-reports-row__field-label">Operator</span>
        <span className="bt-reports-row__field-value">{report.operator}</span>
      </div>
      <div className="bt-reports-row__started">
        <span className="bt-reports-row__field-label">Started</span>
        <span className="bt-reports-row__field-value">{report.startedAt}</span>
      </div>
      <div className="bt-reports-row__completed">
        <span className="bt-reports-row__field-label">Completed</span>
        <span className="bt-reports-row__field-value">{report.completedAt}</span>
      </div>
      <div className="bt-reports-row__count">
        <span className="bt-reports-row__field-label">Progress</span>
        <span className="bt-reports-row__count-value">{report.progressLabel}</span>
        <span className="bt-reports-row__count-detail">{report.bottleCountLabel}</span>
      </div>
    </Link>
  )
}
