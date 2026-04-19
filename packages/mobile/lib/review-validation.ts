import type { ReportBottleRecord } from '@bartools/types'

export type RecordEdit = {
  bottleId?: string
  bottleName?: string
  fillPercent?: number
}

function resolveBottleId(
  record: ReportBottleRecord,
  edit: RecordEdit | undefined,
): string {
  const fromEdit = edit?.bottleId
  if (typeof fromEdit === 'string' && fromEdit.length > 0) {
    return fromEdit
  }
  const fromRecord = record.bottleId
  if (typeof fromRecord === 'string' && fromRecord.length > 0) {
    return fromRecord
  }
  return ''
}

export function canSubmitReview(
  records: ReportBottleRecord[],
  edits: Record<string, RecordEdit>,
): boolean {
  if (records.length === 0) return false
  return records.every((r) => resolveBottleId(r, edits[r.id]).length > 0)
}

export function isRecordMissingBottle(
  record: ReportBottleRecord,
  edit: RecordEdit | undefined,
): boolean {
  return resolveBottleId(record, edit).length === 0
}
