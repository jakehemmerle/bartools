import type { BottleSearchResult, ReportDetail, ReportListItem } from '@bartools/types'
import { fixtureBottleSearchResults } from '../../../lib/reports/client'
import { baseReportsScenario } from '../../../lib/reports/base-scenario'

export const reviewBottleSearchResults = fixtureBottleSearchResults

const reviewedTemplate = cloneValue(
  baseReportsScenario.reports.find((report) => report.status === 'reviewed'),
)
const unreviewedTemplate = cloneValue(
  baseReportsScenario.reports.find((report) => report.status === 'unreviewed'),
)
const processingTemplate = cloneValue(
  baseReportsScenario.reports.find((report) => report.status === 'processing'),
)
const createdTemplate = cloneValue(
  baseReportsScenario.reports.find((report) => report.status === 'created'),
)

if (!reviewedTemplate || !unreviewedTemplate || !processingTemplate || !createdTemplate) {
  throw new Error('Review scenarios require one report fixture for each lifecycle state.')
}

export const reviewReportsList: ReportListItem[] = [
  {
    ...reviewedTemplate,
    id: '8b3c6b41',
    startedAt: '2026-04-24T08:30:00Z',
    completedAt: '2026-04-24T10:15:22Z',
    bottleCount: 142,
    userDisplayName: 'Elena Rostova',
  },
  {
    ...unreviewedTemplate,
    id: 'f9a12d7c',
    startedAt: '2026-04-24T11:00:00Z',
    completedAt: '2026-04-24T12:45:10Z',
    bottleCount: 87,
    userDisplayName: 'Alex Thorne',
  },
  {
    ...processingTemplate,
    id: '4c8e5f2a',
    startedAt: '2026-04-24T14:20:00Z',
    completedAt: undefined,
    bottleCount: 215,
    userDisplayName: 'System Admin',
  },
  {
    ...createdTemplate,
    id: '1d7b9e4f',
    startedAt: '2026-04-24T15:05:00Z',
    completedAt: undefined,
    bottleCount: 0,
    userDisplayName: 'Marcus Vance',
  },
  {
    ...reviewedTemplate,
    id: 'a2f5c1d8',
    startedAt: '2026-04-23T09:15:00Z',
    completedAt: '2026-04-23T11:30:45Z',
    bottleCount: 198,
    userDisplayName: 'Elena Rostova',
  },
]
export const reviewReportsEmpty: ReportListItem[] = []

export const reviewReportCreated: ReportDetail = cloneValue(
  baseReportsScenario.details['report-1000'],
)
reviewReportCreated.id = '1d7b9e4f'

export const reviewReportProcessing: ReportDetail = cloneValue(
  buildProcessingReviewDetail(),
)

export const reviewReportUnreviewed: ReportDetail = buildUnreviewedReviewDetail()

export const reviewReportReviewed: ReportDetail = cloneValue(
  baseReportsScenario.details['report-1003'],
)
reviewReportReviewed.id = '8b3c6b41-25f6-45ab-b0d7-13da62fbe098'

export const reviewReportComparison: ReportDetail = {
  ...cloneValue(baseReportsScenario.details['report-1003']),
  id: '8b3c6b41-25f6-45ab-b0d7-13da62fbe098',
  bottleRecords: cloneValue(
    baseReportsScenario.details['report-1003'].bottleRecords.filter(
      (record) => record.correctedValues || record.originalModelOutput,
    ),
  ).slice(0, 1),
}

export const reviewReportFailed: ReportDetail = buildFailedReviewDetail()

export function searchReviewBottles(query: string): BottleSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return []
  }

  return reviewBottleSearchResults.filter((bottle) =>
    `${bottle.name} ${bottle.upc ?? ''}`.toLowerCase().includes(normalizedQuery),
  )
}

function buildFailedReviewDetail(): ReportDetail {
  const source = cloneValue(baseReportsScenario.details['report-1002'])
  const failedRecord = source.bottleRecords.find((record) => record.status === 'failed')

  if (!failedRecord) {
    return source
  }

  return {
    ...source,
    id: 'f47ac10b-52c1-4b72-91f1-3d9a184a7e93',
    startedAt: '2026-10-24T10:15:00Z',
    completedAt: '2026-10-24T11:30:00Z',
    userDisplayName: 'J. Smith',
    bottleRecords: [
      {
        ...failedRecord,
        id: 'review-failed-1',
        imageUrl: '/fixtures/report-bottle-ruby.svg',
        bottleName: 'Campari 1L',
        errorCode: 'E-402',
        errorMessage:
          'Image too dark. Insufficient luminance to detect liquid level accurately.',
      },
      {
        ...failedRecord,
        id: 'review-failed-2',
        imageUrl: '/fixtures/report-bottle-amber.svg',
        bottleName: 'Unknown Entity',
        errorCode: 'E-105',
        errorMessage:
          'Label illegible due to intense glare. Brand recognition failed to match the bottle.',
      },
      {
        ...failedRecord,
        id: 'review-failed-3',
        bottleName: 'Bulleit Bourbon',
        imageUrl: '',
        errorCode: 'E-801',
        errorMessage: 'Image missing or corrupted. Visual analysis cannot be performed.',
      },
    ],
  }
}

function buildProcessingReviewDetail(): ReportDetail {
  const source = cloneValue(baseReportsScenario.details['report-1001'])
  const inferredRecord = source.bottleRecords.find((record) => record.status === 'inferred')
  const pendingRecord = source.bottleRecords.find((record) => record.status === 'pending')

  if (!inferredRecord || !pendingRecord) {
    return source
  }

  return {
    ...source,
    id: '4c8e5f2a',
    bottleRecords: [
      {
        ...inferredRecord,
        id: 'review-processing-1',
        bottleName: "Maker's Mark",
        category: 'Bourbon',
      },
      {
        ...pendingRecord,
        id: 'review-processing-2',
        imageUrl: '',
      },
      {
        ...pendingRecord,
        id: 'review-processing-3',
        imageUrl: '',
      },
    ],
  }
}

function buildUnreviewedReviewDetail(): ReportDetail {
  const source = cloneValue(baseReportsScenario.details['report-1002'])
  const inferredRecord = source.bottleRecords.find((record) => record.status === 'inferred')

  if (!inferredRecord) {
    return source
  }

  return {
    ...source,
    id: 'f47ac10b-52c1-4b72-91f1-3d9a184a7e93',
    startedAt: '2026-10-24T10:15:00Z',
    completedAt: '2026-10-24T11:30:00Z',
    userDisplayName: 'J. Smith',
    bottleRecords: [
      {
        ...inferredRecord,
        id: 'review-unreviewed-1',
        bottleName: 'Espolòn Blanco',
        category: 'Tequila',
        upc: '721059000018',
        volumeMl: 750,
        fillPercent: 40,
        originalModelOutput: {
          bottleName: 'Espolon Tequila Blanco 750ml',
          fillPercent: 40,
        },
      },
      {
        ...inferredRecord,
        id: 'review-unreviewed-2',
        bottleName: "Maker's Mark",
        category: 'Whiskey',
        upc: '085000020113',
        volumeMl: 1000,
        fillPercent: 80,
        originalModelOutput: {
          bottleName: "Maker's Mark",
          fillPercent: 80,
        },
      },
    ],
  }
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
