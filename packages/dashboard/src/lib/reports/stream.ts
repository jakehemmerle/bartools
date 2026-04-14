import type { ReportBottleRecord, ReportDetail, ReportProgress } from '@bartools/types'
import type { ReportStreamEvent } from './client'

export type ReportStreamViewState = {
  report: ReportProgress
  detail: ReportDetail
}

export function createReportProgress(detail: ReportDetail): ReportProgress {
  return {
    id: detail.id,
    status: detail.status,
    photoCount: detail.bottleRecords.length,
    processedCount: detail.bottleRecords.filter((record) => record.status !== 'pending').length,
  }
}

export function createReportStreamViewState(detail: ReportDetail): ReportStreamViewState {
  return {
    report: createReportProgress(detail),
    detail,
  }
}

export function applyReportStreamEvent(
  state: ReportStreamViewState,
  event: ReportStreamEvent,
): ReportStreamViewState {
  switch (event.type) {
    case 'report.progress':
    case 'report.ready_for_review':
      return {
        report: event.data,
        detail: {
          ...state.detail,
          status: event.data.status,
        },
      }
    case 'record.inferred':
    case 'record.failed':
    case 'record.reviewed': {
      const bottleRecords = state.detail.bottleRecords.map((record) =>
        record.id === event.data.id ? event.data : record,
      )

      return {
        report: {
          ...state.report,
          processedCount: bottleRecords.filter((record) => record.status !== 'pending').length,
        },
        detail: {
          ...state.detail,
          bottleRecords,
        },
      }
    }
    default:
      return state
  }
}

export function updateReportRecord(
  detail: ReportDetail,
  nextRecord: ReportBottleRecord,
): ReportDetail {
  return {
    ...detail,
    bottleRecords: detail.bottleRecords.map((record) =>
      record.id === nextRecord.id ? nextRecord : record,
    ),
  }
}
