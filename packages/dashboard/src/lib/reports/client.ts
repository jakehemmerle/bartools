import type {
  BottleSearchResult,
  LocationListItem,
  ReportBottleRecord,
  ReportDetail,
  ReportListItem,
  ReportProgress,
} from '@bartools/types'
import { reportsScenario } from '../fixtures/scenarios'
import { sortReportsNewestFirst } from '../reports-view'

export type ReportsIntegrationReadiness = {
  backendEnabled: false
  blockedReason: 'venue_auth_context_required'
  message: string
}

export type ReportReviewRecordInput = {
  id: string
  bottleId: string
  fillTenths: number
}

export type ReportReviewInput = {
  userId: string
  records: ReportReviewRecordInput[]
}

export type ReportStreamEvent =
  | { type: 'report.progress'; data: ReportProgress }
  | { type: 'record.inferred'; data: ReportBottleRecord }
  | { type: 'record.failed'; data: ReportBottleRecord }
  | { type: 'record.reviewed'; data: ReportBottleRecord }
  | { type: 'report.ready_for_review'; data: ReportProgress }

export type ReportsClient = {
  readiness: ReportsIntegrationReadiness
  listReports(): Promise<ReportListItem[]>
  getReport(reportId: string): Promise<ReportDetail | null>
  streamReport(
    reportId: string,
    onEvent: (event: ReportStreamEvent) => void,
  ): () => void
  reviewReport(reportId: string, payload: ReportReviewInput): Promise<ReportDetail>
  searchBottles(query: string): Promise<BottleSearchResult[]>
  listVenueLocations(venueId: string): Promise<LocationListItem[]>
}

const readiness: ReportsIntegrationReadiness = {
  backendEnabled: false,
  blockedReason: 'venue_auth_context_required',
  message:
    'Live report access requires venue and user context. Review submission requires user context.',
}

export const fixtureBottleSearchResults: BottleSearchResult[] = [
  {
    id: 'bottle-1',
    name: "Tito's Handmade Vodka",
    category: 'vodka',
    upc: '619947000013',
    volumeMl: 750,
  },
  {
    id: 'bottle-2',
    name: 'Espolòn Blanco',
    category: 'tequila',
    upc: '080686834203',
    volumeMl: 750,
  },
  {
    id: 'bottle-3',
    name: 'Montelobos Mezcal',
    category: 'mezcal',
    upc: '618115630028',
    volumeMl: 750,
  },
  {
    id: 'bottle-4',
    name: 'Wild Turkey 101',
    category: 'bourbon',
    upc: '072105900151',
    volumeMl: 1000,
  },
]

export const fixtureLocationListItems: LocationListItem[] = [
  { id: 'location-1', name: 'Main Bar', createdAt: '2026-04-01T12:00:00-05:00' },
  { id: 'location-2', name: 'Back Bar', createdAt: '2026-04-01T12:00:00-05:00' },
]

type FixtureState = {
  reports: ReportListItem[]
  details: Record<string, ReportDetail>
}

export function createFixtureReportsClient(): ReportsClient {
  const state = cloneValue<FixtureState>({
    reports: reportsScenario.reports,
    details: reportsScenario.details,
  })

  return {
    readiness,
    async listReports() {
      return cloneValue(sortReportsNewestFirst(state.reports))
    },
    async getReport(reportId) {
      return state.details[reportId] ? cloneValue(state.details[reportId]) : null
    },
    streamReport(reportId, onEvent) {
      const detail = state.details[reportId]

      if (!detail) {
        return () => undefined
      }

      const timers: number[] = []

      if (detail.status === 'created') {
        timers.push(
          globalThis.setTimeout(() => {
            onEvent({
              type: 'report.progress',
              data: {
                id: detail.id,
                status: 'processing',
                photoCount: detail.bottleRecords.length,
                processedCount: 0,
              },
            })
          }, 120),
        )
      }

      if (detail.status === 'processing') {
        const inferredRecord = detail.bottleRecords.find((record) => record.status === 'pending')

        if (inferredRecord) {
          timers.push(
            globalThis.setTimeout(() => {
              onEvent({
                type: 'record.inferred',
                data: {
                  ...inferredRecord,
                  bottleName: 'Wild Turkey 101',
                  category: 'Bourbon',
                  upc: '072105900151',
                  volumeMl: 1000,
                  fillPercent: 40,
                  status: 'inferred',
                  originalModelOutput: {
                    bottleName: 'Wild Turkey 101',
                    fillPercent: 40,
                  },
                },
              })
            }, 120),
          )
        }

        timers.push(
          globalThis.setTimeout(() => {
            onEvent({
              type: 'report.ready_for_review',
              data: {
                id: detail.id,
                status: 'unreviewed',
                photoCount: detail.bottleRecords.length,
                processedCount: detail.bottleRecords.length,
              },
            })
          }, 240),
        )
      }

      return () => {
        for (const timer of timers) {
          globalThis.clearTimeout(timer)
        }
      }
    },
    async reviewReport(reportId, payload) {
      const detail = state.details[reportId]

      if (!detail) {
        throw new Error(`Unknown report: ${reportId}`)
      }

      const nextRecords = detail.bottleRecords.map((record) => {
        const reviewRecord = payload.records.find((item) => item.id === record.id)

        if (!reviewRecord) {
          throw new Error(`Missing review decision for record: ${record.id}`)
        }

        const matchedBottle = fixtureBottleSearchResults.find(
          (bottle) => bottle.id === reviewRecord.bottleId,
        )

        if (!matchedBottle) {
          throw new Error(`Unknown bottle: ${reviewRecord.bottleId}`)
        }

        const nextFillPercent = reviewRecord.fillTenths * 10
        const originalModelOutput =
          record.originalModelOutput ??
          {
            bottleName: record.bottleName,
            category: record.category,
            upc: record.upc,
            volumeMl: record.volumeMl,
            fillPercent: record.fillPercent,
          }

        const corrected =
          record.bottleName !== matchedBottle.name || record.fillPercent !== nextFillPercent

        return {
          ...record,
          bottleName: matchedBottle.name,
          category: matchedBottle.category,
          upc: matchedBottle.upc,
          volumeMl: matchedBottle.volumeMl,
          fillPercent: nextFillPercent,
          corrected,
          status: 'reviewed' as const,
          errorCode: undefined,
          errorMessage: undefined,
          originalModelOutput,
          correctedValues: corrected
            ? {
                bottleName: matchedBottle.name,
                category: matchedBottle.category,
                upc: matchedBottle.upc,
                volumeMl: matchedBottle.volumeMl,
                fillPercent: nextFillPercent,
              }
            : undefined,
        }
      })

      const nextDetail: ReportDetail = {
        ...detail,
        userId: payload.userId,
        status: 'reviewed',
        bottleRecords: nextRecords,
      }

      state.details[reportId] = nextDetail
      state.reports = state.reports.map((report) =>
        report.id === reportId ? { ...report, userId: payload.userId, status: 'reviewed' } : report,
      )

      return cloneValue(nextDetail)
    },
    async searchBottles(query) {
      const normalizedQuery = query.trim().toLowerCase()

      if (!normalizedQuery) {
        return []
      }

      return cloneValue(
        fixtureBottleSearchResults.filter((bottle) =>
          `${bottle.name} ${bottle.upc ?? ''}`.toLowerCase().includes(normalizedQuery),
        ),
      )
    },
    async listVenueLocations(venueId) {
      void venueId
      return cloneValue(fixtureLocationListItems)
    },
  }
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
