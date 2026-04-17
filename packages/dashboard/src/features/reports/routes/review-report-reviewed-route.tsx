import { ReviewDetailPreview } from './review-detail-preview'
import { reviewReportReviewed } from '../fixtures/review-scenarios'

export function ReviewReportReviewedRoute() {
  return <ReviewDetailPreview detail={reviewReportReviewed} />
}
