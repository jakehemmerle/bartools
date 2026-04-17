import { FILL_LEVEL_MAX, FILL_LEVEL_MIN, type ReportDetail } from '@bartools/types'
import type { ReportReviewInput } from './client'

export type ReportReviewRecordDraft = {
  id: string
  bottleId: string | null
  fillTenths: number
}

export function createReportReviewDraft(detail: ReportDetail): ReportReviewRecordDraft[] {
  return detail.bottleRecords.map((record) => ({
    id: record.id,
    bottleId: record.bottleId ?? null,
    fillTenths: clampFillTenths(Math.round(record.fillPercent / 10)),
  }))
}

export function buildReportReviewPayload(
  userId: string | null | undefined,
  drafts: ReportReviewRecordDraft[],
): ReportReviewInput | null {
  if (!userId || drafts.some((draft) => !draft.bottleId)) {
    return null
  }

  return {
    userId,
    records: drafts.map((draft) => ({
      id: draft.id,
      bottleId: draft.bottleId as string,
      fillTenths: clampFillTenths(draft.fillTenths),
    })),
  }
}

function clampFillTenths(value: number) {
  return Math.max(FILL_LEVEL_MIN, Math.min(FILL_LEVEL_MAX, value))
}
