import { describe, it, expect } from 'bun:test'
import { mergeRecord } from '../merge-record'
import type { ReportBottleRecord } from '@bartools/types'

function makeRecord(overrides: Partial<ReportBottleRecord> = {}): ReportBottleRecord {
  return {
    id: 'rec-1',
    imageUrl: '/uploads/photo.jpg',
    bottleName: 'Buffalo Trace',
    category: 'bourbon',
    fillPercent: 70,
    corrected: false,
    status: 'inferred',
    ...overrides,
  }
}

describe('mergeRecord', () => {
  it('appends a new record', () => {
    const existing = [makeRecord({ id: 'rec-1' })]
    const incoming = makeRecord({ id: 'rec-2', bottleName: 'Macallan' })
    const result = mergeRecord(existing, incoming)

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('rec-1')
    expect(result[1].id).toBe('rec-2')
  })

  it('replaces an existing record with matching id', () => {
    const existing = [
      makeRecord({ id: 'rec-1', bottleName: 'Unknown' }),
      makeRecord({ id: 'rec-2', bottleName: 'Macallan' }),
    ]
    const incoming = makeRecord({ id: 'rec-1', bottleName: 'Buffalo Trace', fillPercent: 80 })
    const result = mergeRecord(existing, incoming)

    expect(result).toHaveLength(2)
    expect(result[0].bottleName).toBe('Buffalo Trace')
    expect(result[0].fillPercent).toBe(80)
    expect(result[1].bottleName).toBe('Macallan')
  })

  it('handles empty existing array', () => {
    const incoming = makeRecord({ id: 'rec-1' })
    const result = mergeRecord([], incoming)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('rec-1')
  })

  it('does not mutate the original array', () => {
    const existing = [makeRecord({ id: 'rec-1' })]
    const original = [...existing]
    mergeRecord(existing, makeRecord({ id: 'rec-2' }))

    expect(existing).toEqual(original)
  })
})
