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
  onFillTenthsChange: (recordId: string, fillTenths: number) => void
  onReviewBottleChange: (recordId: string, bottleId: string) => void
  onReviewSearch: (recordId: string, query: string) => void
  onReviewSearchQueryChange: (recordId: string, query: string) => void
  onSubmitReview?: () => void
  readinessMessage: string
  reviewActionErrorMessage?: string | null
  reviewActionMode?: ReviewActionMode
  reviewDraft: ReportReviewRecordDraft[]
  reviewerUserId?: string | null
  reviewedComparisonVariant?: ComparisonCardVariant
  searchState: Record<string, RecordSearchState>
  statusMessage?: string | null
  submittingReview?: boolean
}

const incompleteReviewMessage =
  'Pick a product match and fill level for every actionable record before review can be submitted.'

export function ReportDetailScreen({
  detail,
  onFillTenthsChange,
  onReviewBottleChange,
  onReviewSearch,
  onReviewSearchQueryChange,
  onSubmitReview,
  readinessMessage,
  reviewActionErrorMessage = null,
  statusMessage = null,
  reviewedComparisonVariant,
  reviewActionMode = 'disabled',
  reviewDraft,
  reviewerUserId = null,
  searchState,
  submittingReview = false,
}: ReportDetailScreenProps) {
  const reportId = buildReportId(detail)
  const heading = buildReportHeading(detail)
  const progress = buildReportProgressView(detail)
  const submission = buildReviewSubmissionState(reviewerUserId, reviewDraft)
  const reviewAction = buildReviewActionState({
    readinessMessage,
    reviewActionMode,
    submissionReady: submission.ready,
    submittingReview,
  })

  if (detail.status === 'created') {
    return <CreatedReportDetail detail={detail} heading={heading} reportId={reportId} />
  }

  if (detail.status === 'processing') {
    return (
      <ProcessingReportDetail
        detail={detail}
        progress={progress}
        statusMessage={statusMessage}
      />
    )
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
      onReviewSubmit={onSubmitReview}
      reportId={reportId}
      onFillTenthsChange={onFillTenthsChange}
      onReviewBottleChange={onReviewBottleChange}
      onReviewSearch={onReviewSearch}
      onReviewSearchQueryChange={onReviewSearchQueryChange}
      readinessMessage={reviewAction.message}
      reviewActionDisabled={reviewAction.disabled}
      reviewActionErrorMessage={reviewActionErrorMessage}
      reviewActionMode={reviewActionMode}
      reviewDraft={reviewDraft}
      searchState={searchState}
      statusMessage={statusMessage}
      submittingReview={submittingReview}
    />
  )
}

function buildReviewActionState({
  readinessMessage,
  reviewActionMode,
  submissionReady,
  submittingReview,
}: {
  readinessMessage: string
  reviewActionMode: ReviewActionMode
  submissionReady: boolean
  submittingReview: boolean
}) {
  if (reviewActionMode === 'preview') {
    return {
      disabled: submittingReview,
      message: null,
    }
  }

  if (reviewActionMode === 'enabled') {
    return {
      disabled: !submissionReady || submittingReview,
      message: submissionReady ? null : incompleteReviewMessage,
    }
  }

  return {
    disabled: true,
    message: submissionReady ? readinessMessage : incompleteReviewMessage,
  }
}
