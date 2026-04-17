import { API_BASE_URL } from './config'
import type {
  ReportDetail,
  ReportListItem,
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
// Validation helpers
// ---------------------------------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value)
}

export function isValidFileUri(value: string): boolean {
  return value.startsWith('file://')
}

function encodePath(segment: string): string {
  return encodeURIComponent(segment)
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const REQUEST_TIMEOUT_MS = 30_000

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => 'unknown error')
      throw new ApiError(res.status, body)
    }
    return res.json() as Promise<T>
  } finally {
    clearTimeout(timeout)
  }
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

// ---------------------------------------------------------------------------
// Photo upload: presign → PUT to GCS → complete
// ---------------------------------------------------------------------------

// Content-Type used for every photo upload. MUST match what presign requested,
// or GCS V4 signature verification will reject the PUT.
const PHOTO_CONTENT_TYPE = 'image/jpeg'

export type PresignedUpload = {
  object: string
  putUrl: string
  expiresAt: string // ISO timestamp
}

export type PresignResponse = {
  uploads: PresignedUpload[]
}

export type CompleteUploadInput = {
  object: string
  sortOrder: number
}

export type CompletedScan = {
  id: string
  object: string
  sortOrder: number
}

export type CompleteResponse = {
  scans: CompletedScan[]
}

export function presignUploads(
  reportId: string,
  count: number,
): Promise<PresignResponse> {
  return fetchJson(`/reports/${encodePath(reportId)}/photos/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, contentType: PHOTO_CONTENT_TYPE }),
  })
}

export function completeUploads(
  reportId: string,
  uploads: CompleteUploadInput[],
): Promise<CompleteResponse> {
  return fetchJson(`/reports/${encodePath(reportId)}/photos/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploads }),
  })
}

/**
 * PUT a local file directly to a GCS V4-signed URL.
 *
 * Implementation note: uses `expo-file-system`'s new `File` API (v55+) to read
 * the file as an `ArrayBuffer` and send it as the raw request body. This avoids
 * multipart encoding — GCS rejects multipart bodies when it expects raw bytes —
 * and avoids the base64→bytes round-trip.
 *
 * The `Content-Type` header MUST exactly match the value passed at presign time
 * (currently hardcoded to `image/jpeg` on both sides) or GCS will reject the
 * request with a signature-mismatch error.
 */
export async function uploadToGcs(
  putUrl: string,
  fileUri: string,
  contentType: string,
): Promise<void> {
  // Dynamic import so the native `expo-file-system` module isn't loaded at
  // module-evaluation time — keeps unit tests (and any non-RN import graph)
  // from having to resolve the native chain up front.
  const { File } = await import('expo-file-system')
  const file = new File(fileUri)
  const body = await file.arrayBuffer()
  const res = await fetch(putUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, `GCS PUT failed: ${text.slice(0, 200)}`)
  }
}

export async function uploadPhotos(
  reportId: string,
  photoUris: string[],
): Promise<CompleteResponse> {
  const { uploads } = await presignUploads(reportId, photoUris.length)
  if (uploads.length !== photoUris.length) {
    throw new Error(
      `presign returned ${uploads.length} URLs for ${photoUris.length} photos`,
    )
  }
  await Promise.all(
    photoUris.map((uri, i) =>
      uploadToGcs(uploads[i]!.putUrl, uri, PHOTO_CONTENT_TYPE),
    ),
  )
  return completeUploads(
    reportId,
    photoUris.map((_, i) => ({ object: uploads[i]!.object, sortOrder: i })),
  )
}

type SubmitReportResponse = {
  reportId: string
  enqueued: number
  queueModes: string[]
}

export function submitReport(reportId: string): Promise<SubmitReportResponse> {
  return fetchJson(`/reports/${encodePath(reportId)}/submit`, { method: 'POST' })
}

// ---------------------------------------------------------------------------
// Report queries
// ---------------------------------------------------------------------------

export function getReport(reportId: string): Promise<ReportDetail> {
  return fetchJson(`/reports/${encodePath(reportId)}`)
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
  return fetchJson(`/reports/${encodePath(reportId)}/review`, {
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
  return fetchJson(`/venues/${encodePath(venueId)}/locations`)
}

// ---------------------------------------------------------------------------
// SSE stream URL (not a fetch — returns the URL for EventSource)
// ---------------------------------------------------------------------------

export function getReportStreamUrl(reportId: string): string {
  return `${API_BASE_URL}/reports/${encodePath(reportId)}/stream`
}

// ---------------------------------------------------------------------------
// Image URL helper
// ---------------------------------------------------------------------------

export function resolveImageUrl(path: string): string {
  if (path.startsWith('http')) {
    const url = new URL(path)
    const apiHost = new URL(API_BASE_URL).host
    if (url.host !== apiHost) return '' // reject URLs outside our API domain
    return path
  }
  return `${API_BASE_URL}${path}`
}
