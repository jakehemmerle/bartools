import { useState, useEffect, useCallback, useRef } from 'react'
import EventSource from 'react-native-sse'
import type { ReportBottleRecord, ReportProgress } from '@bartools/types'
import { getReportStreamUrl } from './api'
import { mergeRecord } from './merge-record'

export { mergeRecord } from './merge-record'

export type StreamStatus = 'connecting' | 'streaming' | 'ready_for_review' | 'error' | 'closed'

type ReportStreamState = {
  status: StreamStatus
  progress: ReportProgress | null
  records: ReportBottleRecord[]
  error: string | null
}

export function useReportStream(reportId: string | null) {
  const [state, setState] = useState<ReportStreamState>({
    status: 'connecting',
    progress: null,
    records: [],
    error: null,
  })
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!reportId) return

    const url = getReportStreamUrl(reportId)
    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('report.progress', (event: MessageEvent) => {
      try {
        const data: ReportProgress = JSON.parse(event.data)
        setState((prev) => ({ ...prev, status: 'streaming', progress: data }))
      } catch { /* ignore malformed event */ }
    })

    es.addEventListener('record.inferred', (event: MessageEvent) => {
      try {
        const record: ReportBottleRecord = JSON.parse(event.data)
        setState((prev) => ({
          ...prev,
          records: mergeRecord(prev.records, record),
        }))
      } catch { /* ignore malformed event */ }
    })

    es.addEventListener('record.failed', (event: MessageEvent) => {
      try {
        const record: ReportBottleRecord = JSON.parse(event.data)
        setState((prev) => ({
          ...prev,
          records: mergeRecord(prev.records, record),
        }))
      } catch { /* ignore malformed event */ }
    })

    es.addEventListener('report.ready_for_review', () => {
      setState((prev) => ({ ...prev, status: 'ready_for_review' }))
    })

    es.addEventListener('error', () => {
      setState((prev) => ({ ...prev, status: 'error', error: 'Connection lost' }))
    })

    return () => {
      es.close()
      esRef.current = null
    }
  }, [reportId])

  const close = useCallback(() => {
    esRef.current?.close()
    esRef.current = null
    setState((prev) => ({ ...prev, status: 'closed' }))
  }, [])

  return { ...state, close }
}
