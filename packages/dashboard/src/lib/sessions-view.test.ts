import { describe, expect, it } from 'vitest'
import { makeSessionListItem } from './fixtures/builders'
import { sortSessionsNewestFirst } from './sessions-view'

describe('sessions view helpers', () => {
  it('sorts sessions by newest completed or started timestamp first', () => {
    const sorted = sortSessionsNewestFirst([
      makeSessionListItem({
        id: 'session-old',
        startedAt: '2026-04-07T20:30:00-05:00',
        completedAt: '2026-04-07T21:17:00-05:00',
      }),
      makeSessionListItem({
        id: 'session-new',
        completedAt: '2026-04-09T22:15:00-05:00',
      }),
      makeSessionListItem({
        id: 'session-in-progress',
        completedAt: undefined,
        startedAt: '2026-04-10T08:00:00-05:00',
        status: 'in_progress',
      }),
    ])

    expect(sorted.map((session) => session.id)).toEqual([
      'session-in-progress',
      'session-new',
      'session-old',
    ])
  })
})
