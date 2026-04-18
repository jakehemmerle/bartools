import { StatusChip } from '../../../components/primitives/status-chip'

type ReportHeaderProps = {
  heading: string
  mobileSupportingLine?: string
  mobileTitle?: string
  status: 'created' | 'processing' | 'unreviewed' | 'reviewed'
  variant?: 'stacked' | 'inline-chip'
}

export function ReportHeader({
  heading,
  mobileSupportingLine,
  mobileTitle,
  status,
  variant = 'stacked',
}: ReportHeaderProps) {
  const mobileHeading = mobileTitle ?? heading

  if (variant === 'inline-chip') {
    return (
      <header className="bt-report-header bt-report-header--inline">
        <div className="bt-report-header__headline-row">
          <h1 aria-label={heading} className="bt-page-title bt-page-title--detail">
            <span aria-hidden="true" className="bt-report-header__heading-desktop">
              {heading}
            </span>
            <span aria-hidden="true" className="bt-report-header__heading-mobile">
              {mobileHeading}
            </span>
          </h1>
          <StatusChip status={status} />
        </div>
        {mobileSupportingLine ? (
          <p aria-hidden="true" className="bt-report-header__mobile-support">
            {mobileSupportingLine}
          </p>
        ) : null}
      </header>
    )
  }

  return (
    <header className="bt-report-header">
      <div className="bt-report-header__chips">
        <StatusChip status={status} />
      </div>
      <h1 aria-label={heading} className="bt-page-title bt-page-title--detail">
        <span aria-hidden="true" className="bt-report-header__heading-desktop">
          {heading}
        </span>
        <span aria-hidden="true" className="bt-report-header__heading-mobile">
          {mobileHeading}
        </span>
      </h1>
      {mobileSupportingLine ? (
        <p aria-hidden="true" className="bt-report-header__mobile-support">
          {mobileSupportingLine}
        </p>
      ) : null}
    </header>
  )
}
