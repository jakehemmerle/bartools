import { ReportsListScreen } from '../components/reports-list-screen'
import { reviewReportsList } from '../fixtures/review-scenarios'

export function ReviewReportsListRoute() {
  return <ReportsListScreen reports={reviewReportsList} />
}
