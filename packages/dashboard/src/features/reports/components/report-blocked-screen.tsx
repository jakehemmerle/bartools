import { Button } from '../../../components/primitives/button'

export function ReportBlockedScreen() {
  return (
    <section className="bb-centered-state">
      <div className="bb-centered-state__icon bb-centered-state__icon--blocked" aria-hidden="true">
        <span className="bb-centered-state__icon-core" />
        <span className="bb-centered-state__icon-dot" />
        <span className="bb-centered-state__icon-slash" />
      </div>
      <h1 className="bb-centered-state__title">Access Unavailable</h1>
      <p className="bb-centered-state__body">
        Live report access requires venue and user context. Review submission requires user
        context.
      </p>
      <div className="bb-centered-state__divider" aria-hidden="true" />
      <div className="bb-centered-state__actions">
        <Button disabled fullWidth variant="secondary">
          Submit Review
        </Button>
        <Button fullWidth to="/reports" variant="ghost">
          Back to Reports
        </Button>
      </div>
    </section>
  )
}
