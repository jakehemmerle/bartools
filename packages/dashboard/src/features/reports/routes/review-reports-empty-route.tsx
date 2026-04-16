import { ReportsListScreen } from '../components/reports-list-screen'
import { reviewReportsEmpty } from '../fixtures/review-scenarios'

export function ReviewReportsEmptyRoute() {
  return <ReportsListScreen reports={reviewReportsEmpty} />
}
