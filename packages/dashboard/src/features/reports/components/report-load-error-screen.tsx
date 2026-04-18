import { Button } from '../../../components/primitives/button'

export function ReportLoadErrorScreen({
  onRetry,
}: {
  onRetry?: () => void
}) {
  return (
    <section className="bt-centered-state bt-centered-state--not-found">
      <div className="bt-centered-state__icon bt-centered-state__icon--not-found" aria-hidden="true">
        <span className="bt-centered-state__file-icon" />
        <span className="bt-centered-state__file-badge" />
        <span className="bt-centered-state__file-badge-line bt-centered-state__file-badge-line--one" />
        <span className="bt-centered-state__file-badge-line bt-centered-state__file-badge-line--two" />
      </div>
      <h1 className="bt-centered-state__title">Report Unavailable</h1>
      <p className="bt-centered-state__body">
        This report could not be loaded right now. Return to reports and try again in a
        moment.
      </p>
      <div className="bt-centered-state__actions">
        {onRetry ? (
          <Button onPress={onRetry} variant="secondary">
            Retry
          </Button>
        ) : null}
        <Button to="/reports" variant="ghost">
          Back to Reports
        </Button>
      </div>
    </section>
  )
}
