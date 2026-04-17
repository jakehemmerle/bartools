import { useEffect, useState } from 'react'
import type { ReportListItem } from '@bartools/types'
import { useReportsClient } from '../../../lib/reports/provider'
import { ReportsListScreen } from '../components/reports-list-screen'

export function ReportsRoute() {
  const client = useReportsClient()
  const [loadState, setLoadState] = useState<{
    errorMessage: string | null
    reports: ReportListItem[] | null
  }>({
    errorMessage: null,
    reports: null,
  })

  useEffect(() => {
    let cancelled = false

    void client
      .listReports()
      .then((nextReports) => {
        if (!cancelled) {
          setLoadState({
            errorMessage: null,
            reports: nextReports,
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadState({
            errorMessage: 'Reports could not be loaded right now. Try again in a moment.',
            reports: null,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [client])

  return (
    <ReportsListScreen
      errorMessage={loadState.errorMessage}
      reports={loadState.reports}
    />
  )
}
