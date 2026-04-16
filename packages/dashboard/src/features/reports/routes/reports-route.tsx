import { useEffect, useState } from 'react'
import type { ReportListItem } from '@bartools/types'
import { useReportsClient } from '../../../lib/reports/provider'
import { ReportsListScreen } from '../components/reports-list-screen'

export function ReportsRoute() {
  const client = useReportsClient()
  const [reports, setReports] = useState<ReportListItem[] | null>(null)

  useEffect(() => {
    let cancelled = false

    void client.listReports().then((nextReports) => {
      if (!cancelled) {
        setReports(nextReports)
      }
    })

    return () => {
      cancelled = true
    }
  }, [client])

  return <ReportsListScreen reports={reports} />
}
