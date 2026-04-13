import { describe, expect, it } from 'vitest'
import { makeReportListItem } from './fixtures/builders'
import { sortReportsNewestFirst } from './reports-view'

describe('reports view helpers', () => {
  it('sorts reports by newest completed or started timestamp first', () => {
    const sorted = sortReportsNewestFirst([
      makeReportListItem({
        id: 'report-old',
        startedAt: '2026-04-07T20:30:00-05:00',
        completedAt: '2026-04-07T21:17:00-05:00',
      }),
      makeReportListItem({
        id: 'report-new',
        completedAt: '2026-04-09T22:15:00-05:00',
      }),
      makeReportListItem({
        id: 'report-in-progress',
        completedAt: undefined,
        startedAt: '2026-04-10T08:00:00-05:00',
        status: 'processing',
      }),
    ])

    expect(sorted.map((report) => report.id)).toEqual([
      'report-in-progress',
      'report-new',
      'report-old',
    ])
  })
})
