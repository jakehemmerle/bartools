import { useState, useEffect, useCallback, useRef } from 'react'
import EventSource from 'react-native-sse'
import type { ReportBottleRecord, ReportDetail, ReportProgress } from '@bartools/types'
import { getReport, getReportStreamUrl } from './api'
import { mergeRecord } from './merge-record'

export { mergeRecord } from './merge-record'

export type StreamStatus = 'connecting' | 'streaming' | 'ready_for_review' | 'error' | 'closed'

type ReportStreamState = {
  status: StreamStatus
  progress: ReportProgress | null
  records: ReportBottleRecord[]
  error: string | null
}

// ---------------------------------------------------------------------------
// Pure SSE listener wiring (no React) — exported for unit tests.
// ---------------------------------------------------------------------------

export type StreamHandlers = {
  onRecord: (record: ReportBottleRecord) => void
  onProgress: (progress: ReportProgress) => void
  onReady: (progress: ReportProgress | null) => void
  onError: (message: string) => void
  onDropped: () => void
  /**
   * Callback the `'error'` listener queries before promoting a dropped
   * connection to `onDropped`. If we've already reached `ready_for_review` or
   * `closed`, the drop is expected (we closed the stream ourselves) and should
   * be ignored.
   */
  isTerminal: () => boolean
}

/** Safely JSON.parse an SSE payload; returns `null` on malformed data. */
function parse<T>(event: unknown): T | null {
  if (!event || typeof event !== 'object' || !('data' in event)) return null
  const data = (event as { data: unknown }).data
  if (typeof data !== 'string') return null
  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

export function attachStreamListeners(
  es: EventSource,
  handlers: StreamHandlers,
): () => void {
  const progressListener = (event: unknown) => {
    const data = parse<ReportProgress>(event)
    if (data) handlers.onProgress(data)
  }
  const inferredListener = (event: unknown) => {
    const rec = parse<ReportBottleRecord>(event)
    if (rec) handlers.onRecord(rec)
  }
  const failedListener = (event: unknown) => {
    const rec = parse<ReportBottleRecord>(event)
    if (rec) handlers.onRecord(rec)
  }
  const reviewedListener = (event: unknown) => {
    const rec = parse<ReportBottleRecord>(event)
    if (rec) handlers.onRecord(rec)
  }
  const readyListener = (event: unknown) => {
    const data = parse<ReportProgress>(event)
    handlers.onReady(data)
    es.close()
  }
  const errorListener = (event: unknown) => {
    const data = parse<{ reportId?: string; error?: string }>(event)
    handlers.onError(data?.error ?? 'report_error')
    es.close()
  }
  const droppedListener = () => {
    if (handlers.isTerminal()) return
    handlers.onDropped()
  }

  // Cast listeners to `any` — react-native-sse's `addEventListener` typings
  // require a specific MessageEvent shape that doesn't include our parse-safe
  // `unknown` input. We're deliberately wider on the test-facing API. Bind
  // the methods to `es` so fake EventSources (plain-class instances in tests)
  // receive the right `this`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const add = (event: string, cb: any) =>
    (es.addEventListener as unknown as (e: string, c: unknown) => void).call(
      es,
      event,
      cb,
    )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const remove = (event: string, cb: any) =>
    (es.removeEventListener as unknown as (e: string, c: unknown) => void).call(
      es,
      event,
      cb,
    )

  add('report.progress', progressListener)
  add('record.inferred', inferredListener)
  add('record.failed', failedListener)
  add('record.reviewed', reviewedListener)
  add('report.ready_for_review', readyListener)
  add('report.error', errorListener)
  add('error', droppedListener)

  return () => {
    remove('report.progress', progressListener)
    remove('record.inferred', inferredListener)
    remove('record.failed', failedListener)
    remove('record.reviewed', reviewedListener)
    remove('report.ready_for_review', readyListener)
    remove('report.error', errorListener)
    remove('error', droppedListener)
  }
}

// ---------------------------------------------------------------------------
// Polling fallback — pure, testable
// ---------------------------------------------------------------------------

export type PollTimers = {
  setTimeout: (fn: () => void, ms: number) => ReturnType<typeof globalThis.setTimeout>
  clearTimeout: (handle: ReturnType<typeof globalThis.setTimeout>) => void
}

export type PollOptions = {
  getReport: (id: string) => Promise<ReportDetail>
  onProgress: (progress: ReportProgress) => void
  onRecord: (record: ReportBottleRecord) => void
  onReady: (progress: ReportProgress) => void
  timers?: PollTimers
}

export type PollHandle = { cancel: () => void }

const DEBOUNCE_MS = 2000
const SUCCESS_INTERVAL_MS = 2000
const FAILURE_BACKOFF_MS = [1000, 2000, 5000] as const
const FAILURE_BACKOFF_CAP_MS = 5000

const defaultTimers: PollTimers = {
  setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms),
  clearTimeout: (handle) => globalThis.clearTimeout(handle),
}

export function pollReportUntilReady(
  reportId: string,
  opts: PollOptions,
): PollHandle {
  const timers = opts.timers ?? defaultTimers
  let cancelled = false
  let failureStreak = 0
  let handle: ReturnType<typeof globalThis.setTimeout> | null = null

  const schedule = (ms: number) => {
    if (cancelled) return
    handle = timers.setTimeout(() => {
      handle = null
      void tick()
    }, ms)
  }

  const tick = async () => {
    if (cancelled) return
    try {
      const detail = await opts.getReport(reportId)
      if (cancelled) return

      // Merge records first so listeners observe the fresh list before status
      // flips.
      for (const record of detail.bottleRecords) {
        opts.onRecord(record)
      }

      const processedCount = detail.bottleRecords.filter(
        (r) => r.status !== 'pending',
      ).length
      const progress: ReportProgress = {
        id: detail.id,
        status: detail.status,
        photoCount: detail.bottleRecords.length,
        processedCount,
      }
      opts.onProgress(progress)

      if (detail.status === 'unreviewed' || detail.status === 'reviewed') {
        opts.onReady(progress)
        // Terminal — do not schedule another poll.
        return
      }

      failureStreak = 0
      schedule(SUCCESS_INTERVAL_MS)
    } catch {
      if (cancelled) return
      const nextDelay =
        failureStreak < FAILURE_BACKOFF_MS.length
          ? FAILURE_BACKOFF_MS[failureStreak]!
          : FAILURE_BACKOFF_CAP_MS
      failureStreak += 1
      schedule(nextDelay)
    }
  }

  // Initial 2s debounce before the first fetch.
  schedule(DEBOUNCE_MS)

  return {
    cancel() {
      cancelled = true
      if (handle !== null) {
        timers.clearTimeout(handle)
        handle = null
      }
    },
  }
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

export function useReportStream(reportId: string | null) {
  const [state, setState] = useState<ReportStreamState>({
    status: 'connecting',
    progress: null,
    records: [],
    error: null,
  })
  const esRef = useRef<EventSource | null>(null)
  const pollRef = useRef<PollHandle | null>(null)
  const statusRef = useRef<StreamStatus>('connecting')

  useEffect(() => {
    statusRef.current = state.status
  }, [state.status])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on subscription change
    setState({
      status: reportId ? 'connecting' : 'closed',
      progress: null,
      records: [],
      error: null,
    })
    statusRef.current = reportId ? 'connecting' : 'closed'
    if (!reportId) return

    const url = getReportStreamUrl(reportId)
    const es = new EventSource(url)
    esRef.current = es

    const startPolling = () => {
      if (pollRef.current) return // already polling
      pollRef.current = pollReportUntilReady(reportId, {
        getReport,
        onRecord: (record) => {
          setState((prev) => ({ ...prev, records: mergeRecord(prev.records, record) }))
        },
        onProgress: (progress) => {
          setState((prev) => ({
            ...prev,
            status: prev.status === 'connecting' ? 'streaming' : prev.status,
            progress,
          }))
        },
        onReady: (progress) => {
          setState((prev) => ({
            ...prev,
            status: 'ready_for_review',
            progress,
            error: null,
          }))
        },
      })
    }

    const stopPolling = () => {
      pollRef.current?.cancel()
      pollRef.current = null
    }

    const detach = attachStreamListeners(es, {
      onRecord: (record) => {
        setState((prev) => ({ ...prev, records: mergeRecord(prev.records, record) }))
      },
      onProgress: (progress) => {
        setState((prev) => ({ ...prev, status: 'streaming', progress }))
      },
      onReady: (progress) => {
        stopPolling()
        setState((prev) => ({
          ...prev,
          status: 'ready_for_review',
          progress: progress ?? prev.progress,
          error: null,
        }))
      },
      onError: (message) => {
        stopPolling()
        setState((prev) => ({ ...prev, status: 'error', error: message }))
      },
      onDropped: () => {
        // Don't flip to 'error' — kick off the polling fallback and leave
        // status as 'streaming' until it succeeds or fails terminally.
        startPolling()
      },
      isTerminal: () =>
        statusRef.current === 'ready_for_review' || statusRef.current === 'closed',
    })

    startPolling()

    return () => {
      detach()
      es.close()
      esRef.current = null
      stopPolling()
    }
  }, [reportId])

  const close = useCallback(() => {
    esRef.current?.close()
    esRef.current = null
    pollRef.current?.cancel()
    pollRef.current = null
    setState((prev) => ({ ...prev, status: 'closed' }))
  }, [])

  return { ...state, close }
}
