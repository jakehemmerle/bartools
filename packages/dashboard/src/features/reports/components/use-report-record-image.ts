import { useState } from 'react'
import type { ReportBottleRecord } from '@bartools/types'
import { useParams } from 'react-router-dom'
import { useReportsClient } from '../../../lib/reports/provider'

export function getReportRecordImageStateKey(record: ReportBottleRecord) {
  return `${record.id}:${record.imageUrl}`
}

export function useReportRecordImage(record: ReportBottleRecord) {
  const client = useReportsClient()
  const { reportId } = useParams()
  const [imageUrl, setImageUrl] = useState(record.imageUrl)
  const [loadFailed, setLoadFailed] = useState(!record.imageUrl)
  const [refreshAttempted, setRefreshAttempted] = useState(false)

  const handleError = () => {
    setLoadFailed(true)

    if (!imageUrl || !reportId || refreshAttempted) {
      return
    }

    setRefreshAttempted(true)

    void client
      .getReport(reportId)
      .then((detail) => detail?.bottleRecords.find((nextRecord) => nextRecord.id === record.id) ?? null)
      .then((nextRecord) => {
        if (!nextRecord?.imageUrl) {
          return
        }

        setImageUrl(nextRecord.imageUrl)
        setLoadFailed(false)
      })
      .catch(() => undefined)
  }

  return {
    imageUrl,
    showFallback: loadFailed || !imageUrl,
    handleError,
  }
}
