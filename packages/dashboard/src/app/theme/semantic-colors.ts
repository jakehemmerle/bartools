import type { ReportRecordStatus, ReportStatus } from '@bartools/types'

export type StatusTone =
  | 'created'
  | 'processing'
  | 'unreviewed'
  | 'reviewed'
  | 'failed'
  | 'pending'
  | 'inferred'

export function getReportStatusTone(status: ReportStatus): StatusTone {
  switch (status) {
    case 'created':
      return 'created'
    case 'processing':
      return 'processing'
    case 'unreviewed':
      return 'unreviewed'
    case 'reviewed':
      return 'reviewed'
  }
}

export function getRecordStatusTone(status: ReportRecordStatus): StatusTone {
  switch (status) {
    case 'pending':
      return 'pending'
    case 'inferred':
      return 'inferred'
    case 'failed':
      return 'failed'
    case 'reviewed':
      return 'reviewed'
  }
}
