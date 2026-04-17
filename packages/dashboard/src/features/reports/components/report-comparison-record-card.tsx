import type { ReportBottleRecord } from '@bartools/types'
import { SectionEyebrow } from '../../../components/primitives/section-eyebrow'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import { buildComparisonFields, type ComparisonField } from '../view-models/report-comparison-view'
import { RecordMedia } from './report-record-media'

export type ComparisonCardVariant = 'grid' | 'hero'

export function ComparisonRecordCard({
  record,
  variant = 'grid',
}: {
  record: ReportBottleRecord
  variant?: ComparisonCardVariant
}) {
  const fields = buildComparisonFields(record)
  const comparisonFields = fields.filter((field) => field.label !== 'Fill Value (Tenths)')
  const fillField = fields.find((field) => field.label === 'Fill Value (Tenths)')

  return (
    <SurfaceCard
      className={`bb-comparison-card${variant === 'hero' ? ' bb-comparison-card--hero' : ''}`}
      tone="low"
    >
      {variant === 'hero' ? (
        <div className="bb-comparison-card__hero-header">
          <div className="bb-comparison-card__hero-media">
            <RecordMedia record={record} />
          </div>
          <div className="bb-comparison-card__record-title">
            <h2>{record.bottleName}</h2>
            <p>{record.category ?? 'Uncategorized'}</p>
          </div>
        </div>
      ) : (
        <div className="bb-comparison-card__record-title">
          <h2>{record.bottleName}</h2>
          <p>{record.category ?? 'Uncategorized'}</p>
        </div>
      )}
      <div className="bb-comparison-grid">
        <ComparisonPanel
          fields={comparisonFields}
          fillField={fillField}
          panel="original"
          variant={variant}
        />
        <ComparisonPanel
          fields={comparisonFields}
          fillField={fillField}
          panel="final"
          variant={variant}
        />
      </div>
    </SurfaceCard>
  )
}

function ComparisonPanel({
  fields,
  fillField,
  panel,
  variant,
}: {
  fields: ComparisonField[]
  fillField: ComparisonField | undefined
  panel: 'original' | 'final'
  variant: ComparisonCardVariant
}) {
  const isFinal = panel === 'final'

  return (
    <div className={`bb-comparison-panel${isFinal ? ' bb-comparison-panel--final' : ''}`}>
      <SectionEyebrow>{isFinal ? 'Final Corrected Values' : 'Original Model Output'}</SectionEyebrow>
      {fields.map((field) => (
        <div className="bb-comparison-field" key={`${panel}-${field.label}`}>
          <span className="bb-comparison-field__label">{field.label}</span>
          <span className={buildComparisonValueClass(field, panel)}>{selectComparisonValue(field, panel)}</span>
        </div>
      ))}
      {fillField ? <ComparisonFillField field={fillField} panel={panel} variant={variant} /> : null}
    </div>
  )
}

function ComparisonFillField({
  field,
  panel,
  variant,
}: {
  field: ComparisonField
  panel: 'original' | 'final'
  variant: ComparisonCardVariant
}) {
  const value = selectComparisonValue(field, panel)
  const fillTenths = parseFillTenths(value)
  const label =
    variant === 'hero'
      ? panel === 'final'
        ? 'Final Fill Level'
        : 'Original Fill Level'
      : field.label

  return (
    <div className={`bb-comparison-field bb-comparison-field--fill${variant === 'hero' ? ' is-hero' : ''}`}>
      <span className="bb-comparison-field__label">{label}</span>
      <span className={`bb-comparison-field__fill-value${panel === 'final' ? ' is-final' : ''}`}>
        {value}
      </span>
      {fillTenths !== null ? (
        <div className="bb-comparison-field__fill-track" aria-hidden="true">
          <span
            className={`bb-comparison-field__fill-bar${panel === 'final' ? ' is-final' : ''}`}
            style={{ width: `${fillTenths * 10}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}

function buildComparisonValueClass(field: ComparisonField, panel: 'original' | 'final') {
  if (panel === 'final') {
    return `bb-comparison-field__value${field.changed ? ' is-final' : ''}`
  }

  return `bb-comparison-field__value${field.changed ? ' is-struck' : ''}`
}

function selectComparisonValue(field: ComparisonField, panel: 'original' | 'final') {
  return panel === 'final' ? field.finalValue : field.originalValue
}

function parseFillTenths(value: string) {
  if (value === '--') {
    return null
  }

  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? null : numericValue
}
