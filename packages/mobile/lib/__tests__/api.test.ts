import { describe, it, expect, beforeEach, mock } from 'bun:test'

// Mock fetch globally before importing the module
const mockFetch = mock(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  }),
)
globalThis.fetch = mockFetch as unknown as typeof fetch

// We need to test the api module's internal logic.
// Import after setting up fetch mock.
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

describe('api client', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
      }),
    )
  })

  // -------------------------------------------------------------------------
  // URL construction
  // -------------------------------------------------------------------------

  it('createReport POSTs to /reports with JSON body', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'r-1', status: 'created' }),
        text: () => Promise.resolve(''),
      }),
    )

    const result = await createReport('user-1', 'venue-1', 'loc-1')

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/reports')
    expect(url).not.toContain('/reports/')
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
    const body = JSON.parse(init.body as string)
    expect(body).toEqual({ userId: 'user-1', venueId: 'venue-1', locationId: 'loc-1' })
    expect(result).toEqual({ id: 'r-1', status: 'created' })
  })

  it('createReport sends locationId null when not provided', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'r-2' }),
        text: () => Promise.resolve(''),
      }),
    )

    await createReport('user-1', 'venue-1')

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(init.body as string)
    expect(body.locationId).toBeNull()
  })

  it('submitReport POSTs to /reports/:id/submit', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ reportId: 'r-1', enqueued: 3 }),
        text: () => Promise.resolve(''),
      }),
    )

    await submitReport('r-1')

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/reports/r-1/submit')
    expect(init.method).toBe('POST')
  })

  it('getReport GETs /reports/:id', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'r-1', bottleRecords: [] }),
        text: () => Promise.resolve(''),
      }),
    )

    await getReport('r-1')

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('/reports/r-1')
  })

  it('listReports GETs /reports', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ reports: [] }),
        text: () => Promise.resolve(''),
      }),
    )

    await listReports()

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toMatch(/\/reports$/)
  })

  it('searchBottles GETs /bottles/search with encoded query', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ bottles: [] }),
        text: () => Promise.resolve(''),
      }),
    )

    await searchBottles("Jack Daniel's")

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('/bottles/search?q=Jack%20Daniel\'s')
  })

  it('getLocations GETs /venues/:venueId/locations', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ locations: [] }),
        text: () => Promise.resolve(''),
      }),
    )

    await getLocations('v-1')

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('/venues/v-1/locations')
  })

  // -------------------------------------------------------------------------
  // Upload photos (FormData construction)
  // -------------------------------------------------------------------------

  it('uploadPhotos sends multipart FormData without Content-Type header', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ reportId: 'r-1', photos: [] }),
        text: () => Promise.resolve(''),
      }),
    )

    await uploadPhotos('r-1', ['file:///a.jpg', 'file:///b.jpg'])

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/reports/r-1/photos')
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(FormData)
    // Content-Type should NOT be explicitly set (RN sets multipart boundary)
    expect(init.headers).toBeUndefined()
  })

  // -------------------------------------------------------------------------
  // Review — fillPercent to fillTenths conversion
  // -------------------------------------------------------------------------

  it('reviewReport converts fillPercent (0-100) to fillTenths (0-10)', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'r-1', bottleRecords: [] }),
        text: () => Promise.resolve(''),
      }),
    )

    await reviewReport('r-1', 'user-1', [
      { id: 'rec-1', bottleId: 'b-1', fillPercent: 70 },
      { id: 'rec-2', bottleId: 'b-2', fillPercent: 100 },
      { id: 'rec-3', bottleId: 'b-3', fillPercent: 0 },
      { id: 'rec-4', bottleId: 'b-4', fillPercent: 25 }, // rounds to 3
    ])

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(init.body as string)
    expect(body.userId).toBe('user-1')
    expect(body.records).toEqual([
      { id: 'rec-1', bottleId: 'b-1', fillTenths: 7 },
      { id: 'rec-2', bottleId: 'b-2', fillTenths: 10 },
      { id: 'rec-3', bottleId: 'b-3', fillTenths: 0 },
      { id: 'rec-4', bottleId: 'b-4', fillTenths: 3 }, // Math.round(25/10) = 3
    ])
  })

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  it('throws ApiError on non-ok response', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve('{"error":"report_not_found"}'),
      }),
    )

    try {
      await getReport('nonexistent')
      expect(true).toBe(false) // should not reach
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).status).toBe(404)
      expect((e as ApiError).body).toContain('report_not_found')
    }
  })

  // -------------------------------------------------------------------------
  // URL helpers
  // -------------------------------------------------------------------------

  it('getReportStreamUrl returns full SSE URL', () => {
    const url = getReportStreamUrl('r-1')
    expect(url).toContain('/reports/r-1/stream')
  })

  it('resolveImageUrl prepends base URL for relative paths', () => {
    expect(resolveImageUrl('/uploads/photo.jpg')).toContain('/uploads/photo.jpg')
    expect(resolveImageUrl('/uploads/photo.jpg')).toMatch(/^http/)
  })

  it('resolveImageUrl passes through absolute URLs', () => {
    expect(resolveImageUrl('https://cdn.example.com/photo.jpg')).toBe('https://cdn.example.com/photo.jpg')
  })
})
