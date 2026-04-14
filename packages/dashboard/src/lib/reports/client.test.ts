import { describe, expect, it } from 'vitest'
import { createFixtureReportsClient } from './client'

describe('fixture reports client', () => {
  it('exposes backend integration readiness as blocked on venue auth context', async () => {
    const client = createFixtureReportsClient()
    const reports = await client.listReports()

    expect(client.readiness.backendEnabled).toBe(false)
    expect(client.readiness.blockedReason).toBe('venue_auth_context_required')
    expect(reports.length).toBeGreaterThan(0)
  })

  it('returns report detail and bottle search results in backend-shaped forms', async () => {
    const client = createFixtureReportsClient()
    const detail = await client.getReport('report-1002')
    const results = await client.searchBottles('montelobos')

    expect(detail?.status).toBe('unreviewed')
    expect(detail?.bottleRecords[1]?.status).toBe('failed')
    expect(results[0]?.name).toBe('Montelobos Mezcal')
  })
})
