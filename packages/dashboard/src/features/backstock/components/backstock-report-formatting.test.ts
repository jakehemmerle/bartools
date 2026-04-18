import { describe, expect, it } from 'vitest'
import { formatBytes } from './backstock-report-formatting'

describe('backstock report formatting', () => {
  it('returns zero kilobytes for invalid or empty values', () => {
    expect(formatBytes(0)).toBe('0 KB')
    expect(formatBytes(-1)).toBe('0 KB')
    expect(formatBytes(Number.NaN)).toBe('0 KB')
  })

  it('rounds sub-megabyte values to kilobytes', () => {
    expect(formatBytes(1536)).toBe('2 KB')
  })

  it('formats megabyte values with a single decimal place', () => {
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB')
  })
})
