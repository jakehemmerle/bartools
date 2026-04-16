import { Button } from '../../../components/primitives/button'
import { AppWordmark } from '../../../components/primitives/app-wordmark'

export function EntryScreen() {
  return (
    <section className="bb-entry">
      <AppWordmark centered />

      <div className="bb-entry__copy">
        <h1 className="bb-entry__headline">Reports Workbench</h1>
        <p className="bb-entry__support">
          Open recent reports and inspect records from desktop.
        </p>
      </div>

      <div className="bb-entry__actions">
        <Button to="/reports" variant="primary">
          <span>Open Reports</span>
          <span aria-hidden="true">→</span>
        </Button>
        <p className="bb-entry__note">Live access requires venue and user context.</p>
      </div>
    </section>
  )
}
