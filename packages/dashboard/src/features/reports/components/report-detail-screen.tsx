import type { ReportDetail } from '@bartools/types'
import type { ReportReviewRecordDraft } from '../../../lib/reports/review-draft'
import type { RecordSearchState } from './report-bottle-match-field'
import type { ComparisonCardVariant } from './report-comparison-record-card'
import {
  buildReportId,
  buildReportHeading,
  buildReportProgressView,
  buildReviewSubmissionState,
} from '../view-models/report-detail-view'
import {
  CreatedReportDetail,
  ProcessingReportDetail,
  ReviewedReportDetail,
  ReviewableReportDetail,
  type ReviewActionMode,
} from './report-detail-content'

type ReportDetailScreenProps = {
  detail: ReportDetail
  reviewDraft: ReportReviewRecordDraft[]
  searchState: Record<string, RecordSearchState>
  onFillTenthsChange: (recordId: string, fillTenths: number) => void
  onReviewSearch: (recordId: string, query: string) => void
  onReviewSearchQueryChange: (recordId: string, query: string) => void
  onReviewBottleChange: (recordId: string, bottleId: string) => void
  readinessMessage: string
  reviewActionMode?: ReviewActionMode
  reviewedComparisonVariant?: ComparisonCardVariant
}

export function ReportDetailScreen({
  detail,
  onFillTenthsChange,
  onReviewBottleChange,
  onReviewSearch,
  onReviewSearchQueryChange,
  readinessMessage,
  reviewedComparisonVariant,
  reviewActionMode = 'integration-blocked',
  reviewDraft,
  searchState,
}: ReportDetailScreenProps) {
  const reportId = buildReportId(detail)
  const heading = buildReportHeading(detail)
  const progress = buildReportProgressView(detail)
  const submission = buildReviewSubmissionState(detail, reviewDraft)
  const reviewActionDisabled = reviewActionMode !== 'preview'
  const reviewActionMessage =
    reviewActionMode === 'preview'
      ? null
      : submission.ready
        ? readinessMessage
        : 'Pick a product match and fill level for every actionable record before review can be submitted.'

  if (detail.status === 'created') {
    return <CreatedReportDetail detail={detail} heading={heading} reportId={reportId} />
  }

  if (detail.status === 'processing') {
    return <ProcessingReportDetail detail={detail} progress={progress} />
  }

  if (detail.status === 'reviewed') {
    return (
      <ReviewedReportDetail
        comparisonVariant={reviewedComparisonVariant}
        detail={detail}
        heading={heading}
        reportId={reportId}
      />
    )
  }

  return (
    <ReviewableReportDetail
      detail={detail}
      heading={heading}
      reportId={reportId}
      onFillTenthsChange={onFillTenthsChange}
      onReviewBottleChange={onReviewBottleChange}
      onReviewSearch={onReviewSearch}
      onReviewSearchQueryChange={onReviewSearchQueryChange}
      readinessMessage={reviewActionMessage}
      reviewActionDisabled={reviewActionDisabled}
      reviewActionMode={reviewActionMode}
      reviewDraft={reviewDraft}
      searchState={searchState}
    />
  )
}
