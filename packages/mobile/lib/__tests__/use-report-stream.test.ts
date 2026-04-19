import { describe, it, expect, beforeEach, mock } from 'bun:test'
import type { ReportBottleRecord, ReportDetail, ReportProgress } from '@bartools/types'

// ---------------------------------------------------------------------------
// Fake EventSource — drives the hook without reaching the native module.
// `mock.module` must happen before we import the hook.
// ---------------------------------------------------------------------------

type Listener = (event: { data: string } | object) => void

class FakeEventSource {
  static instances: FakeEventSource[] = []
  listeners = new Map<string, Listener[]>()
  url: string
  closed = false

  constructor(url: string) {
    this.url = url
    FakeEventSource.instances.push(this)
  }

  addEventListener(event: string, listener: Listener) {
    const bucket = this.listeners.get(event) ?? []
    bucket.push(listener)
    this.listeners.set(event, bucket)
  }

  removeEventListener(event: string, listener: Listener) {
    const bucket = this.listeners.get(event)
    if (!bucket) return
    this.listeners.set(
      event,
      bucket.filter((l) => l !== listener),
    )
  }

  close() {
    this.closed = true
  }

  // Test-only dispatcher: emit a named SSE event with an optional JSON payload.
  emit(event: string, data?: unknown) {
    const bucket = this.listeners.get(event) ?? []
    const payload = data === undefined ? {} : { data: JSON.stringify(data) }
    for (const listener of bucket) listener(payload)
  }
}

mock.module('react-native-sse', () => ({
  default: FakeEventSource,
}))

// Stub expo-file-system (api.ts imports lib/api.ts transitively; keep identical
// to api.test.ts so the module graph loads in Bun).
mock.module('expo-file-system', () => ({
  File: class {
    constructor(public uri: string) {}
    async arrayBuffer(): Promise<ArrayBuffer> {
      return new ArrayBuffer(0)
    }
  },
}))

import { pollReportUntilReady, type PollTimers } from '../use-report-stream'

// ---------------------------------------------------------------------------
// Fake timer harness — bun's built-in fake timers are unreliable across
// Promise microtasks, so we drive time explicitly.
// ---------------------------------------------------------------------------

type Scheduled = { id: number; fireAt: number; fn: () => void }

function makeFakeTimers(): PollTimers & {
  now: () => number
  advance: (ms: number) => Promise<void>
  pending: () => number
} {
  let current = 0
  let nextId = 1
  const scheduled: Scheduled[] = []

  const setTimeoutFake: PollTimers['setTimeout'] = (fn, ms) => {
    const id = nextId++
    scheduled.push({ id, fireAt: current + (ms ?? 0), fn })
    return id as unknown as ReturnType<typeof globalThis.setTimeout>
  }
  const clearTimeoutFake: PollTimers['clearTimeout'] = (handle) => {
    const id = handle as unknown as number
    const idx = scheduled.findIndex((s) => s.id === id)
    if (idx >= 0) scheduled.splice(idx, 1)
  }

  async function advance(ms: number) {
    const target = current + ms
    // Drain any ready timers in fire-order, letting each fn's microtasks settle
    // before we look at the list again (handlers may schedule new timers).
    while (true) {
      scheduled.sort((a, b) => a.fireAt - b.fireAt)
      const next = scheduled[0]
      if (!next || next.fireAt > target) break
      scheduled.shift()
      current = next.fireAt
      next.fn()
      // Let the promise chain progress.
      await Promise.resolve()
      await Promise.resolve()
    }
    current = target
  }

  return {
    setTimeout: setTimeoutFake,
    clearTimeout: clearTimeoutFake,
    now: () => current,
    advance,
    pending: () => scheduled.length,
  }
}

// Build a minimal ReportBottleRecord for assertions.
function makeRecord(overrides: Partial<ReportBottleRecord> = {}): ReportBottleRecord {
  return {
    id: 'rec-1',
    imageUrl: '/uploads/photo.jpg',
    bottleName: 'Buffalo Trace',
    category: 'bourbon',
    fillPercent: 70,
    corrected: false,
    status: 'inferred',
    ...overrides,
  }
}

function makeReportDetail(
  status: ReportDetail['status'],
  records: ReportBottleRecord[],
  overrides: Partial<ReportDetail> = {},
): ReportDetail {
  return {
    id: 'r-1',
    status,
    bottleRecords: records,
    ...overrides,
  }
}

describe('pollReportUntilReady', () => {
  it('waits 2s before first poll (debounce)', async () => {
    const timers = makeFakeTimers()
    const getReport = mock(() =>
      Promise.resolve(makeReportDetail('processing', [])),
    )

    const poll = pollReportUntilReady('r-1', {
      getReport,
      onProgress: () => {},
      onRecord: () => {},
      onReady: () => {},
      timers,
    })

    // Just after 1s no call yet.
    await timers.advance(1000)
    expect(getReport).toHaveBeenCalledTimes(0)

    // Cross the 2s debounce.
    await timers.advance(1000)
    expect(getReport).toHaveBeenCalledTimes(1)

    poll.cancel()
  })

  it('merges fetched bottleRecords into onRecord without duplicating ids', async () => {
    const timers = makeFakeTimers()
    const responses: ReportDetail[] = [
      makeReportDetail('processing', [makeRecord({ id: 'rec-1' })]),
      makeReportDetail('processing', [
        makeRecord({ id: 'rec-1', fillPercent: 65 }),
        makeRecord({ id: 'rec-2', bottleName: 'Macallan' }),
      ]),
    ]
    const getReport = mock(() => Promise.resolve(responses.shift()!))
    const seenRecords: ReportBottleRecord[] = []
    const onRecord = (r: ReportBottleRecord) => {
      // Test harness mimics mergeRecord: replace-by-id, otherwise append.
      const idx = seenRecords.findIndex((x) => x.id === r.id)
      if (idx >= 0) seenRecords[idx] = r
      else seenRecords.push(r)
    }

    const poll = pollReportUntilReady('r-1', {
      getReport,
      onProgress: () => {},
      onRecord,
      onReady: () => {},
      timers,
    })

    // First poll at +2s.
    await timers.advance(2000)
    expect(getReport).toHaveBeenCalledTimes(1)
    expect(seenRecords).toHaveLength(1)

    // Second poll at +2s (success interval).
    await timers.advance(2000)
    expect(getReport).toHaveBeenCalledTimes(2)
    expect(seenRecords).toHaveLength(2)
    expect(seenRecords[0]!.fillPercent).toBe(65)
    expect(seenRecords[1]!.id).toBe('rec-2')

    poll.cancel()
  })

  it("reports derived progress on each successful poll", async () => {
    const timers = makeFakeTimers()
    const getReport = mock(() =>
      Promise.resolve(
        makeReportDetail('processing', [
          makeRecord({ id: 'rec-1', status: 'inferred' }),
          makeRecord({ id: 'rec-2', status: 'pending' }),
          makeRecord({ id: 'rec-3', status: 'failed' }),
        ]),
      ),
    )
    const progressEvents: ReportProgress[] = []

    const poll = pollReportUntilReady('r-1', {
      getReport,
      onProgress: (p) => progressEvents.push(p),
      onRecord: () => {},
      onReady: () => {},
      timers,
    })

    await timers.advance(2000)
    expect(progressEvents).toHaveLength(1)
    expect(progressEvents[0]).toEqual({
      id: 'r-1',
      status: 'processing',
      photoCount: 3,
      processedCount: 2, // inferred + failed are not pending
    })

    poll.cancel()
  })

  it('flips to ready and stops polling once status is unreviewed', async () => {
    const timers = makeFakeTimers()
    const responses: ReportDetail[] = [
      makeReportDetail('processing', [makeRecord({ id: 'rec-1' })]),
      makeReportDetail('unreviewed', [
        makeRecord({ id: 'rec-1' }),
        makeRecord({ id: 'rec-2', bottleName: 'Macallan' }),
      ]),
    ]
    const getReport = mock(() => Promise.resolve(responses.shift()!))
    const readyEvents: ReportProgress[] = []

    // Self-terminating poll — no need to cancel manually.
    pollReportUntilReady('r-1', {
      getReport,
      onProgress: () => {},
      onRecord: () => {},
      onReady: (p) => readyEvents.push(p),
      timers,
    })

    await timers.advance(2000)
    expect(readyEvents).toHaveLength(0)

    await timers.advance(2000)
    expect(getReport).toHaveBeenCalledTimes(2)
    expect(readyEvents).toHaveLength(1)
    expect(readyEvents[0]!.status).toBe('unreviewed')

    // No more timers pending.
    expect(timers.pending()).toBe(0)

    // Extra advance must not trigger another getReport call.
    await timers.advance(10_000)
    expect(getReport).toHaveBeenCalledTimes(2)
  })

  it("flips to ready when backend says 'reviewed'", async () => {
    const timers = makeFakeTimers()
    const getReport = mock(() =>
      Promise.resolve(makeReportDetail('reviewed', [makeRecord()])),
    )
    const readyEvents: ReportProgress[] = []

    const poll = pollReportUntilReady('r-1', {
      getReport,
      onProgress: () => {},
      onRecord: () => {},
      onReady: (p) => readyEvents.push(p),
      timers,
    })

    await timers.advance(2000)
    expect(readyEvents).toHaveLength(1)
    expect(readyEvents[0]!.status).toBe('reviewed')
    expect(timers.pending()).toBe(0)
    poll.cancel()
  })

  it('backs off 1s → 2s → 5s → 5s on repeated failures', async () => {
    const timers = makeFakeTimers()
    const getReport = mock(() => Promise.reject(new Error('network')))

    const poll = pollReportUntilReady('r-1', {
      getReport,
      onProgress: () => {},
      onRecord: () => {},
      onReady: () => {},
      timers,
    })

    // Initial debounce.
    await timers.advance(2000)
    expect(getReport).toHaveBeenCalledTimes(1)

    // After 1s (first backoff).
    await timers.advance(1000)
    expect(getReport).toHaveBeenCalledTimes(2)

    // After 2s (second backoff).
    await timers.advance(2000)
    expect(getReport).toHaveBeenCalledTimes(3)

    // After 5s (third backoff).
    await timers.advance(5000)
    expect(getReport).toHaveBeenCalledTimes(4)

    // After another 5s (cap).
    await timers.advance(5000)
    expect(getReport).toHaveBeenCalledTimes(5)

    poll.cancel()
  })

  it('resets backoff to 2s after a successful poll', async () => {
    const timers = makeFakeTimers()
    const responses = [
      Promise.reject(new Error('boom')),
      Promise.resolve(makeReportDetail('processing', [makeRecord()])),
      Promise.reject(new Error('boom')),
    ]
    const getReport = mock(() => responses.shift() ?? Promise.reject(new Error('drained')))

    const poll = pollReportUntilReady('r-1', {
      getReport,
      onProgress: () => {},
      onRecord: () => {},
      onReady: () => {},
      timers,
    })

    await timers.advance(2000) // debounce, first call fails
    expect(getReport).toHaveBeenCalledTimes(1)

    await timers.advance(1000) // first backoff, resolves successfully
    expect(getReport).toHaveBeenCalledTimes(2)

    // After success the interval resets to 2s.
    await timers.advance(2000)
    expect(getReport).toHaveBeenCalledTimes(3)

    poll.cancel()
  })

  it('cancel() clears pending timers and stops future polls', async () => {
    const timers = makeFakeTimers()
    const getReport = mock(() =>
      Promise.resolve(makeReportDetail('processing', [])),
    )

    const poll = pollReportUntilReady('r-1', {
      getReport,
      onProgress: () => {},
      onRecord: () => {},
      onReady: () => {},
      timers,
    })

    await timers.advance(1000) // inside debounce
    expect(getReport).toHaveBeenCalledTimes(0)

    poll.cancel()
    expect(timers.pending()).toBe(0)

    await timers.advance(60_000)
    expect(getReport).toHaveBeenCalledTimes(0)
  })
})

// ---------------------------------------------------------------------------
// SSE listener coverage — drives the hook's event handlers via the fake
// EventSource. We bypass React by invoking the hook-internals-shaped setup
// helper `attachStreamListeners`, which the hook delegates to.
// ---------------------------------------------------------------------------

import { attachStreamListeners } from '../use-report-stream'

describe('attachStreamListeners', () => {
  beforeEach(() => {
    FakeEventSource.instances.length = 0
  })

  type Captured = {
    records: ReportBottleRecord[]
    progress: ReportProgress | null
    status: string
    error: string | null
    closedCalls: number
  }

  function harness() {
    const es = new FakeEventSource('http://x/stream')
    const state: Captured = {
      records: [],
      progress: null,
      status: 'connecting',
      error: null,
      closedCalls: 0,
    }
    const detach = attachStreamListeners(es as unknown as import('react-native-sse').default, {
      onRecord: (r) => {
        const idx = state.records.findIndex((x) => x.id === r.id)
        if (idx >= 0) state.records[idx] = r
        else state.records.push(r)
      },
      onProgress: (p) => {
        state.progress = p
        state.status = 'streaming'
      },
      onReady: (p) => {
        state.progress = p
        state.status = 'ready_for_review'
      },
      onError: (msg) => {
        state.error = msg
        state.status = 'error'
      },
      onDropped: () => {
        state.status = 'dropped'
      },
      isTerminal: () => state.status === 'ready_for_review' || state.status === 'closed',
    })
    return { es, state, detach }
  }

  it('record.inferred merges the record', () => {
    const { es, state } = harness()
    es.emit('record.inferred', makeRecord({ id: 'rec-1', fillPercent: 80 }))
    expect(state.records).toHaveLength(1)
    expect(state.records[0]!.fillPercent).toBe(80)
  })

  it('record.failed merges the record', () => {
    const { es, state } = harness()
    es.emit('record.failed', makeRecord({ id: 'rec-1', status: 'failed' }))
    expect(state.records[0]!.status).toBe('failed')
  })

  it('record.reviewed merges the record', () => {
    const { es, state } = harness()
    es.emit(
      'record.reviewed',
      makeRecord({ id: 'rec-1', status: 'reviewed', corrected: true }),
    )
    expect(state.records).toHaveLength(1)
    expect(state.records[0]!.status).toBe('reviewed')
    expect(state.records[0]!.corrected).toBe(true)
  })

  it('report.progress updates progress and sets streaming status', () => {
    const { es, state } = harness()
    es.emit('report.progress', {
      id: 'r-1',
      status: 'processing',
      photoCount: 3,
      processedCount: 1,
    })
    expect(state.status).toBe('streaming')
    expect(state.progress).toEqual({
      id: 'r-1',
      status: 'processing',
      photoCount: 3,
      processedCount: 1,
    })
  })

  it('report.ready_for_review sets progress from payload before closing', () => {
    const { es, state } = harness()
    const progress: ReportProgress = {
      id: 'r-1',
      status: 'unreviewed',
      photoCount: 2,
      processedCount: 2,
    }
    es.emit('report.ready_for_review', progress)
    expect(state.progress).toEqual(progress)
    expect(state.status).toBe('ready_for_review')
    expect(es.closed).toBe(true)
  })

  it('report.error flips status to error and closes stream', () => {
    const { es, state } = harness()
    es.emit('report.error', { reportId: 'r-1', error: 'backend_exploded' })
    expect(state.status).toBe('error')
    expect(state.error).toBe('backend_exploded')
    expect(es.closed).toBe(true)
  })

  it('report.error falls back to generic error string when payload lacks one', () => {
    const { es, state } = harness()
    es.emit('report.error', { reportId: 'r-1' })
    expect(state.status).toBe('error')
    expect(state.error).toBe('report_error')
  })

  it("'error' event triggers onDropped when not yet terminal", () => {
    const { es, state } = harness()
    es.emit('error')
    expect(state.status).toBe('dropped')
  })

  it("'error' event is a no-op once already ready_for_review", () => {
    const { es, state } = harness()
    es.emit('report.ready_for_review', {
      id: 'r-1',
      status: 'unreviewed',
      photoCount: 1,
      processedCount: 1,
    })
    expect(state.status).toBe('ready_for_review')
    es.emit('error')
    // status unchanged
    expect(state.status).toBe('ready_for_review')
  })
})
