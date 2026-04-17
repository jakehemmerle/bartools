import { useId } from 'react'
import type { ReportBottleRecord } from '@bartools/types'
import { SectionEyebrow } from '../../../components/primitives/section-eyebrow'
import { StatusChip } from '../../../components/primitives/status-chip'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import type { ReportReviewRecordDraft } from '../../../lib/reports/review-draft'
import { ReportBottleMatchField, type RecordSearchState } from './report-bottle-match-field'
import { RecordMedia } from './report-record-media'

type ReviewRecordCardProps = {
  draft: ReportReviewRecordDraft
  onBottleChange: (recordId: string, bottleId: string) => void
  onFillTenthsChange: (recordId: string, fillTenths: number) => void
  onSearch: (recordId: string, query: string) => void
  onSearchQueryChange: (recordId: string, query: string) => void
  record: ReportBottleRecord
  search: RecordSearchState
}

export function ReviewRecordCard({
  draft,
  onBottleChange,
  onFillTenthsChange,
  onSearch,
  onSearchQueryChange,
  record,
  search,
}: ReviewRecordCardProps) {
  const inputId = useId()

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
          <ReportBottleMatchField
            inputId={inputId}
            onQueryChange={(query) => onSearchQueryChange(record.id, query)}
            onSearch={(query) => onSearch(record.id, query)}
            onSelectResult={(result) => {
              onBottleChange(record.id, result.id)
              onSearchQueryChange(record.id, result.name)
              onSearch(record.id, result.name)
            }}
            search={search}
            selectedBottleId={draft.bottleId}
          />
        </div>

        <TenthsRailField
          fillTenths={draft.fillTenths}
          onSelect={(value) => onFillTenthsChange(record.id, value)}
        />
      </div>
    </SurfaceCard>
  )
}

export function FailedRecordCard({
  draft,
  onBottleChange,
  onFillTenthsChange,
  onSearch,
  onSearchQueryChange,
  record,
  search,
}: ReviewRecordCardProps) {
  const inputId = useId()

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
          <ReportBottleMatchField
            inputId={inputId}
            onQueryChange={(query) => onSearchQueryChange(record.id, query)}
            onSearch={(query) => onSearch(record.id, query)}
            onSelectResult={(result) => {
              onBottleChange(record.id, result.id)
              onSearchQueryChange(record.id, result.name)
              onSearch(record.id, result.name)
            }}
            search={search}
            selectedBottleId={draft.bottleId}
          />
          <TenthsGridField
            fillTenths={draft.fillTenths}
            onSelect={(value) => onFillTenthsChange(record.id, value)}
          />
        </div>
      </div>
    </SurfaceCard>
  )
}

function TenthsRailField({
  fillTenths,
  onSelect,
}: {
  fillTenths: number
  onSelect: (value: number) => void
}) {
  return (
    <div className="bb-field-group">
      <div className="bb-fill-rail__header">
        <span className="bb-field__label">Observed Fill Level</span>
        <span className="bb-fill-rail__value">{fillTenths}</span>
      </div>
      <div className="bb-fill-rail">
        <div className="bb-fill-rail__track" aria-hidden="true">
          <span className="bb-fill-rail__fill" style={{ width: `${fillTenths * 10}%` }} />
        </div>
        <div className="bb-fill-rail__options">
          {Array.from({ length: 11 }, (_, value) => (
            <button
              className={`bb-fill-rail__option${value === fillTenths ? ' is-active' : ''}`}
              key={value}
              onClick={() => onSelect(value)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function TenthsGridField({
  fillTenths,
  onSelect,
}: {
  fillTenths: number
  onSelect: (value: number) => void
}) {
  return (
    <div className="bb-field">
      <span className="bb-field__label">Fill Level (Tenths)</span>
      <div className="bb-fill-grid">
        {Array.from({ length: 11 }, (_, value) => (
          <button
            className={`bb-fill-grid__option${value === fillTenths ? ' is-active' : ''}`}
            key={value}
            onClick={() => onSelect(value)}
            type="button"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}
