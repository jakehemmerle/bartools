import { useState, useEffect, useCallback, useRef } from 'react'
import EventSource from 'react-native-sse'
import type { ReportBottleRecord, ReportProgress } from '@bartools/types'
import { getReportStreamUrl } from './api'

export type StreamStatus = 'connecting' | 'streaming' | 'ready_for_review' | 'error' | 'closed'

type ReportStreamState = {
  status: StreamStatus
  progress: ReportProgress | null
  records: ReportBottleRecord[]
  error: string | null
}

/** Replace or append a record, deduplicating by id */
export function mergeRecord(
  existing: ReportBottleRecord[],
  incoming: ReportBottleRecord,
): ReportBottleRecord[] {
  const idx = existing.findIndex((r) => r.id === incoming.id)
  if (idx >= 0) {
    const next = [...existing]
    next[idx] = incoming
    return next
  }
  return [...existing, incoming]
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

    es.addEventListener('report.progress', ((event: MessageEvent) => {
      const data: ReportProgress = JSON.parse(event.data)
      setState((prev) => ({ ...prev, status: 'streaming', progress: data }))
    }) as EventListener)

    es.addEventListener('record.inferred', ((event: MessageEvent) => {
      const record: ReportBottleRecord = JSON.parse(event.data)
      setState((prev) => ({
        ...prev,
        records: mergeRecord(prev.records, record),
      }))
    }) as EventListener)

    es.addEventListener('record.failed', ((event: MessageEvent) => {
      const record: ReportBottleRecord = JSON.parse(event.data)
      setState((prev) => ({
        ...prev,
        records: mergeRecord(prev.records, record),
      }))
    }) as EventListener)

    es.addEventListener('report.ready_for_review', (() => {
      setState((prev) => ({ ...prev, status: 'ready_for_review' }))
    }) as EventListener)

    es.addEventListener('error', (() => {
      setState((prev) => ({ ...prev, status: 'error', error: 'Connection lost' }))
    }) as EventListener)

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
