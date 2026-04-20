import { API_BASE_URL } from './config'
import type {
  ReportDetail,
  ReportListItem,
  ReportStatus,
  BottleSearchResult,
  LocationListItem,
  InventoryListItem,
  ManualBottleInput,
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
  status: ReportStatus
  photoCount: number
  processedCount: number
  startedAt: string
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

// MIME types the backend presign endpoint accepts. Keep in sync with the
// allowlist in packages/backend/src/index.ts.
export type PhotoContentType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/heic'
  | 'image/heif'
  | 'image/webp'

// Extension → MIME, covering what vision-camera and expo-image-picker emit on
// iOS/Android. Anything we can't match falls back to jpeg, which is also what
// both libraries default to.
export function inferPhotoContentType(uri: string): PhotoContentType {
  const ext = uri.split('.').pop()?.toLowerCase() ?? ''
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'heic':
      return 'image/heic'
    case 'heif':
      return 'image/heif'
    case 'webp':
      return 'image/webp'
    default:
      return 'image/jpeg'
  }
}

export type PresignedUpload = {
  object: string
  putUrl: string
  contentType: PhotoContentType
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
  uploads: Array<{ contentType: PhotoContentType }>,
): Promise<PresignResponse> {
  return fetchJson(`/reports/${encodePath(reportId)}/photos/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploads }),
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
 * PUT a local file directly to a GCS V4-signed URL. Uses the `File` API from
 * `expo-file-system` to read raw bytes so we avoid multipart encoding (GCS
 * rejects multipart bodies on a signed PUT) and the base64→bytes round-trip.
 *
 * `contentType` MUST equal the value the presign step was signed with, or GCS
 * returns a signature mismatch.
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
  const requested = photoUris.map((uri) => ({ contentType: inferPhotoContentType(uri) }))
  const { uploads } = await presignUploads(reportId, requested)
  if (uploads.length !== photoUris.length) {
    throw new Error(
      `presign returned ${uploads.length} URLs for ${photoUris.length} photos`,
    )
  }
  await Promise.all(
    photoUris.map((uri, i) =>
      uploadToGcs(uploads[i]!.putUrl, uri, uploads[i]!.contentType),
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
  bottleId?: string
  bottle?: ManualBottleInput
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
        ...(r.bottleId ? { bottleId: r.bottleId } : { bottle: r.bottle }),
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
// Inventory
// ---------------------------------------------------------------------------

export function getVenueInventory(
  venueId: string,
): Promise<{ items: InventoryListItem[] }> {
  return fetchJson(`/venues/${encodePath(venueId)}/inventory`)
}

export function getLocationInventory(
  locationId: string,
): Promise<{ items: InventoryListItem[] }> {
  return fetchJson(`/locations/${encodePath(locationId)}/inventory`)
}

export function addInventoryItem(input: {
  locationId: string
  bottleId?: string
  bottle?: ManualBottleInput
  fillPercent: number
  notes?: string
}): Promise<InventoryListItem> {
  const body: Record<string, unknown> = {
    locationId: input.locationId,
    fillPercent: input.fillPercent,
  }
  if (input.bottleId !== undefined) body.bottleId = input.bottleId
  if (input.bottle !== undefined) body.bottle = input.bottle
  if (input.notes !== undefined) body.notes = input.notes
  return fetchJson('/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
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
    try {
      const url = new URL(path)
      const apiHost = new URL(API_BASE_URL).host
      const isGcsSignedUrl =
        url.protocol === 'https:' &&
        (url.host === 'storage.googleapis.com' ||
          url.host.endsWith('.storage.googleapis.com'))
      if (url.host === apiHost || isGcsSignedUrl) return path
      return '' // reject URLs outside our API domain or trusted object storage
    } catch {
      return ''
    }
  }
  return `${API_BASE_URL}${path}`
}
