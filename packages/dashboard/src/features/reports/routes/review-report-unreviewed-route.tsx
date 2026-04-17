import { ReviewDetailPreview } from './review-detail-preview'
import { reviewReportUnreviewed } from '../fixtures/review-scenarios'

export function ReviewReportUnreviewedRoute() {
  return <ReviewDetailPreview detail={reviewReportUnreviewed} />
}
