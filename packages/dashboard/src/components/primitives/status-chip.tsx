import type { ReportRecordStatus, ReportStatus } from '@bartools/types'
import {
  getRecordStatusTone,
  getReportStatusTone,
  type StatusTone,
} from '../../app/theme/semantic-colors'

type StatusChipProps = {
  status: ReportStatus | ReportRecordStatus
}

export function StatusChip({ status }: StatusChipProps) {
  const tone = getStatusTone(status)

  return (
    <span className={`bt-status-chip bt-status-chip--${tone}`}>
      {status.replaceAll('_', ' ')}
    </span>
  )
}

function getStatusTone(status: ReportStatus | ReportRecordStatus): StatusTone {
  switch (status) {
    case 'created':
    case 'processing':
    case 'unreviewed':
    case 'reviewed':
      return getReportStatusTone(status)
    case 'pending':
    case 'inferred':
    case 'failed':
      return getRecordStatusTone(status)
  }
}
