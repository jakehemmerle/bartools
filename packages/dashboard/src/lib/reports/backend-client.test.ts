import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReportReviewInput } from './client'
import { createBackendReportsClient } from './backend-client'

const backendBaseUrl = 'https://bartools-backend-staging-zjausnxoyq-ue.a.run.app'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('backend reports client', () => {
  it('lists reports from the backend collection payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(buildReportsResponse()))

    vi.stubGlobal('fetch', fetchMock)

    const client = createBackendReportsClient({ baseUrl: backendBaseUrl })
    const reports = await client.listReports()

    expect(fetchMock).toHaveBeenCalledWith(`${backendBaseUrl}/reports`, {
      headers: { Accept: 'application/json' },
      method: 'GET',
    })
    expect(reports.map((report) => report.id)).toEqual(['report-newer', 'report-older'])
    expect(client.readiness.backendEnabled).toBe(true)
    expect(client.readiness.blockedReason).toBe('review_submission_requires_user_context')
  })

  it('supports a relative base url for proxied local development', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(buildReportDetailResponse()))

    vi.stubGlobal('fetch', fetchMock)

    const client = createBackendReportsClient({ baseUrl: '/api' })
    const detail = await client.getReport('report-1002')

    expect(fetchMock).toHaveBeenCalledWith('/api/reports/report-1002', {
      headers: { Accept: 'application/json' },
      method: 'GET',
    })
    expect(detail?.bottleRecords[0]?.imageUrl).toBe('/api/uploads/record-1.jpg')
  })

  it('returns null for unknown reports and resolves relative image urls for detail payloads', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: 'report_not_found' }, { status: 404 }))
      .mockResolvedValueOnce(jsonResponse(buildReportDetailResponse()))

    vi.stubGlobal('fetch', fetchMock)

    const client = createBackendReportsClient({ baseUrl: backendBaseUrl })

    await expect(client.getReport('missing-report')).resolves.toBeNull()
    await expect(client.getReport('report-1002')).resolves.toMatchObject({
      id: 'report-1002',
      bottleRecords: [
        {
          imageUrl: `${backendBaseUrl}/uploads/record-1.jpg`,
        },
      ],
    })
  })

  it('unwraps bottle search results and location results from backend payloads', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(buildBottleSearchResponse()))
      .mockResolvedValueOnce(jsonResponse(buildLocationsResponse()))

    vi.stubGlobal('fetch', fetchMock)

    const client = createBackendReportsClient({ baseUrl: backendBaseUrl })

    await expect(client.searchBottles('espolon')).resolves.toEqual([
      {
        id: 'bottle-1',
        name: 'Espolon Blanco',
        category: 'tequila',
        volumeMl: 750,
      },
    ])
    await expect(client.listVenueLocations('venue-1')).resolves.toEqual([
      {
        id: 'location-1',
        name: 'Main Bar',
        createdAt: '2026-04-16T12:00:00.000Z',
      },
    ])
  })

  it('posts review payloads without reshaping them and normalizes the returned detail', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(buildReviewedDetailResponse()))

    vi.stubGlobal('fetch', fetchMock)

    const payload: ReportReviewInput = {
      userId: 'user-1',
      records: [{ id: 'record-1', bottleId: 'bottle-9', fillTenths: 6 }],
    }

    const client = createBackendReportsClient({ baseUrl: backendBaseUrl })
    const detail = await client.reviewReport('report-1003', payload)

    expect(fetchMock).toHaveBeenCalledWith(`${backendBaseUrl}/reports/report-1003/review`, {
      body: JSON.stringify(payload),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    expect(detail.bottleRecords[0]?.imageUrl).toBe(`${backendBaseUrl}/uploads/record-1.jpg`)
  })
})

describe('backend reports client stream handling', () => {
  it('maps server-sent events into typed report stream events', () => {
    const eventSources: MockEventSource[] = []
    vi.stubGlobal(
      'EventSource',
      class EventSourceStub extends MockEventSource {
        constructor(url: string) {
          super(url)
          eventSources.push(this)
        }
      },
    )

    const client = createBackendReportsClient({ baseUrl: backendBaseUrl })
    const onEvent = vi.fn()
    const unsubscribe = client.streamReport('report-1002', onEvent)
    const source = eventSources[0]

    expect(source?.url).toBe(`${backendBaseUrl}/reports/report-1002/stream`)

    source?.emit('record.failed', {
      id: 'record-2',
      imageUrl: '/uploads/record-2.jpg',
      bottleName: 'Unknown bottle',
      fillPercent: 0,
      corrected: false,
      status: 'failed',
      errorCode: 'catalog_no_match',
    })
    source?.emit('report.ready_for_review', {
      id: 'report-1002',
      status: 'unreviewed',
      photoCount: 4,
      processedCount: 4,
    })

    expect(onEvent).toHaveBeenNthCalledWith(1, {
      type: 'record.failed',
      data: expect.objectContaining({
        id: 'record-2',
        imageUrl: `${backendBaseUrl}/uploads/record-2.jpg`,
      }),
    })
    expect(onEvent).toHaveBeenNthCalledWith(2, {
      type: 'report.ready_for_review',
      data: {
        id: 'report-1002',
        status: 'unreviewed',
        photoCount: 4,
        processedCount: 4,
      },
    })

    unsubscribe()
    expect(source?.closed).toBe(true)
  })

  it('emits a calm disconnect event when the stream fails', () => {
    const eventSources: MockEventSource[] = []
    vi.stubGlobal(
      'EventSource',
      class EventSourceStub extends MockEventSource {
        constructor(url: string) {
          super(url)
          eventSources.push(this)
        }
      },
    )

    const client = createBackendReportsClient({ baseUrl: backendBaseUrl })
    const onEvent = vi.fn()
    client.streamReport('report-1001', onEvent)
    const source = eventSources[0]

    source?.emitError()

    expect(onEvent).toHaveBeenCalledWith({
      type: 'report.stream_disconnected',
      data: {
        message: 'Live updates paused. Refresh or try again in a moment.',
      },
    })
    expect(source?.closed).toBe(true)
  })
})

function buildReportsResponse() {
  return {
    reports: [
      {
        id: 'report-older',
        status: 'created',
        bottleCount: 2,
        startedAt: '2026-04-15T12:00:00.000Z',
      },
      {
        id: 'report-newer',
        status: 'reviewed',
        bottleCount: 3,
        startedAt: '2026-04-16T12:00:00.000Z',
        completedAt: '2026-04-16T12:10:00.000Z',
      },
    ],
  }
}

function buildReportDetailResponse() {
  return {
    id: 'report-1002',
    status: 'unreviewed',
    bottleRecords: [
      {
        id: 'record-1',
        imageUrl: '/uploads/record-1.jpg',
        bottleName: 'Wild Turkey 101',
        fillPercent: 40,
        corrected: false,
        status: 'inferred',
      },
    ],
  }
}

function buildBottleSearchResponse() {
  return {
    bottles: [
      {
        id: 'bottle-1',
        name: 'Espolon Blanco',
        category: 'tequila',
        volumeMl: 750,
      },
    ],
  }
}

function buildLocationsResponse() {
  return {
    locations: [
      {
        id: 'location-1',
        name: 'Main Bar',
        createdAt: '2026-04-16T12:00:00.000Z',
      },
    ],
  }
}

function buildReviewedDetailResponse() {
  return {
    id: 'report-1003',
    status: 'reviewed',
    bottleRecords: [
      {
        id: 'record-1',
        imageUrl: '/uploads/record-1.jpg',
        bottleName: 'Campari',
        fillPercent: 60,
        corrected: true,
        status: 'reviewed',
      },
    ],
  }
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
    ...init,
  })
}

class MockEventSource {
  readonly listeners = new Map<string, Set<(event: Event | MessageEvent<string>) => void>>()
  closed = false
  readonly url: string

  constructor(url: string) {
    this.url = url
  }

  addEventListener(type: string, listener: (event: Event | MessageEvent<string>) => void) {
    const listeners = this.listeners.get(type) ?? new Set()
    listeners.add(listener)
    this.listeners.set(type, listeners)
  }

  removeEventListener(type: string, listener: (event: Event | MessageEvent<string>) => void) {
    this.listeners.get(type)?.delete(listener)
  }

  emit(type: string, data: unknown) {
    const event = { data: JSON.stringify(data) } as MessageEvent<string>
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event)
    }
  }

  emitError() {
    const event = new Event('error')
    for (const listener of this.listeners.get('error') ?? []) {
      listener(event)
    }
  }

  close() {
    this.closed = true
  }
}
