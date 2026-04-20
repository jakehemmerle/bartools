import { describe, it, expect } from 'bun:test'
import type { ReportBottleRecord } from '@bartools/types'
import {
  canSubmitReview,
  isRecordMissingBottle,
  type RecordEdit,
} from '../review-validation'

function makeRecord(overrides: Partial<ReportBottleRecord> = {}): ReportBottleRecord {
  return {
    id: 'rec-1',
    bottleId: undefined,
    imageUrl: 'https://example.com/a.jpg',
    bottleName: 'Test Bottle',
    fillPercent: 50,
    corrected: false,
    status: 'inferred',
    ...overrides,
  }
}

describe('canSubmitReview', () => {
  it('returns false when records list is empty', () => {
    expect(canSubmitReview([], {})).toBe(false)
  })

  it('returns true when every record has a bottleId from the server', () => {
    const records: ReportBottleRecord[] = [
      makeRecord({ id: 'r1', bottleId: 'b-1' }),
      makeRecord({ id: 'r2', bottleId: 'b-2' }),
    ]
    expect(canSubmitReview(records, {})).toBe(true)
  })

  it('returns true when a record missing server bottleId has an edit that fills it', () => {
    const records: ReportBottleRecord[] = [
      makeRecord({ id: 'r1', bottleId: 'b-1' }),
      makeRecord({ id: 'r2', bottleId: undefined }),
    ]
    const edits: Record<string, RecordEdit> = {
      r2: { bottleId: 'b-2', bottleName: 'Something' },
    }
    expect(canSubmitReview(records, edits)).toBe(true)
  })

  it('returns true when a record missing server bottleId has manual bottle details', () => {
    const records: ReportBottleRecord[] = [
      makeRecord({ id: 'r1', bottleId: undefined }),
    ]
    const edits: Record<string, RecordEdit> = {
      r1: { bottle: { name: 'Manual Vermouth', category: 'vermouth', sizeMl: 750 } },
    }
    expect(canSubmitReview(records, edits)).toBe(true)
  })

  it('returns false when a record is missing bottleId and has no edit', () => {
    const records: ReportBottleRecord[] = [
      makeRecord({ id: 'r1', bottleId: 'b-1' }),
      makeRecord({ id: 'r2', bottleId: undefined }),
    ]
    expect(canSubmitReview(records, {})).toBe(false)
  })

  it('returns false when manual bottle details are incomplete', () => {
    const records: ReportBottleRecord[] = [
      makeRecord({ id: 'r1', bottleId: undefined }),
    ]
    const edits: Record<string, RecordEdit> = {
      r1: { bottle: { name: '   ', category: 'other' } },
    }
    expect(canSubmitReview(records, edits)).toBe(false)
  })

  it('treats an empty-string bottleId in an edit as missing', () => {
    const records: ReportBottleRecord[] = [
      makeRecord({ id: 'r1', bottleId: undefined }),
    ]
    const edits: Record<string, RecordEdit> = {
      r1: { bottleId: '' },
    }
    expect(canSubmitReview(records, edits)).toBe(false)
  })

  it('treats an empty-string bottleId on the record as missing', () => {
    const records: ReportBottleRecord[] = [
      makeRecord({ id: 'r1', bottleId: '' }),
    ]
    expect(canSubmitReview(records, {})).toBe(false)
  })
})

describe('isRecordMissingBottle', () => {
  it('returns false when the record has a bottleId and no edit', () => {
    const record = makeRecord({ bottleId: 'b-1' })
    expect(isRecordMissingBottle(record, undefined)).toBe(false)
  })

  it('returns false when the record has a bottleId and the edit lacks one', () => {
    const record = makeRecord({ bottleId: 'b-1' })
    const edit: RecordEdit = { fillPercent: 75 }
    expect(isRecordMissingBottle(record, edit)).toBe(false)
  })

  it('returns false when the record has a bottleId and the edit also provides one', () => {
    const record = makeRecord({ bottleId: 'b-1' })
    const edit: RecordEdit = { bottleId: 'b-override' }
    expect(isRecordMissingBottle(record, edit)).toBe(false)
  })

  it('returns false when the record lacks bottleId but the edit supplies one', () => {
    const record = makeRecord({ bottleId: undefined })
    const edit: RecordEdit = { bottleId: 'b-2' }
    expect(isRecordMissingBottle(record, edit)).toBe(false)
  })

  it('returns false when the record lacks bottleId but manual bottle details are complete', () => {
    const record = makeRecord({ bottleId: undefined })
    const edit: RecordEdit = {
      bottle: { name: 'Manual Gin', category: 'gin', sizeMl: 750 },
    }
    expect(isRecordMissingBottle(record, edit)).toBe(false)
  })

  it('returns true when the record lacks bottleId and no edit exists', () => {
    const record = makeRecord({ bottleId: undefined })
    expect(isRecordMissingBottle(record, undefined)).toBe(true)
  })

  it('returns true when the record lacks bottleId and edit has no bottleId', () => {
    const record = makeRecord({ bottleId: undefined })
    const edit: RecordEdit = { fillPercent: 40 }
    expect(isRecordMissingBottle(record, edit)).toBe(true)
  })

  it('returns true when the record has an empty string bottleId and edit is undefined', () => {
    const record = makeRecord({ bottleId: '' })
    expect(isRecordMissingBottle(record, undefined)).toBe(true)
  })

  it('returns true when the edit has an empty-string bottleId and record is missing', () => {
    const record = makeRecord({ bottleId: undefined })
    const edit: RecordEdit = { bottleId: '' }
    expect(isRecordMissingBottle(record, edit)).toBe(true)
  })
})
