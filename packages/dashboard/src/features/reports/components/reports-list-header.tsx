import { Button } from '../../../components/primitives/button'

export function ReportsListHeader() {
  return (
    <section className="bb-reports-header">
      <div className="bb-reports-header__copy">
        <h1 className="bb-page-title">Reports</h1>
        <p className="bb-reports-header__support">
          Review recent reports and open one to inspect records.
        </p>
      </div>
      <Button to="/reports/backstock/new" variant="secondary">
        New Backstock Report
      </Button>
    </section>
  )
}
