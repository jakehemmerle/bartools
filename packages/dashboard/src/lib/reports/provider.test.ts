import { describe, expect, it } from 'vitest'
import { createDefaultReportsClient } from './provider'

describe('reports client provider defaults', () => {
  it('uses the fixture client when no backend base url is configured', async () => {
    const client = createDefaultReportsClient({ reportsMode: 'fixture' })

    expect(client.readiness.backendEnabled).toBe(false)
    expect((await client.listReports()).length).toBeGreaterThan(0)
  })

  it('uses the backend client when a backend base url is configured', () => {
    const client = createDefaultReportsClient({
      reportsMode: 'backend',
      backendBaseUrl: 'https://bartools-backend-staging-zjausnxoyq-ue.a.run.app',
    })

    expect(client.readiness.backendEnabled).toBe(true)
    expect(client.readiness.blockedReason).toBe('none')
  })
})
