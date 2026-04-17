import { Button } from '../../../components/primitives/button'

export function ReportLoadErrorScreen() {
  return (
    <section className="bb-centered-state bb-centered-state--not-found">
      <div className="bb-centered-state__icon bb-centered-state__icon--not-found" aria-hidden="true">
        <span className="bb-centered-state__file-icon" />
        <span className="bb-centered-state__file-badge" />
        <span className="bb-centered-state__file-badge-line bb-centered-state__file-badge-line--one" />
        <span className="bb-centered-state__file-badge-line bb-centered-state__file-badge-line--two" />
      </div>
      <h1 className="bb-centered-state__title">Report Unavailable</h1>
      <p className="bb-centered-state__body">
        This report could not be loaded right now. Return to reports and try again in a
        moment.
      </p>
      <div className="bb-centered-state__actions">
        <Button to="/reports" variant="ghost">
          Back to Reports
        </Button>
      </div>
    </section>
  )
}
