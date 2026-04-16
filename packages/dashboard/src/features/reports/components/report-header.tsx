import { StatusChip } from '../../../components/primitives/status-chip'

type ReportHeaderProps = {
  heading: string
  status: 'created' | 'processing' | 'unreviewed' | 'reviewed'
}

export function ReportHeader({ heading, status }: ReportHeaderProps) {
  return (
    <header className="bb-report-header">
      <h1 className="bb-page-title bb-page-title--detail">{heading}</h1>
      <div className="bb-report-header__chips">
        <StatusChip status={status} />
      </div>
    </header>
  )
}
