import { Button } from '../../../components/primitives/button'
import { AppWordmark } from '../../../components/primitives/app-wordmark'

export function EntryScreen() {
  return (
    <section className="bt-entry">
      <AppWordmark centered />

      <div className="bt-entry__copy">
        <h1 className="bt-entry__headline">Reports Workbench</h1>
        <p className="bt-entry__support">
          Open recent reports and inspect records from desktop.
        </p>
      </div>

      <div className="bt-entry__actions">
        <Button to="/reports" variant="primary">
          <span>Open Reports</span>
          <span aria-hidden="true">→</span>
        </Button>
        <p className="bt-entry__note">Live access requires venue and user context.</p>
      </div>
    </section>
  )
}
