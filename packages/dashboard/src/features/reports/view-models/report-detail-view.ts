import type { ReportDetail } from '@bartools/types'
import {
  buildReportReviewPayload,
  type ReportReviewRecordDraft,
} from '../../../lib/reports/review-draft'
import { createReportProgress } from '../../../lib/reports/stream'

export function formatReportTimestamp(value: string | undefined) {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatReportTimestampLong(value: string | undefined) {
  if (!value) {
    return '--'
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function buildReportId(detail: ReportDetail) {
  return detail.id.replace(/^report-/, '')
}

export function buildReportHeading(detail: ReportDetail) {
  return `Report ${buildReportId(detail)}`
}

export function buildReportProgressView(detail: ReportDetail) {
  const progress = createReportProgress(detail)

  return {
    ...progress,
    ratio: progress.photoCount === 0 ? 0 : progress.processedCount / progress.photoCount,
    label: `${progress.processedCount} / ${progress.photoCount} photos`,
  }
}

export function buildReviewSubmissionState(
  reviewerUserId: string | null | undefined,
  drafts: ReportReviewRecordDraft[],
) {
  const payload = buildReportReviewPayload(reviewerUserId, drafts)

  return {
    payload,
    ready: payload !== null,
  }
}
