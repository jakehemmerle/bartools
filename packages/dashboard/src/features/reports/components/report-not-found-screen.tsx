import { Button } from '../../../components/primitives/button'

export function ReportNotFoundScreen() {
  return (
    <section className="bb-centered-state bb-centered-state--not-found">
      <div className="bb-centered-state__icon bb-centered-state__icon--not-found" aria-hidden="true">
        <span className="bb-centered-state__file-icon" />
        <span className="bb-centered-state__file-badge" />
        <span className="bb-centered-state__file-badge-line bb-centered-state__file-badge-line--one" />
        <span className="bb-centered-state__file-badge-line bb-centered-state__file-badge-line--two" />
      </div>
      <h1 className="bb-centered-state__title">Report Not Found</h1>
      <p className="bb-centered-state__body">
        This report could not be found. Return to reports and choose another report.
      </p>
      <div className="bb-centered-state__actions">
        <Button to="/reports" variant="ghost">
          Back to Reports
        </Button>
      </div>
    </section>
  )
}
