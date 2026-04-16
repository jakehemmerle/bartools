import { useState } from 'react'
import type { ReportDetail } from '@bartools/types'
import { createReportReviewDraft } from '../../../lib/reports/review-draft'
import { ReportDetailScreen } from '../components/report-detail-screen'
import {
  reviewBottleSearchResults,
  searchReviewBottles,
} from '../fixtures/review-scenarios'

type RecordSearchState = {
  query: string
  results: typeof reviewBottleSearchResults
}

export function ReviewDetailPreview({ detail }: { detail: ReportDetail }) {
  const [reviewDraft, setReviewDraft] = useState(() =>
    createReportReviewDraft(detail).map((draft) => ({
      ...draft,
      bottleId: findBottleId(detail, draft.id),
    })),
  )
  const [searchState, setSearchState] = useState<Record<string, RecordSearchState>>(() =>
    Object.fromEntries(
      detail.bottleRecords.map((record) => [
        record.id,
        {
          query: record.status === 'failed' ? '' : record.bottleName,
          results:
            record.status === 'failed'
              ? reviewBottleSearchResults
              : searchReviewBottles(record.bottleName),
        },
      ]),
    ),
  )

  return (
    <ReportDetailScreen
      detail={detail}
      onFillTenthsChange={(recordId, fillTenths) =>
        setReviewDraft((current) =>
          current.map((draft) => (draft.id === recordId ? { ...draft, fillTenths } : draft)),
        )
      }
      onReviewBottleChange={(recordId, bottleId) =>
        setReviewDraft((current) =>
          current.map((draft) => (draft.id === recordId ? { ...draft, bottleId } : draft)),
        )
      }
      onReviewSearch={(recordId, query) =>
        setSearchState((current) => ({
          ...current,
          [recordId]: {
            query,
            results: searchReviewBottles(query),
          },
        }))
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
      readinessMessage="Live report access requires venue and user context. Review submission requires user context."
      reviewActionMode="preview"
      reviewDraft={reviewDraft}
      searchState={searchState}
    />
  )
}

function findBottleId(detail: ReportDetail, recordId: string) {
  const record = detail.bottleRecords.find((item) => item.id === recordId)

  if (!record) {
    return null
  }

  const normalizedName = record.bottleName.toLowerCase()
  const match = reviewBottleSearchResults.find((result) =>
    result.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(result.name.toLowerCase()),
  )

  return match?.id ?? null
}
