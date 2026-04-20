import { Button } from '../../../components/primitives/button'

export function ReportsListHeader({
  showBackstockAction,
}: {
  showBackstockAction: boolean
}) {
  return (
    <section className="bt-reports-header">
      <div className="bt-reports-header__copy">
        <h1 className="bt-page-title">Reports</h1>
        <p className="bt-reports-header__support">
          Review recent reports and open one to inspect records.
        </p>
      </div>
      {showBackstockAction ? (
        <Button to="/reports/backstock/new" variant="secondary">
          New Backstock Report
        </Button>
      ) : null}
    </section>
  )
}
