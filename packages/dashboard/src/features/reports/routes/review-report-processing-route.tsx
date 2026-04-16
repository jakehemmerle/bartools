import { ReviewDetailPreview } from './review-detail-preview'
import { reviewReportProcessing } from '../fixtures/review-scenarios'

export function ReviewReportProcessingRoute() {
  return <ReviewDetailPreview detail={reviewReportProcessing} />
}
