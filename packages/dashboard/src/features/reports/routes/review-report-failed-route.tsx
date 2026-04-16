import { ReviewDetailPreview } from './review-detail-preview'
import { reviewReportFailed } from '../fixtures/review-scenarios'

export function ReviewReportFailedRoute() {
  return <ReviewDetailPreview detail={reviewReportFailed} />
}
