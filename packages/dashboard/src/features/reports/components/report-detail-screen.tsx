import { useId } from 'react'
import type { BottleSearchResult, ReportBottleRecord, ReportDetail } from '@bartools/types'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import { SectionEyebrow } from '../../../components/primitives/section-eyebrow'
import { StatusChip } from '../../../components/primitives/status-chip'
import { Button } from '../../../components/primitives/button'
import { Select } from '../../../components/primitives/select'
import type { ReportReviewRecordDraft } from '../../../lib/reports/review-draft'
import { buildComparisonFields } from '../view-models/report-comparison-view'
import {
  buildReportHeading,
  buildReportProgressView,
  buildReviewSubmissionState,
  formatReportTimestampLong,
} from '../view-models/report-detail-view'
import { ReportHeader } from './report-header'
import { ReportProgressPanel } from './report-progress-panel'

type RecordSearchState = {
  query: string
  results: BottleSearchResult[]
}

type ReportDetailScreenProps = {
  detail: ReportDetail
  reviewDraft: ReportReviewRecordDraft[]
  searchState: Record<string, RecordSearchState>
  onFillTenthsChange: (recordId: string, fillTenths: number) => void
  onReviewSearch: (recordId: string, query: string) => void
  onReviewSearchQueryChange: (recordId: string, query: string) => void
  onReviewBottleChange: (recordId: string, bottleId: string) => void
  readinessMessage: string
  reviewActionMode?: 'integration-blocked' | 'preview'
}

export function ReportDetailScreen({
  detail,
  onFillTenthsChange,
  onReviewBottleChange,
  onReviewSearch,
  onReviewSearchQueryChange,
  readinessMessage,
  reviewActionMode = 'integration-blocked',
  reviewDraft,
  searchState,
}: ReportDetailScreenProps) {
  const heading = buildReportHeading(detail)
  const progress = buildReportProgressView(detail)
  const submission = buildReviewSubmissionState(detail, reviewDraft)
  const hasFailedRecords = detail.bottleRecords.some((record) => record.status === 'failed')
  const reviewActionDisabled = reviewActionMode === 'preview' ? false : true
  const reviewActionMessage =
    reviewActionMode === 'preview'
      ? null
      : submission.ready
        ? readinessMessage
        : 'Pick a product match and fill level for every actionable record before review can be submitted.'

  if (detail.status === 'created') {
    return (
      <div className="bb-report-screen">
        <ReportHeader heading={heading} status={detail.status} />
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

  if (detail.status === 'processing') {
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

        <section className="bb-record-stack bb-record-stack--processing">
          {detail.bottleRecords.map((record) => (
            <ProcessingRecord key={record.id} record={record} />
          ))}
        </section>
      </div>
    )
  }

  if (detail.status === 'reviewed') {
    const comparisonRecords = detail.bottleRecords.filter(
      (record) => record.correctedValues || record.originalModelOutput,
    )

    return (
      <div className="bb-report-screen">
        <div className="bb-reviewed-shell">
          <ReportHeader heading={heading} status={detail.status} />
          <div className="bb-reviewed-shell__meta">
            <MetadataLine label="Started" value={formatReportTimestampLong(detail.startedAt)} />
            <MetadataLine
              label="Completed"
              value={formatReportTimestampLong(detail.completedAt)}
            />
            <MetadataLine label="Operator" value={detail.userDisplayName ?? 'Unknown operator'} />
          </div>
        </div>

        <div className="bb-reviewed-grid">
          {detail.bottleRecords.map((record) =>
            comparisonRecords.includes(record) ? (
              <ComparisonRecordCard key={record.id} record={record} />
            ) : (
              <ResolvedRecordCard key={record.id} record={record} />
            ),
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bb-report-screen">
      <ReportHeader heading={heading} status={detail.status} />

      <SurfaceCard className="bb-report-meta-slab" tone="low">
        <MetadataItem label="Started">{formatReportTimestampLong(detail.startedAt)}</MetadataItem>
        <MetadataItem label="Completed">{formatReportTimestampLong(detail.completedAt)}</MetadataItem>
        <MetadataItem label="Operator">{detail.userDisplayName ?? 'Unknown operator'}</MetadataItem>
      </SurfaceCard>

      <section className="bb-record-stack">
        {detail.bottleRecords.map((record) => {
          const draft = reviewDraft.find((entry) => entry.id === record.id)
          const search = searchState[record.id] ?? { query: '', results: [] }

          if (!draft) {
            return <ResolvedRecordCard key={record.id} record={record} />
          }

          if (record.status === 'failed') {
            return (
              <FailedRecordCard
                draft={draft}
                key={record.id}
                onBottleChange={onReviewBottleChange}
                onFillTenthsChange={onFillTenthsChange}
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

      <div className={`bb-review-action${reviewActionMode === 'preview' ? ' bb-review-action--preview' : ''}`}>
        {reviewActionMessage ? <p className="bb-review-action__helper">{reviewActionMessage}</p> : null}
        <Button disabled={reviewActionDisabled} variant="primary">
          Submit Review
        </Button>
      </div>

      {hasFailedRecords ? <p className="bb-report-screen__footnote">Failed records remain recoverable review work.</p> : null}
    </div>
  )
}

function MetadataItem({
  children,
  label,
}: {
  children: string
  label: string
}) {
  return (
    <div className="bb-metadata-item">
      <span className="bb-field__label">{label}</span>
      <span className="bb-metadata-item__value">{children}</span>
    </div>
  )
}

function MetadataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="bb-metadata-line">
      <span className="bb-field__label">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function ProcessingRecord({ record }: { record: ReportBottleRecord }) {
  return (
    <SurfaceCard className={`bb-processing-record${record.status === 'pending' ? ' bb-processing-record--pending' : ''}`} tone="base">
      <div className="bb-processing-record__media">
        {record.imageUrl ? <img alt={record.bottleName} src={record.imageUrl} /> : <div className="bb-processing-record__placeholder">◻</div>}
      </div>
      <div className="bb-processing-record__summary">
        {record.status === 'pending' ? (
          <p className="bb-processing-record__pending">Processing...</p>
        ) : (
          <>
            <h3 className="bb-processing-record__title">{record.bottleName}</h3>
            <p className="bb-processing-record__meta">{record.category ?? 'Uncategorized'}</p>
          </>
        )}
      </div>
    </SurfaceCard>
  )
}

function ReviewRecordCard({
  draft,
  onBottleChange,
  onFillTenthsChange,
  onSearch,
  onSearchQueryChange,
  record,
  search,
}: {
  draft: ReportReviewRecordDraft
  onBottleChange: (recordId: string, bottleId: string) => void
  onFillTenthsChange: (recordId: string, fillTenths: number) => void
  onSearch: (recordId: string, query: string) => void
  onSearchQueryChange: (recordId: string, query: string) => void
  record: ReportBottleRecord
  search: RecordSearchState
}) {
  const inputId = useId()
  const showManualMatchHint = search.query.trim().length > 0 && search.results.length === 0

  return (
    <SurfaceCard className="bb-record-card" tone="low">
      <div className="bb-record-card__media-slab">
        <RecordMedia record={record} />
        <div className="bb-record-card__summary">
          <SectionEyebrow>{record.category ?? 'Record'}</SectionEyebrow>
          <h3 className="bb-record-card__title">{record.bottleName}</h3>
          <p className="bb-record-card__meta">
            {record.upc ? `UPC ${record.upc}` : 'UPC unavailable'}
            {record.volumeMl ? ` • ${record.volumeMl}ml` : ''}
          </p>
        </div>
      </div>
      <div className="bb-record-card__controls">
        <div className="bb-field-group">
          <label className="bb-field" htmlFor={inputId}>
            <span className="bb-field__label">Product Match</span>
            <div className="bb-search-field">
              <span aria-hidden="true" className="bb-search-field__icon">
                ⌕
              </span>
              <input
                className="bb-input bb-input--search"
                id={inputId}
                onChange={(event) => {
                  const query = event.currentTarget.value
                  onSearchQueryChange(record.id, query)
                  onSearch(record.id, query)
                }}
                placeholder="Search to rematch..."
                value={search.query}
              />
            </div>
          </label>
          {showManualMatchHint ? (
            <p className="bb-field__hint">Needs manual matching.</p>
          ) : null}
          <Select
            hideLabel
            label="Product match results"
            onChange={(event) => onBottleChange(record.id, event.currentTarget.value)}
            value={draft.bottleId ?? ''}
            className="bb-select--quiet"
          >
            <option value="">Choose bottle...</option>
            {search.results.map((result) => (
              <option key={result.id} value={result.id}>
                {result.name}
                {result.volumeMl ? ` • ${result.volumeMl} ml` : ''}
              </option>
            ))}
          </Select>
        </div>

        <div className="bb-field-group">
          <div className="bb-fill-rail__header">
            <span className="bb-field__label">Observed Fill Level</span>
            <span className="bb-fill-rail__value">{draft.fillTenths}</span>
          </div>
          <div className="bb-fill-rail">
            <div className="bb-fill-rail__track" aria-hidden="true">
              <span
                className="bb-fill-rail__fill"
                style={{ width: `${draft.fillTenths * 10}%` }}
              />
            </div>
            <div className="bb-fill-rail__options">
              {Array.from({ length: 11 }, (_, value) => (
                <button
                  className={`bb-fill-rail__option${value === draft.fillTenths ? ' is-active' : ''}`}
                  key={value}
                  onClick={() => onFillTenthsChange(record.id, value)}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  )
}

function FailedRecordCard({
  draft,
  onBottleChange,
  onFillTenthsChange,
  record,
  search,
}: {
  draft: ReportReviewRecordDraft
  onBottleChange: (recordId: string, bottleId: string) => void
  onFillTenthsChange: (recordId: string, fillTenths: number) => void
  record: ReportBottleRecord
  search: RecordSearchState
}) {
  return (
    <SurfaceCard className="bb-record-card bb-record-card--failed" tone="low">
      <span className="bb-record-card__error-strip" aria-hidden="true" />
      <div className="bb-record-card__failed-media">
        <RecordMedia record={record} />
      </div>
      <div className="bb-record-card__failed-content">
        <div className="bb-record-card__failed-header">
          <h3 className="bb-record-card__title">{record.bottleName}</h3>
          <StatusChip status="failed" />
        </div>
        <SurfaceCard className="bb-error-panel" tone="canvas">
          <SectionEyebrow>Error Code: {record.errorCode ?? 'unknown'}</SectionEyebrow>
          <p>{record.errorMessage ?? 'This record needs manual review.'}</p>
        </SurfaceCard>
        <div className="bb-record-card__failed-controls">
          <Select
            label="Product Match"
            onChange={(event) => onBottleChange(record.id, event.currentTarget.value)}
            value={draft.bottleId ?? ''}
          >
            <option value="">Select Product...</option>
            {search.results.map((result) => (
              <option key={result.id} value={result.id}>
                {result.name}
              </option>
            ))}
          </Select>
          <div className="bb-field">
            <span className="bb-field__label">Fill Level (Tenths)</span>
            <div className="bb-fill-grid">
              {Array.from({ length: 11 }, (_, value) => (
                <button
                  className={`bb-fill-grid__option${value === draft.fillTenths ? ' is-active' : ''}`}
                  key={value}
                  onClick={() => onFillTenthsChange(record.id, value)}
                  type="button"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  )
}

function ComparisonRecordCard({ record }: { record: ReportBottleRecord }) {
  const fields = buildComparisonFields(record)

  return (
    <SurfaceCard className="bb-comparison-card" tone="low">
      <div className="bb-comparison-card__record-title">
        <h2>{record.bottleName}</h2>
        <p>{record.category ?? 'Uncategorized'}</p>
      </div>
      <div className="bb-comparison-grid">
        <div className="bb-comparison-panel">
          <SectionEyebrow>Original Model Output</SectionEyebrow>
          {fields.map((field) => (
            <div className="bb-comparison-field" key={field.label}>
              <span className="bb-comparison-field__label">{field.label}</span>
              <span className={`bb-comparison-field__value${field.changed ? ' is-struck' : ''}`}>
                {field.originalValue}
              </span>
            </div>
          ))}
        </div>
        <div className="bb-comparison-panel bb-comparison-panel--final">
          <SectionEyebrow>Final Corrected Values</SectionEyebrow>
          {fields.map((field) => (
            <div className="bb-comparison-field" key={field.label}>
              <span className="bb-comparison-field__label">{field.label}</span>
              <span className={`bb-comparison-field__value${field.changed ? ' is-final' : ''}`}>
                {field.finalValue}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  )
}

function ResolvedRecordCard({ record }: { record: ReportBottleRecord }) {
  return (
    <SurfaceCard className="bb-resolved-card" tone="low">
      <div className="bb-resolved-card__media">
        <RecordMedia record={record} />
      </div>
      <div className="bb-resolved-card__header">
        <h2>{record.bottleName}</h2>
        <StatusChip status="reviewed" />
      </div>
      <p className="bb-resolved-card__meta">
        {record.category ?? 'Uncategorized'}
        {record.upc ? ` • UPC ${record.upc}` : ''}
        {record.volumeMl ? ` • ${record.volumeMl}ml` : ''}
      </p>
      <p className="bb-resolved-card__fill">
        Final Fill Value (Tenths): <span>{Math.round(record.fillPercent / 10)}</span>
      </p>
    </SurfaceCard>
  )
}

function RecordMedia({ record }: { record: ReportBottleRecord }) {
  if (!record.imageUrl) {
    return (
      <div className="bb-record-media bb-record-media--missing">
        <span aria-hidden="true">⌁</span>
        <p>Image unavailable</p>
      </div>
    )
  }

  return (
    <div className="bb-record-media">
      <img alt={record.bottleName} src={record.imageUrl} />
    </div>
  )
}
