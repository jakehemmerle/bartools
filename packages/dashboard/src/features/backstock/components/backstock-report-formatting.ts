import type { BottleSearchResult } from '@bartools/types'

export function buildBottleMeta(bottle: BottleSearchResult) {
  const meta: string[] = [bottle.category]

  if (bottle.volumeMl) {
    meta.push(`${bottle.volumeMl} ml`)
  }

  return meta.join(' • ')
}

export function formatBytes(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
