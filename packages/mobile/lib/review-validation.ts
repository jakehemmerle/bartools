import type { ReportBottleRecord } from '@bartools/types'
import type { ManualBottleInput } from '@bartools/types'
import { validateManualBottle } from './add-inventory-validation'

export type RecordEdit = {
  bottleId?: string
  bottleName?: string
  bottle?: ManualBottleInput
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

function hasValidManualBottle(edit: RecordEdit | undefined): boolean {
  return validateManualBottle(edit?.bottle).length === 0
}

export function canSubmitReview(
  records: ReportBottleRecord[],
  edits: Record<string, RecordEdit>,
): boolean {
  if (records.length === 0) return false
  return records.every((r) => {
    const edit = edits[r.id]
    return resolveBottleId(r, edit).length > 0 || hasValidManualBottle(edit)
  })
}

export function isRecordMissingBottle(
  record: ReportBottleRecord,
  edit: RecordEdit | undefined,
): boolean {
  return resolveBottleId(record, edit).length === 0 && !hasValidManualBottle(edit)
}
