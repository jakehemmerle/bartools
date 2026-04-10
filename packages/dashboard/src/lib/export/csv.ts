import type { InventoryProductRow } from '../fixtures/schemas'

type ExportSurface = 'inventory' | 'low-stock'

const inventoryHeaders = [
  'Product name',
  'Category',
  'UPC',
  'On-hand quantity',
  'PAR level',
  'Below par status',
  'As of date',
  'Volume (ml)',
  'Latest session id',
] as const

const lowStockHeaders = [
  'Product name',
  'Category',
  'UPC',
  'On-hand quantity',
  'PAR level',
  'Below par reason',
  'As of date',
  'Volume (ml)',
  'Latest session id',
] as const

export function buildInventoryExportCsv(
  rows: InventoryProductRow[],
  timezone: string,
) {
  return toCsv([
    [...inventoryHeaders],
    ...rows.map((row) => [
      row.productName,
      row.category ?? '',
      row.upc,
      formatComparableAmount(row.onHandComparableAmount, row.comparableUnit, row.displayQuantityLabel),
      formatParLevel(row.parComparableAmount, row.comparableUnit),
      row.belowPar ? 'Below par' : 'In range',
      formatCsvTimestamp(row.asOf, timezone),
      row.volumeMl?.toString() ?? '',
      row.latestSessionId ?? '',
    ]),
  ])
}

export function buildLowStockExportCsv(
  rows: InventoryProductRow[],
  timezone: string,
) {
  return toCsv([
    [...lowStockHeaders],
    ...rows.map((row) => [
      row.productName,
      row.category ?? '',
      row.upc,
      formatComparableAmount(row.onHandComparableAmount, row.comparableUnit, row.displayQuantityLabel),
      formatParLevel(row.parComparableAmount, row.comparableUnit),
      row.belowParReason ?? 'Below stock target',
      formatCsvTimestamp(row.asOf, timezone),
      row.volumeMl?.toString() ?? '',
      row.latestSessionId ?? '',
    ]),
  ])
}

export function createExportFilename(
  surface: ExportSurface,
  timezone: string,
  now = new Date(),
) {
  return `${surface}-${formatFilenameDate(now, timezone)}.csv`
}

export function downloadCsvFile(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function toCsv(rows: string[][]) {
  return rows
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n')
}

function escapeCsvValue(value: string) {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }

  return value
}

function formatComparableAmount(
  amount: number,
  comparableUnit: InventoryProductRow['comparableUnit'],
  displayQuantityLabel?: string,
) {
  if (displayQuantityLabel) {
    return displayQuantityLabel
  }

  return `${trimTrailingZeros(amount)} ${formatComparableUnit(comparableUnit)}`
}

function formatParLevel(
  amount: number | undefined,
  comparableUnit: InventoryProductRow['comparableUnit'],
) {
  if (amount == null) {
    return ''
  }

  return `${trimTrailingZeros(amount)} ${formatComparableUnit(comparableUnit)}`
}

function formatComparableUnit(
  comparableUnit: InventoryProductRow['comparableUnit'],
) {
  return comparableUnit === 'ml' ? 'ml' : 'bottles'
}

function trimTrailingZeros(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toString()
}

function formatCsvTimestamp(value: string, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date(value))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`
}

function formatFilenameDate(value: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(value)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return `${get('year')}-${get('month')}-${get('day')}`
}
