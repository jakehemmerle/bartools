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
    <div className="bt-report-screen">
      <ReportHeader
        heading={heading}
        mobileSupportingLine={reportId}
        mobileTitle="Report"
        status={detail.status}
      />
      <SurfaceCard className="bt-report-meta-slab" tone="low">
        <MetadataItem label="Started">{formatReportTimestampLong(detail.startedAt)}</MetadataItem>
      </SurfaceCard>
      <SurfaceCard className="bt-message-panel" tone="low">
        <p className="bt-message-panel__body">
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
    <div className="bt-report-screen">
      <SurfaceCard className="bt-processing-header" tone="canvas">
        <div className="bt-processing-header__copy">
          <div className="bt-processing-header__meta">
            <SectionEyebrow>Report ID</SectionEyebrow>
            <span className="bt-processing-header__report-id">{detail.id}</span>
          </div>
          <div className="bt-processing-header__details">
            <span>Started at {formatReportTimestampLong(detail.startedAt)}</span>
            <span>Operator: {detail.userDisplayName ?? 'Unknown operator'}</span>
          </div>
        </div>
        <div className="bt-processing-header__status">
          <StatusChip status={detail.status} />
        </div>
      </SurfaceCard>

      <ReportProgressPanel label={progress.label} progress={progress.ratio} />

      {statusMessage ? (
        <SurfaceCard className="bt-message-panel" tone="low">
          <p aria-live="polite" className="bt-message-panel__body">
            {statusMessage}
          </p>
        </SurfaceCard>
      ) : null}

      <section className="bt-record-stack bt-record-stack--processing">
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
    <div className="bt-report-screen">
      <div
        className={`bt-reviewed-shell${isComparisonEmphasis ? ' bt-reviewed-shell--comparison' : ' bt-reviewed-shell--summary'}`}
      >
        <ReportHeader
          heading={heading}
          mobileSupportingLine={reportId}
          mobileTitle="Report"
          status={detail.status}
          variant={isComparisonEmphasis ? 'inline-chip' : 'stacked'}
        />
        {!isComparisonEmphasis ? (
          <div className="bt-reviewed-shell__meta">
            <MetadataLine label="Started" value={formatReportTimestampLong(detail.startedAt)} />
            <MetadataLine label="Completed" value={formatReportTimestampLong(detail.completedAt)} />
            <MetadataLine label="Operator" value={detail.userDisplayName ?? 'Unknown operator'} />
          </div>
        ) : null}
      </div>

      <div className={`bt-reviewed-grid${isComparisonEmphasis ? ' bt-reviewed-grid--comparison' : ''}`}>
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
    <div className="bt-report-screen">
      <ReportHeader
        heading={heading}
        mobileSupportingLine={reportId}
        mobileTitle="Report"
        status={detail.status}
      />

      <SurfaceCard className="bt-report-meta-slab" tone="low">
        <MetadataItem label="Started">{formatReportTimestampLong(detail.startedAt)}</MetadataItem>
        <MetadataItem label="Completed">{formatReportTimestampLong(detail.completedAt)}</MetadataItem>
        <MetadataItem label="Operator">{detail.userDisplayName ?? 'Unknown operator'}</MetadataItem>
      </SurfaceCard>

      {statusMessage ? (
        <SurfaceCard className="bt-message-panel" tone="low">
          <p aria-live="polite" className="bt-message-panel__body">
            {statusMessage}
          </p>
        </SurfaceCard>
      ) : null}

      <section className="bt-record-stack">
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
        className={`bt-review-action${showCompactReviewAction ? ' bt-review-action--enabled' : ''}`}
      >
        <div className="bt-review-action__copy">
          <p
            className="bt-review-action__helper bt-review-action__helper--error"
            hidden={!reviewActionErrorMessage}
            role="alert"
          >
            {reviewActionErrorMessage ?? ''}
          </p>
          {readinessMessage ? (
            <p className="bt-review-action__helper">{readinessMessage}</p>
          ) : null}
        </div>
        <Button disabled={reviewActionDisabled} onPress={onReviewSubmit} variant="primary">
          {submittingReview ? 'Submitting Review…' : 'Submit Review'}
        </Button>
      </div>

      {hasFailedRecords ? (
        <p className="bt-report-screen__footnote">Failed records remain recoverable review work.</p>
      ) : null}
    </div>
  )
}
