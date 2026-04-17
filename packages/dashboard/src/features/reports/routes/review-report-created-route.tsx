import { ReviewDetailPreview } from './review-detail-preview'
import { reviewReportCreated } from '../fixtures/review-scenarios'

export function ReviewReportCreatedRoute() {
  return <ReviewDetailPreview detail={reviewReportCreated} />
}
