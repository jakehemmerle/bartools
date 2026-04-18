import type { ReportDetail } from '@bartools/types'
import { Button } from '../../../components/primitives/button'
import { SectionEyebrow } from '../../../components/primitives/section-eyebrow'
import { StatusChip } from '../../../components/primitives/status-chip'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import type { ReportReviewRecordDraft } from '../../../lib/reports/review-draft'
import type { RecordSearchState } from './report-bottle-match-field'
import { formatReportTimestampLong } from '../view-models/report-detail-view'
import { ComparisonRecordCard, type ComparisonCardVariant } from './report-comparison-record-card'
import { MetadataItem, MetadataLine } from './report-detail-metadata'
import { ReportHeader } from './report-header'
import { ReportProgressPanel } from './report-progress-panel'
import { ProcessingRecord } from './report-processing-record'
import { FailedRecordCard, ReviewRecordCard } from './report-review-record-card'

export type ReviewActionMode = 'disabled' | 'enabled' | 'preview'
type ProcessingProgressView = { label: string; ratio: number }
type CreatedReportDetailProps = { detail: ReportDetail; heading: string; reportId: string }
type ProcessingReportDetailProps = {
  detail: ReportDetail
  progress: ProcessingProgressView
  statusMessage?: string | null
}
type ReviewedReportDetailProps = {
  detail: ReportDetail
  heading: string
  reportId: string
  comparisonVariant?: ComparisonCardVariant
}

type ReviewableReportDetailProps = {
  detail: ReportDetail
  heading: string
  onReviewSubmit?: () => void
  reportId: string
  readinessMessage: string | null
  reviewActionDisabled: boolean
  reviewActionErrorMessage?: string | null
  reviewActionMode: ReviewActionMode
  reviewDraft: ReportReviewRecordDraft[]
  searchState: Record<string, RecordSearchState>
  statusMessage?: string | null
  submittingReview?: boolean
  onFillTenthsChange: (recordId: string, fillTenths: number) => void
  onReviewSearch: (recordId: string, query: string) => void
  onReviewSearchQueryChange: (recordId: string, query: string) => void
  onReviewBottleChange: (recordId: string, bottleId: string) => void
}

export function CreatedReportDetail({
  detail,
  heading,
  reportId,
}: CreatedReportDetailProps) {
  return (
    <div className="bb-report-screen">
      <ReportHeader
        heading={heading}
        mobileSupportingLine={reportId}
        mobileTitle="Report"
        status={detail.status}
      />
      <SurfaceCard className="bb-report-meta-slab" tone="low">
        <MetadataItem label="Started">{formatReportTimestampLong(detail.startedAt)}</MetadataItem>
      </SurfaceCard>
      <SurfaceCard className="bb-message-panel" tone="low">
        <p className="bb-message-panel__body">
          This report has been created. Processing has not started yet.
        </p>
      </SurfaceCard>
    </div>
  )
}

export function ProcessingReportDetail({
  detail,
  progress,
  statusMessage = null,
}: ProcessingReportDetailProps) {
  return (
    <div className="bb-report-screen">
      <SurfaceCard className="bb-processing-header" tone="canvas">
        <div className="bb-processing-header__copy">
          <div className="bb-processing-header__meta">
            <SectionEyebrow>Report ID</SectionEyebrow>
            <span className="bb-processing-header__report-id">{detail.id}</span>
          </div>
          <div className="bb-processing-header__details">
            <span>Started at {formatReportTimestampLong(detail.startedAt)}</span>
            <span>Operator: {detail.userDisplayName ?? 'Unknown operator'}</span>
          </div>
        </div>
        <div className="bb-processing-header__status">
          <StatusChip status={detail.status} />
        </div>
      </SurfaceCard>

      <ReportProgressPanel label={progress.label} progress={progress.ratio} />

      {statusMessage ? (
        <SurfaceCard className="bb-message-panel" tone="low">
          <p aria-live="polite" className="bb-message-panel__body">
            {statusMessage}
          </p>
        </SurfaceCard>
      ) : null}

      <section className="bb-record-stack bb-record-stack--processing">
        {detail.bottleRecords.map((record) => (
          <ProcessingRecord key={record.id} record={record} />
        ))}
      </section>
    </div>
  )
}

export function ReviewedReportDetail({
  comparisonVariant = 'grid',
  detail,
  heading,
  reportId,
}: ReviewedReportDetailProps) {
  const isComparisonEmphasis = comparisonVariant === 'hero'

  return (
    <div className="bb-report-screen">
      <div
        className={`bb-reviewed-shell${isComparisonEmphasis ? ' bb-reviewed-shell--comparison' : ' bb-reviewed-shell--summary'}`}
      >
        <ReportHeader
          heading={heading}
          mobileSupportingLine={reportId}
          mobileTitle="Report"
          status={detail.status}
          variant={isComparisonEmphasis ? 'inline-chip' : 'stacked'}
        />
        {!isComparisonEmphasis ? (
          <div className="bb-reviewed-shell__meta">
            <MetadataLine label="Started" value={formatReportTimestampLong(detail.startedAt)} />
            <MetadataLine label="Completed" value={formatReportTimestampLong(detail.completedAt)} />
            <MetadataLine label="Operator" value={detail.userDisplayName ?? 'Unknown operator'} />
          </div>
        ) : null}
      </div>

      <div className={`bb-reviewed-grid${isComparisonEmphasis ? ' bb-reviewed-grid--comparison' : ''}`}>
        {detail.bottleRecords.map((record) => (
          <ComparisonRecordCard key={record.id} record={record} variant={comparisonVariant} />
        ))}
      </div>
    </div>
  )
}

export function ReviewableReportDetail({
  detail,
  heading,
  onReviewSubmit,
  reportId,
  onFillTenthsChange,
  onReviewBottleChange,
  onReviewSearch,
  onReviewSearchQueryChange,
  readinessMessage,
  reviewActionDisabled,
  reviewActionErrorMessage = null,
  reviewActionMode,
  reviewDraft,
  searchState,
  statusMessage = null,
  submittingReview = false,
}: ReviewableReportDetailProps) {
  const hasFailedRecords = detail.bottleRecords.some((record) => record.status === 'failed')
  const showCompactReviewAction =
    (reviewActionMode === 'enabled' || reviewActionMode === 'preview') &&
    !reviewActionErrorMessage &&
    !readinessMessage

  return (
    <div className="bb-report-screen">
      <ReportHeader
        heading={heading}
        mobileSupportingLine={reportId}
        mobileTitle="Report"
        status={detail.status}
      />

      <SurfaceCard className="bb-report-meta-slab" tone="low">
        <MetadataItem label="Started">{formatReportTimestampLong(detail.startedAt)}</MetadataItem>
        <MetadataItem label="Completed">{formatReportTimestampLong(detail.completedAt)}</MetadataItem>
        <MetadataItem label="Operator">{detail.userDisplayName ?? 'Unknown operator'}</MetadataItem>
      </SurfaceCard>

      {statusMessage ? (
        <SurfaceCard className="bb-message-panel" tone="low">
          <p aria-live="polite" className="bb-message-panel__body">
            {statusMessage}
          </p>
        </SurfaceCard>
      ) : null}

      <section className="bb-record-stack">
        {detail.bottleRecords.map((record) => {
          const draft = reviewDraft.find((entry) => entry.id === record.id)
          const search = searchState[record.id] ?? { query: '', results: [] }

          if (!draft) {
            return <ComparisonRecordCard key={record.id} record={record} />
          }

          if (record.status === 'failed') {
            return (
              <FailedRecordCard
                draft={draft}
                key={record.id}
                onBottleChange={onReviewBottleChange}
                onFillTenthsChange={onFillTenthsChange}
                onSearch={onReviewSearch}
                onSearchQueryChange={onReviewSearchQueryChange}
                record={record}
                search={search}
              />
            )
          }

          return (
            <ReviewRecordCard
              draft={draft}
              key={record.id}
              onBottleChange={onReviewBottleChange}
              onFillTenthsChange={onFillTenthsChange}
              onSearch={onReviewSearch}
              onSearchQueryChange={onReviewSearchQueryChange}
              record={record}
              search={search}
            />
          )
        })}
      </section>

      <div
        className={`bb-review-action${showCompactReviewAction ? ' bb-review-action--enabled' : ''}`}
      >
        <div className="bb-review-action__copy">
          {reviewActionErrorMessage ? (
            <p aria-live="polite" className="bb-review-action__helper bb-review-action__helper--error">
              {reviewActionErrorMessage}
            </p>
          ) : null}
          {readinessMessage ? (
            <p className="bb-review-action__helper">{readinessMessage}</p>
          ) : null}
        </div>
        <Button disabled={reviewActionDisabled} onPress={onReviewSubmit} variant="primary">
          {submittingReview ? 'Submitting Review…' : 'Submit Review'}
        </Button>
      </div>

      {hasFailedRecords ? (
        <p className="bb-report-screen__footnote">Failed records remain recoverable review work.</p>
      ) : null}
    </div>
  )
}
