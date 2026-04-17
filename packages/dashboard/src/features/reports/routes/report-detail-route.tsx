import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'
import type { BottleSearchResult, ReportDetail } from '@bartools/types'
import { useParams } from 'react-router-dom'
import {
  createReportReviewDraft,
  type ReportReviewRecordDraft,
} from '../../../lib/reports/review-draft'
import {
  applyReportStreamEvent,
  createReportStreamViewState,
} from '../../../lib/reports/stream'
import { useReportsClient } from '../../../lib/reports/provider'
import { ReportDetailScreen } from '../components/report-detail-screen'
import { ReportNotFoundScreen } from '../components/report-not-found-screen'

type RecordSearchState = {
  query: string
  results: BottleSearchResult[]
}

export function ReportDetailRoute() {
  const client = useReportsClient()
  const { reportId = '' } = useParams()
  const [detailState, setDetailState] = useState<{
    detail: ReportDetail | null
    reportId: string
  } | null>(null)
  const [reviewDraft, setReviewDraft] = useState<ReportReviewRecordDraft[]>([])
  const [searchState, setSearchState] = useState<Record<string, RecordSearchState>>({})

  useEffect(() => {
    let cancelled = false
    let unsubscribe: () => void = () => undefined

    void client.getReport(reportId).then((detail) => {
      if (cancelled) {
        return
      }

      setDetailState({ reportId, detail })
      setReviewDraft(detail ? createReportReviewDraft(detail) : [])
      setSearchState({})

      if (detail) {
        unsubscribe = client.streamReport(reportId, (event) => {
          setDetailState((currentState) => {
            if (!currentState?.detail) {
              return currentState
            }

            return {
              reportId: currentState.reportId,
              detail: applyReportStreamEvent(
                createReportStreamViewState(currentState.detail),
                event,
              ).detail,
            }
          })
        })
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [client, reportId])

  if (!detailState || detailState.reportId !== reportId) {
    return <div className="bb-loading-route">Loading report.</div>
  }

  if (!detailState.detail) {
    return <ReportNotFoundScreen />
  }

  return (
    <ReportDetailScreen
      detail={detailState.detail}
      onFillTenthsChange={handleFillTenthsChange(setReviewDraft)}
      onReviewBottleChange={handleBottleChange(setReviewDraft)}
      onReviewSearch={(recordId, query) => void handleBottleSearch(recordId, query, client, setSearchState)}
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
    />
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
