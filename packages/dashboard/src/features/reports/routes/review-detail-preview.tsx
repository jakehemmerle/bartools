import { useState } from 'react'
import type { ReportDetail } from '@bartools/types'
import { createReportReviewDraft } from '../../../lib/reports/review-draft'
import type { RecordSearchState } from '../components/report-bottle-match-field'
import type { ComparisonCardVariant } from '../components/report-comparison-record-card'
import { ReportDetailScreen } from '../components/report-detail-screen'
import {
  reviewBottleSearchResults,
  searchReviewBottles,
} from '../fixtures/review-scenarios'

export function ReviewDetailPreview({
  detail,
  reviewedComparisonVariant,
}: {
  detail: ReportDetail
  reviewedComparisonVariant?: ComparisonCardVariant
}) {
  const [reviewDraft, setReviewDraft] = useState(() =>
    createReportReviewDraft(detail).map((draft) => ({
      ...draft,
      bottleId: findBottleMatch(detail, draft.id)?.id ?? null,
    })),
  )
  const [searchState, setSearchState] = useState<Record<string, RecordSearchState>>(() =>
    Object.fromEntries(
      detail.bottleRecords.map((record) => [
        record.id,
        buildInitialSearchState(detail, record.id),
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
      reviewedComparisonVariant={reviewedComparisonVariant}
      reviewActionMode="preview"
      reviewDraft={reviewDraft}
      searchState={searchState}
    />
  )
}

function buildInitialSearchState(detail: ReportDetail, recordId: string): RecordSearchState {
  const record = detail.bottleRecords.find((item) => item.id === recordId)
  const match = findBottleMatch(detail, recordId)

  if (!record) {
    return { query: '', results: [] }
  }

  if (record.status === 'failed') {
    return {
      query: match?.name ?? '',
      results: [],
    }
  }

  return {
    query: record.bottleName,
    results: searchReviewBottles(record.bottleName),
  }
}

function findBottleMatch(detail: ReportDetail, recordId: string) {
  const record = detail.bottleRecords.find((item) => item.id === recordId)

  if (!record) {
    return null
  }

  const normalizedName = record.bottleName.toLowerCase()
  return reviewBottleSearchResults.find((result) =>
    result.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(result.name.toLowerCase()),
  )
}
