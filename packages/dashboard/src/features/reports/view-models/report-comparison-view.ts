import type { ModelOutput, ReportBottleRecord } from '@bartools/types'

export type ComparisonField = {
  changed: boolean
  finalValue: string
  label: string
  originalValue: string
}

export function buildComparisonFields(record: ReportBottleRecord): ComparisonField[] {
  const original = record.originalModelOutput ?? buildModelOutput(record)
  const final = record.correctedValues ?? buildModelOutput(record)

  return [
    createField('Bottle Name', original.bottleName, final.bottleName),
    createField('Category', original.category, final.category),
    createField('UPC', original.upc, final.upc),
    createField('Volume (ml)', stringifyNumber(original.volumeMl), stringifyNumber(final.volumeMl)),
    createField(
      'Fill Value (Tenths)',
      stringifyFillValue(original.fillPercent),
      stringifyFillValue(final.fillPercent),
    ),
  ]
}

function buildModelOutput(record: ReportBottleRecord): ModelOutput {
  return {
    bottleName: record.bottleName,
    category: record.category,
    upc: record.upc,
    volumeMl: record.volumeMl,
    fillPercent: record.fillPercent,
  }
}

function createField(label: string, originalValue?: string, finalValue?: string): ComparisonField {
  const safeOriginal = originalValue ?? '--'
  const safeFinal = finalValue ?? '--'

  return {
    label,
    originalValue: safeOriginal,
    finalValue: safeFinal,
    changed: safeOriginal !== safeFinal,
  }
}

function stringifyNumber(value: number | undefined) {
  return value === undefined ? undefined : String(value)
}

function stringifyFillValue(value: number | undefined) {
  return value === undefined ? undefined : String(Math.round(value / 10))
}
