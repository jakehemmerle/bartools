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
      <div className="bb-reports-row__id">{report.id}</div>
      <div className="bb-reports-row__status">
        <StatusChip status={report.status} />
      </div>
      <div className="bb-reports-row__operator">{report.operator}</div>
      <div className="bb-reports-row__started">{report.startedAt}</div>
      <div className="bb-reports-row__completed">{report.completedAt}</div>
      <div className="bb-reports-row__count">{report.bottleCount}</div>
    </Link>
  )
}
