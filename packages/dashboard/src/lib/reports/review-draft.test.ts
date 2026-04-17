import { describe, expect, it } from 'vitest'
import { baseReportsScenario } from './base-scenario'
import {
  buildReportReviewPayload,
  createReportReviewDraft,
} from './review-draft'

describe('report review draft helpers', () => {
  it('creates a draft row for every bottle record', () => {
    const drafts = createReportReviewDraft(baseReportsScenario.details['report-1002'])

    expect(drafts).toHaveLength(2)
    expect(drafts[0]?.bottleId).toBe('bottle-3')
    expect(drafts[0]?.fillTenths).toBe(5)
    expect(drafts[1]?.bottleId).toBeNull()
  })

  it('builds the exact backend review payload shape once every record is decided', () => {
    const payload = buildReportReviewPayload('user-1', [
      { id: 'record-a', bottleId: 'bottle-1', fillTenths: 6 },
      { id: 'record-b', bottleId: 'bottle-2', fillTenths: 2 },
    ])

    expect(payload).toEqual({
      userId: 'user-1',
      records: [
        { id: 'record-a', bottleId: 'bottle-1', fillTenths: 6 },
        { id: 'record-b', bottleId: 'bottle-2', fillTenths: 2 },
      ],
    })
  })

  it('returns null while a record decision is still missing', () => {
    expect(
      buildReportReviewPayload('user-1', [
        { id: 'record-a', bottleId: 'bottle-1', fillTenths: 6 },
        { id: 'record-b', bottleId: null, fillTenths: 2 },
      ]),
    ).toBeNull()
  })
})
