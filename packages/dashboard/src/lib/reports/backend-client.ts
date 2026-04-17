import {
  ITEM_CATEGORIES,
  REPORT_RECORD_STATUSES,
  REPORT_STATUSES,
  type BottleSearchResult,
  type LocationListItem,
  type ModelOutput,
  type ReportBottleRecord,
  type ReportDetail,
  type ReportListItem,
  type ReportProgress,
} from '@bartools/types'
import { z } from 'zod'
import { sortReportsNewestFirst } from '../reports-view'
import type {
  ReportsClient,
  ReportsIntegrationReadiness,
  ReportStreamEvent,
} from './client'

const liveReadiness: ReportsIntegrationReadiness = {
  backendEnabled: true,
  blockedReason: 'review_submission_requires_user_context',
  message: 'Review submission requires user context.',
}

const modelOutputSchema = z.object({
  bottleName: z.string().optional(),
  category: z.string().optional(),
  upc: z.string().optional(),
  volumeMl: z.number().optional(),
  fillPercent: z.number().min(0).max(100).optional(),
}) satisfies z.ZodType<ModelOutput>

const reportListItemSchema = z.object({
  id: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  userId: z.string().optional(),
  userDisplayName: z.string().optional(),
  bottleCount: z.number().nonnegative(),
  status: z.enum(REPORT_STATUSES),
}) satisfies z.ZodType<ReportListItem>

const reportBottleRecordSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  bottleName: z.string(),
  category: z.string().optional(),
  upc: z.string().optional(),
  volumeMl: z.number().optional(),
  fillPercent: z.number().min(0).max(100),
  corrected: z.boolean(),
  status: z.enum(REPORT_RECORD_STATUSES),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  originalModelOutput: modelOutputSchema.optional(),
  correctedValues: modelOutputSchema.optional(),
}) satisfies z.ZodType<ReportBottleRecord>

const reportDetailSchema = z.object({
  id: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  userId: z.string().optional(),
  userDisplayName: z.string().optional(),
  status: z.enum(REPORT_STATUSES),
  bottleRecords: z.array(reportBottleRecordSchema),
}) satisfies z.ZodType<ReportDetail>

const reportProgressSchema = z.object({
  id: z.string(),
  status: z.enum(REPORT_STATUSES),
  photoCount: z.number().nonnegative(),
  processedCount: z.number().nonnegative(),
}) satisfies z.ZodType<ReportProgress>

const bottleSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(ITEM_CATEGORIES),
  upc: z.string().optional(),
  volumeMl: z.number().optional(),
}) satisfies z.ZodType<BottleSearchResult>

const locationListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().optional(),
}) satisfies z.ZodType<LocationListItem>

const reportCollectionSchema = z.object({
  reports: z.array(reportListItemSchema),
})

const bottleSearchCollectionSchema = z.object({
  bottles: z.array(bottleSearchResultSchema),
})

const locationCollectionSchema = z.object({
  locations: z.array(locationListItemSchema),
})

const apiErrorSchema = z.object({
  error: z.string(),
})

export function createBackendReportsClient({
  baseUrl,
}: {
  baseUrl: string
}): ReportsClient {
  return {
    readiness: liveReadiness,
    async listReports() {
      const payload = await requestJson(resolveApiUrl(baseUrl, '/reports'), reportCollectionSchema)

      return sortReportsNewestFirst(payload.reports)
    },
    async getReport(reportId) {
      const detail = await requestJson(
        resolveApiUrl(baseUrl, `/reports/${encodeURIComponent(reportId)}`),
        reportDetailSchema,
        { allowNotFound: true },
      )

      return detail ? normalizeReportDetail(detail, baseUrl) : null
    },
    streamReport(reportId, onEvent) {
      return openReportStream(baseUrl, reportId, onEvent)
    },
    async reviewReport(reportId, payload) {
      const detail = await requestJson(
        resolveApiUrl(baseUrl, `/reports/${encodeURIComponent(reportId)}/review`),
        reportDetailSchema,
        {
          body: JSON.stringify(payload),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      )

      return normalizeReportDetail(detail, baseUrl)
    },
    async searchBottles(query) {
      const payload = await requestJson(
        resolveApiUrl(baseUrl, `/bottles/search?q=${encodeURIComponent(query)}`),
        bottleSearchCollectionSchema,
      )

      return payload.bottles
    },
    async listVenueLocations(venueId) {
      const payload = await requestJson(
        resolveApiUrl(baseUrl, `/venues/${encodeURIComponent(venueId)}/locations`),
        locationCollectionSchema,
      )

      return payload.locations
    },
  }
}

function openReportStream(
  baseUrl: string,
  reportId: string,
  onEvent: (event: ReportStreamEvent) => void,
) {
  if (typeof globalThis.EventSource === 'undefined') {
    return () => undefined
  }

  const source = new globalThis.EventSource(
    resolveApiUrl(baseUrl, `/reports/${encodeURIComponent(reportId)}/stream`),
  )
  const listeners = registerStreamListeners(source, baseUrl, onEvent)

  return () => {
    for (const [eventType, listener] of listeners) {
      source.removeEventListener(eventType, listener)
    }

    source.close()
  }
}

function registerStreamListeners(
  source: EventSource,
  baseUrl: string,
  onEvent: (event: ReportStreamEvent) => void,
) {
  const listeners: Array<[string, EventListener]> = []

  for (const eventType of streamEventTypes) {
    const listener: EventListener = (event) => {
      if (!hasEventData(event)) {
        return
      }

      const nextEvent = parseStreamEvent(eventType, event.data, baseUrl)

      if (nextEvent) {
        onEvent(nextEvent)
      }
    }

    source.addEventListener(eventType, listener)
    listeners.push([eventType, listener])
  }

  const errorListener: EventListener = () => {
    onEvent({
      type: 'report.stream_disconnected',
      data: {
        message: 'Live updates paused. Refresh or try again in a moment.',
      },
    })
    source.close()
  }

  source.addEventListener('error', errorListener)
  listeners.push(['error', errorListener])

  return listeners
}

const streamEventTypes = [
  'report.progress',
  'record.inferred',
  'record.failed',
  'record.reviewed',
  'report.ready_for_review',
] as const satisfies ReportStreamEvent['type'][]

function parseStreamEvent(
  eventType: ReportStreamEvent['type'],
  data: string,
  baseUrl: string,
): ReportStreamEvent | null {
  const payload = JSON.parse(data) as unknown

  switch (eventType) {
    case 'report.progress':
    case 'report.ready_for_review':
      return {
        type: eventType,
        data: reportProgressSchema.parse(payload),
      }
    case 'record.inferred':
    case 'record.failed':
    case 'record.reviewed':
      return {
        type: eventType,
        data: normalizeReportBottleRecord(reportBottleRecordSchema.parse(payload), baseUrl),
      }
    default:
      return null
  }
}

async function requestJson<T>(
  url: string,
  schema: z.ZodType<T>,
  init: JsonRequestOptions & { allowNotFound: true },
): Promise<T | null>
async function requestJson<T>(
  url: string,
  schema: z.ZodType<T>,
  init?: JsonRequestOptions,
): Promise<T>
async function requestJson<T>(
  url: string,
  schema: z.ZodType<T>,
  init: JsonRequestOptions = {},
): Promise<T | null> {
  const response = await fetch(url, buildRequestInit(init))

  if (init.allowNotFound && response.status === 404) {
    return null
  }

  const payload = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(extractApiError(payload, response.status))
  }

  return schema.parse(payload)
}

type JsonRequestOptions = {
  allowNotFound?: boolean
  body?: string
  headers?: HeadersInit
  method?: 'GET' | 'POST'
}

function buildRequestInit(init: JsonRequestOptions): RequestInit {
  return init.body
    ? {
        body: init.body,
        headers: init.headers,
        method: init.method ?? 'POST',
      }
    : {
        headers: init.headers ?? { Accept: 'application/json' },
        method: init.method ?? 'GET',
      }
}

async function parseJsonResponse(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  return JSON.parse(text) as unknown
}

function extractApiError(payload: unknown, status: number) {
  const parsedError = apiErrorSchema.safeParse(payload)

  return parsedError.success ? parsedError.data.error : `request_failed_${status}`
}

function resolveApiUrl(baseUrl: string, path: string) {
  if (isAbsoluteUrl(baseUrl)) {
    return new URL(path, `${baseUrl}/`).toString()
  }

  const normalizedBaseUrl = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${normalizedBaseUrl}${normalizedPath}`
}

function hasEventData(event: Event): event is MessageEvent<string> {
  return 'data' in event && typeof event.data === 'string'
}

function isAbsoluteUrl(value: string) {
  return /^[a-z][a-z\d+\-.]*:\/\//iu.test(value)
}

function normalizeReportDetail(detail: ReportDetail, baseUrl: string): ReportDetail {
  return {
    ...detail,
    bottleRecords: detail.bottleRecords.map((record) =>
      normalizeReportBottleRecord(record, baseUrl),
    ),
  }
}

function normalizeReportBottleRecord(
  record: ReportBottleRecord,
  baseUrl: string,
): ReportBottleRecord {
  return {
    ...record,
    imageUrl: record.imageUrl ? resolveApiUrl(baseUrl, record.imageUrl) : record.imageUrl,
  }
}
