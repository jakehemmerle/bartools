import type { Dispatch, SetStateAction } from 'react'
import { startTransition, Suspense, useEffect, useRef, useState } from 'react'
import type { BottleSearchResult, ReportDetail } from '@bartools/types'
import { Await, useLoaderData, useParams, useRevalidator } from 'react-router-dom'
import { DelayedFallback } from '../../../components/primitives/delayed-fallback'
import { createReportReviewDraft, type ReportReviewRecordDraft } from '../../../lib/reports/review-draft'
import { applyReportStreamEvent, createReportStreamViewState } from '../../../lib/reports/stream'
import { useReportsClient } from '../../../lib/reports/provider'
import type {
  ReportDetailLoadResult,
  ReportDetailRouteData,
} from '../../../lib/reports/route-loaders'
import { ReportDetailScreen } from '../components/report-detail-screen'
import { ReportLoadErrorScreen } from '../components/report-load-error-screen'
import { ReportLoadingScreen } from '../components/report-loading-screen'
import { ReportNotFoundScreen } from '../components/report-not-found-screen'

type RecordSearchState = {
  query: string
  results: BottleSearchResult[]
}

export function ReportDetailRoute() {
  const { loadResult } = useLoaderData() as ReportDetailRouteData

  return (
    <Suspense
      fallback={
        <DelayedFallback>
          <ReportLoadingScreen />
        </DelayedFallback>
      }
    >
      <Await resolve={loadResult}>
        {(result: ReportDetailLoadResult) => (
          <ResolvedReportDetailRoute loadResult={result} />
        )}
      </Await>
    </Suspense>
  )
}

function ResolvedReportDetailRoute({
  loadResult,
}: {
  loadResult: ReportDetailLoadResult
}) {
  const revalidator = useRevalidator()

  if (loadResult.status === 'error') {
    return (
      <ReportLoadErrorScreen
        onRetry={() => {
          startTransition(() => {
            revalidator.revalidate()
          })
        }}
      />
    )
  }

  if (!loadResult.detail) {
    return <ReportNotFoundScreen />
  }

  return (
    <LoadedReportDetailRoute
      key={buildLoadedReportDetailKey(loadResult.detail)}
      initialDetail={loadResult.detail}
    />
  )
}

function LoadedReportDetailRoute({
  initialDetail,
}: {
  initialDetail: ReportDetail
}) {
  const client = useReportsClient()
  const { reportId = '' } = useParams()
  const [streamMessage, setStreamMessage] = useState<string | null>(null)
  const [detail, setDetail] = useState(initialDetail)
  const detailRef = useRef<ReportDetail>(initialDetail)
  const [reviewDraft, setReviewDraft] = useState<ReportReviewRecordDraft[]>(() =>
    createReportReviewDraft(initialDetail),
  )
  const [searchState, setSearchState] = useState<Record<string, RecordSearchState>>(() =>
    createInitialSearchState(initialDetail),
  )

  useEffect(() => {
    return client.streamReport(reportId, (event) => {
      if (event.type === 'report.stream_disconnected') {
        setStreamMessage(event.data.message)
        return
      }

      setStreamMessage(null)
      const currentDetail = detailRef.current
      const nextDetail = applyReportStreamEvent(
        createReportStreamViewState(currentDetail),
        event,
      ).detail

      detailRef.current = nextDetail
      setDetail(nextDetail)

      if (currentDetail.status === 'processing') {
        setReviewDraft(createReportReviewDraft(nextDetail))
        setSearchState(createInitialSearchState(nextDetail))
      }
    })
  }, [client, reportId])

  return (
    <ReportDetailScreen
      detail={detail}
      onFillTenthsChange={handleFillTenthsChange(setReviewDraft)}
      onReviewBottleChange={handleBottleChange(setReviewDraft)}
      onReviewSearch={(recordId, query) =>
        void handleBottleSearch(recordId, query, client, setSearchState)
      }
      onReviewSearchQueryChange={(recordId, query) =>
        setSearchState((current) => ({
          ...current,
          [recordId]: {
            ...(current[recordId] ?? { results: [] }),
            query,
            results: current[recordId]?.results ?? [],
          },
        }))
      }
      readinessMessage={client.readiness.message}
      reviewActionMode="integration-blocked"
      reviewDraft={reviewDraft}
      searchState={searchState}
      statusMessage={streamMessage}
    />
  )
}

function buildLoadedReportDetailKey(detail: ReportDetail) {
  return [
    detail.id,
    detail.status,
    detail.startedAt ?? '',
    detail.completedAt ?? '',
    detail.bottleRecords.length,
  ].join(':')
}

function createInitialSearchState(detail: ReportDetail): Record<string, RecordSearchState> {
  return Object.fromEntries(
    detail.bottleRecords.map((record) => [
      record.id,
      {
        query: record.bottleId ? record.bottleName : '',
        results: [],
      },
    ]),
  )
}

function handleBottleChange(
  setReviewDraft: Dispatch<SetStateAction<ReportReviewRecordDraft[]>>,
) {
  return (recordId: string, bottleId: string) => {
    setReviewDraft((current) =>
      current.map((draft) => (draft.id === recordId ? { ...draft, bottleId } : draft)),
    )
  }
}

function handleFillTenthsChange(
  setReviewDraft: Dispatch<SetStateAction<ReportReviewRecordDraft[]>>,
) {
  return (recordId: string, fillTenths: number) => {
    setReviewDraft((current) =>
      current.map((draft) => (draft.id === recordId ? { ...draft, fillTenths } : draft)),
    )
  }
}

async function handleBottleSearch(
  recordId: string,
  query: string,
  client: ReturnType<typeof useReportsClient>,
  setSearchState: Dispatch<SetStateAction<Record<string, RecordSearchState>>>,
) {
  const results = await client.searchBottles(query)

  setSearchState((current) => ({
    ...current,
    [recordId]: {
      query,
      results,
    },
  }))
}
