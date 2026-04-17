import type { ReportListItem } from '@bartools/types'
import { sortReportsNewestFirst } from '../../../lib/reports-view'
import { formatReportTimestamp } from './report-detail-view'

export type ReportListRowView = {
  id: string
  status: ReportListItem['status']
  operator: string
  location: string
  startedAt: string
  completedAt: string
  progressLabel: string
  bottleCountLabel: string
}

export function buildReportListRows(reports: ReportListItem[]): ReportListRowView[] {
  return sortReportsNewestFirst(reports).map((report) => ({
    id: report.id,
    status: report.status,
    operator: report.userDisplayName ?? 'Unknown operator',
    location: report.locationName ?? 'Location not set',
    startedAt: formatReportTimestamp(report.startedAt) ?? 'Not started',
    completedAt: formatReportTimestamp(report.completedAt) ?? '--',
    progressLabel: `${report.processedCount} / ${report.photoCount} photos`,
    bottleCountLabel: `${report.bottleCount} ${report.bottleCount === 1 ? 'bottle' : 'bottles'}`,
  }))
}
