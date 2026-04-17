import { describe, expect, it } from 'vitest'
import { baseReportsScenario } from './base-scenario'

describe('base reports scenario', () => {
  it('covers the full backend report lifecycle in fixture data', () => {
    expect(baseReportsScenario.reports.map((report) => report.status)).toEqual([
      'reviewed',
      'unreviewed',
      'processing',
      'created',
    ])
  })

  it('keeps a missing-media report available for review and fallback rendering', () => {
    const detail = baseReportsScenario.details['report-missing-media']

    expect(detail).toBeDefined()
    expect(detail.bottleRecords[0]?.imageUrl).toBe('')
    expect(detail.bottleRecords[0]?.status).toBe('reviewed')
  })
})
