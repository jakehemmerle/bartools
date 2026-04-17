import { ReviewDetailPreview } from './review-detail-preview'
import { reviewReportComparison } from '../fixtures/review-scenarios'

export function ReviewReportComparisonRoute() {
  return <ReviewDetailPreview detail={reviewReportComparison} reviewedComparisonVariant="hero" />
}
