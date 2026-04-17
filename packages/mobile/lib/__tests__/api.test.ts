import { describe, it, expect, beforeEach, afterAll, mock } from 'bun:test'

// Stub expo-file-system before api.ts (which imports `File`) is evaluated —
// the real module pulls in react-native, which Bun can't parse (Flow syntax).
mock.module('expo-file-system', () => ({
  File: class {
    constructor(public uri: string) {}
    // Return a trivial ArrayBuffer; tests assert on fetch args, not bytes.
    async arrayBuffer(): Promise<ArrayBuffer> {
      return new ArrayBuffer(0)
    }
  },
}))

// Track fetch calls manually for type-safe assertions
const fetchCalls: Array<{ url: string; init: RequestInit | undefined }> = []
const mockResponses: Array<{
  ok: boolean
  status?: number
  json: () => Promise<Record<string, unknown>>
  text: () => Promise<string>
}> = []

function queueResponse(body: Record<string, unknown>) {
  mockResponses.push({
    ok: true,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(''),
  })
}

function queueErrorResponse(status: number, text: string) {
  mockResponses.push({
    ok: false,
    status,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(text),
  })
}

// Save original fetch so we can restore it after tests
const originalFetch = globalThis.fetch

// Install a typed fetch interceptor
globalThis.fetch = ((url: string | URL | Request, init?: RequestInit) => {
  fetchCalls.push({ url: String(url), init })
  const response = mockResponses.shift() ?? {
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  }
  return Promise.resolve(response as Response)
}) as typeof fetch

afterAll(() => {
  globalThis.fetch = originalFetch
})

import {
  createReport,
  uploadPhotos,
  submitReport,
  getReport,
  listReports,
  reviewReport,
  searchBottles,
  getLocations,
  getReportStreamUrl,
  resolveImageUrl,
  ApiError,
} from '../api'

function lastCall() {
  return fetchCalls[0]
}

describe('api client', () => {
  beforeEach(() => {
    fetchCalls.length = 0
    mockResponses.length = 0
  })

  it('createReport POSTs to /reports with JSON body', async () => {
    queueResponse({ id: 'r-1', status: 'created' })

    const result = await createReport('user-1', 'venue-1', 'loc-1')

    expect(fetchCalls).toHaveLength(1)
    expect(lastCall().url).toContain('/reports')
    expect(lastCall().url).not.toContain('/reports/')
    expect(lastCall().init?.method).toBe('POST')
    const body = JSON.parse(lastCall().init?.body as string)
    expect(body).toEqual({ userId: 'user-1', venueId: 'venue-1', locationId: 'loc-1' })
    expect(result.id).toBe('r-1')
  })

  it('createReport sends locationId null when not provided', async () => {
    queueResponse({ id: 'r-2' })

    await createReport('user-1', 'venue-1')

    const body = JSON.parse(lastCall().init?.body as string)
    expect(body.locationId).toBeNull()
  })

  it('submitReport POSTs to /reports/:id/submit', async () => {
    queueResponse({ reportId: 'r-1', enqueued: 3 })

    await submitReport('r-1')

    expect(lastCall().url).toContain('/reports/r-1/submit')
    expect(lastCall().init?.method).toBe('POST')
  })

  it('getReport GETs /reports/:id', async () => {
    queueResponse({ id: 'r-1', bottleRecords: [] })

    await getReport('r-1')

    expect(lastCall().url).toContain('/reports/r-1')
  })

  it('listReports GETs /reports', async () => {
    queueResponse({ reports: [] })

    await listReports()

    expect(lastCall().url).toMatch(/\/reports$/)
  })

  it('searchBottles GETs /bottles/search with encoded query', async () => {
    queueResponse({ bottles: [] })

    await searchBottles("Jack Daniel's")

    expect(lastCall().url).toContain('/bottles/search?q=Jack%20Daniel')
  })

  it('getLocations GETs /venues/:venueId/locations', async () => {
    queueResponse({ locations: [] })

    await getLocations('v-1')

    expect(lastCall().url).toContain('/venues/v-1/locations')
  })

  it('uploadPhotos runs presign → parallel PUTs → complete with image/jpeg', async () => {
    // 1) presign response
    queueResponse({
      uploads: [
        { object: 'obj-a', putUrl: 'https://gcs.example.com/a?sig=1', expiresAt: '2030-01-01T00:00:00Z' },
        { object: 'obj-b', putUrl: 'https://gcs.example.com/b?sig=2', expiresAt: '2030-01-01T00:00:00Z' },
      ],
    })
    // 2) two GCS PUTs
    queueResponse({})
    queueResponse({})
    // 3) complete response
    queueResponse({
      scans: [
        { id: 's-1', object: 'obj-a', sortOrder: 0 },
        { id: 's-2', object: 'obj-b', sortOrder: 1 },
      ],
    })

    const result = await uploadPhotos('r-1', ['file:///a.jpg', 'file:///b.jpg'])

    // Presign call
    expect(fetchCalls[0]!.url).toContain('/reports/r-1/photos/presign')
    expect(fetchCalls[0]!.init?.method).toBe('POST')
    const presignBody = JSON.parse(fetchCalls[0]!.init?.body as string)
    expect(presignBody).toEqual({ count: 2, contentType: 'image/jpeg' })

    // GCS PUT calls — order may vary (Promise.all), but both must be PUTs with image/jpeg
    const gcsCalls = fetchCalls.slice(1, 3)
    const gcsUrls = gcsCalls.map((c) => c.url).sort()
    expect(gcsUrls).toEqual(['https://gcs.example.com/a?sig=1', 'https://gcs.example.com/b?sig=2'])
    for (const call of gcsCalls) {
      expect(call.init?.method).toBe('PUT')
      const headers = call.init?.headers as Record<string, string> | undefined
      expect(headers?.['Content-Type']).toBe('image/jpeg')
    }

    // Complete call
    expect(fetchCalls[3]!.url).toContain('/reports/r-1/photos/complete')
    expect(fetchCalls[3]!.init?.method).toBe('POST')
    const completeBody = JSON.parse(fetchCalls[3]!.init?.body as string)
    expect(completeBody).toEqual({
      uploads: [
        { object: 'obj-a', sortOrder: 0 },
        { object: 'obj-b', sortOrder: 1 },
      ],
    })

    expect(result.scans).toHaveLength(2)
  })

  it('reviewReport converts fillPercent (0-100) to fillTenths (0-10)', async () => {
    queueResponse({ id: 'r-1', bottleRecords: [] })

    await reviewReport('r-1', 'user-1', [
      { id: 'rec-1', bottleId: 'b-1', fillPercent: 70 },
      { id: 'rec-2', bottleId: 'b-2', fillPercent: 100 },
      { id: 'rec-3', bottleId: 'b-3', fillPercent: 0 },
      { id: 'rec-4', bottleId: 'b-4', fillPercent: 25 },
    ])

    const body = JSON.parse(lastCall().init?.body as string)
    expect(body.userId).toBe('user-1')
    expect(body.records).toEqual([
      { id: 'rec-1', bottleId: 'b-1', fillTenths: 7 },
      { id: 'rec-2', bottleId: 'b-2', fillTenths: 10 },
      { id: 'rec-3', bottleId: 'b-3', fillTenths: 0 },
      { id: 'rec-4', bottleId: 'b-4', fillTenths: 3 },
    ])
  })

  it('throws ApiError on non-ok response', async () => {
    queueErrorResponse(404, '{"error":"report_not_found"}')

    try {
      await getReport('nonexistent')
      expect(true).toBe(false)
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).status).toBe(404)
      expect((e as ApiError).body).toContain('report_not_found')
    }
  })

  it('getReportStreamUrl returns full SSE URL', () => {
    const url = getReportStreamUrl('r-1')
    expect(url).toContain('/reports/r-1/stream')
  })

  it('resolveImageUrl prepends base URL for relative paths', () => {
    expect(resolveImageUrl('/uploads/photo.jpg')).toContain('/uploads/photo.jpg')
    expect(resolveImageUrl('/uploads/photo.jpg')).toMatch(/^http/)
  })

  it('resolveImageUrl rejects URLs from unknown domains', () => {
    expect(resolveImageUrl('https://cdn.example.com/photo.jpg')).toBe('')
  })

  it('resolveImageUrl passes through URLs from the API domain', () => {
    // API_BASE_URL defaults to http://localhost:3000 in tests
    expect(resolveImageUrl('http://localhost:3000/uploads/photo.jpg')).toBe('http://localhost:3000/uploads/photo.jpg')
  })
})
