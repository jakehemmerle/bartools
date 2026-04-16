import type { ReportListItem } from '@bartools/types'
import { sortReportsNewestFirst } from '../../../lib/reports-view'
import { formatReportTimestamp } from './report-detail-view'

export type ReportListRowView = {
  id: string
  status: ReportListItem['status']
  operator: string
  startedAt: string
  completedAt: string
  bottleCount: string
}

export function buildReportListRows(reports: ReportListItem[]): ReportListRowView[] {
  return sortReportsNewestFirst(reports).map((report) => ({
    id: report.id,
    status: report.status,
    operator: report.userDisplayName ?? 'Unknown operator',
    startedAt: formatReportTimestamp(report.startedAt) ?? 'Not started',
    completedAt: formatReportTimestamp(report.completedAt) ?? '--',
    bottleCount: String(report.bottleCount),
  }))
}
