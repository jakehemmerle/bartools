import type { ReportBottleRecord } from '@bartools/types'

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
