import { API_BASE_URL } from './config'
import type {
  ReportDetail,
  ReportListItem,
  ReportProgress,
  ReportBottleRecord,
  BottleSearchResult,
  LocationListItem,
} from '@bartools/types'

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`API ${status}: ${body}`)
    this.name = 'ApiError'
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init)
  if (!res.ok) {
    const body = await res.text().catch(() => 'unknown error')
    throw new ApiError(res.status, body)
  }
  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Report lifecycle
// ---------------------------------------------------------------------------

type CreateReportResponse = {
  id: string
  userId: string
  venueId: string
  locationId: string | null
  status: string
  photoCount: number
  processedCount: number
  startedAt: string
  reviewedAt: string | null
}

export function createReport(
  userId: string,
  venueId: string,
  locationId?: string,
): Promise<CreateReportResponse> {
  return fetchJson('/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, venueId, locationId: locationId ?? null }),
  })
}

type UploadPhotosResponse = {
  reportId: string
  photos: { id: string; photoUrl: string; sortOrder: number }[]
}

export function uploadPhotos(
  reportId: string,
  photoUris: string[],
): Promise<UploadPhotosResponse> {
  const formData = new FormData()
  for (const [i, uri] of photoUris.entries()) {
    // React Native's FormData accepts {uri,type,name} objects for file uploads
    formData.append(`photo_${i}`, { uri, type: 'image/jpeg', name: `photo_${i}.jpg` })
  }
  return fetchJson(`/reports/${reportId}/photos`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type — RN sets the multipart boundary automatically
  })
}

type SubmitReportResponse = {
  reportId: string
  enqueued: number
  queueModes: string[]
}

export function submitReport(reportId: string): Promise<SubmitReportResponse> {
  return fetchJson(`/reports/${reportId}/submit`, { method: 'POST' })
}

// ---------------------------------------------------------------------------
// Report queries
// ---------------------------------------------------------------------------

export function getReport(reportId: string): Promise<ReportDetail> {
  return fetchJson(`/reports/${reportId}`)
}

export function listReports(): Promise<{ reports: ReportListItem[] }> {
  return fetchJson('/reports')
}

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

type ReviewRecord = {
  id: string
  bottleId: string
  fillPercent: number // 0-100 in the UI
}

/**
 * Submit review for a report. Converts fillPercent (0-100) to fillTenths (0-10)
 * at this boundary — the only place the conversion happens.
 */
export function reviewReport(
  reportId: string,
  userId: string,
  records: ReviewRecord[],
): Promise<ReportDetail> {
  return fetchJson(`/reports/${reportId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      records: records.map((r) => ({
        id: r.id,
        bottleId: r.bottleId,
        fillTenths: Math.round(r.fillPercent / 10),
      })),
    }),
  })
}

// ---------------------------------------------------------------------------
// Bottle search
// ---------------------------------------------------------------------------

export function searchBottles(
  query: string,
): Promise<{ bottles: BottleSearchResult[] }> {
  return fetchJson(`/bottles/search?q=${encodeURIComponent(query)}`)
}

// ---------------------------------------------------------------------------
// Venue locations
// ---------------------------------------------------------------------------

export function getLocations(
  venueId: string,
): Promise<{ locations: LocationListItem[] }> {
  return fetchJson(`/venues/${venueId}/locations`)
}

// ---------------------------------------------------------------------------
// SSE stream URL (not a fetch — returns the URL for EventSource)
// ---------------------------------------------------------------------------

export function getReportStreamUrl(reportId: string): string {
  return `${API_BASE_URL}/reports/${reportId}/stream`
}

// ---------------------------------------------------------------------------
// Image URL helper
// ---------------------------------------------------------------------------

export function resolveImageUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${API_BASE_URL}${path}`
}
