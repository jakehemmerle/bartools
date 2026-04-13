import type { ReportListItem } from './fixtures/schemas'

export function sortReportsNewestFirst(reports: ReportListItem[]) {
  return [...reports].sort((left, right) => {
    return getReportTimestamp(right) - getReportTimestamp(left)
  })
}

function getReportTimestamp(report: ReportListItem) {
  const fallback = report.startedAt ?? report.completedAt

  if (!fallback) {
    return 0
  }

  return new Date(fallback).getTime()
}
