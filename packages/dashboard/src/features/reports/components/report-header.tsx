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
      <header className="bb-report-header bb-report-header--inline">
        <div className="bb-report-header__headline-row">
          <h1 aria-label={heading} className="bb-page-title bb-page-title--detail">
            <span aria-hidden="true" className="bb-report-header__heading-desktop">
              {heading}
            </span>
            <span aria-hidden="true" className="bb-report-header__heading-mobile">
              {mobileHeading}
            </span>
          </h1>
          <StatusChip status={status} />
        </div>
        {mobileSupportingLine ? (
          <p aria-hidden="true" className="bb-report-header__mobile-support">
            {mobileSupportingLine}
          </p>
        ) : null}
      </header>
    )
  }

  return (
    <header className="bb-report-header">
      <div className="bb-report-header__chips">
        <StatusChip status={status} />
      </div>
      <h1 aria-label={heading} className="bb-page-title bb-page-title--detail">
        <span aria-hidden="true" className="bb-report-header__heading-desktop">
          {heading}
        </span>
        <span aria-hidden="true" className="bb-report-header__heading-mobile">
          {mobileHeading}
        </span>
      </h1>
      {mobileSupportingLine ? (
        <p aria-hidden="true" className="bb-report-header__mobile-support">
          {mobileSupportingLine}
        </p>
      ) : null}
    </header>
  )
}
