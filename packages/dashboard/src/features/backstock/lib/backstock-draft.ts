import type { BottleSearchResult } from '@bartools/types'
import { fixtureBottleSearchResults } from '../../../lib/reports/client'

export type BackstockStartMode = 'manual' | 'photo'
export type DraftLineItemOrigin = 'manual' | 'generated'

export type DraftLineItemSearchState = {
  query: string
  results: BottleSearchResult[]
}

export type BackstockDraftLineItem = {
  id: string
  origin: DraftLineItemOrigin
  quantityFullBottles: number
  search: DraftLineItemSearchState
  selectedBottle: BottleSearchResult | null
}

export type BackstockSourcePhoto = {
  id: string
  file: File | null
  name: string
  sizeBytes: number
}

export type SubmittedBackstockLineItem = {
  bottle: BottleSearchResult
  quantityFullBottles: number
}

export type SubmittedBackstockSummary = {
  lineItems: SubmittedBackstockLineItem[]
  skuCount: number
  totalBottleCount: number
}

let nextDraftEntityId = 0

export function createBackstockDraftLineItem(
  overrides: Partial<BackstockDraftLineItem> = {},
): BackstockDraftLineItem {
  const selectedBottle = overrides.selectedBottle ?? null
  const query =
    overrides.search?.query ?? selectedBottle?.name ?? ''

  return {
    id: overrides.id ?? createBackstockDraftEntityId('line-item'),
    origin: overrides.origin ?? 'manual',
    quantityFullBottles: overrides.quantityFullBottles ?? 1,
    search: {
      query,
      results: overrides.search?.results ?? [],
    },
    selectedBottle,
  }
}

export function createBackstockSourcePhoto(file: File): BackstockSourcePhoto {
  return {
    id: createBackstockDraftEntityId('photo'),
    file,
    name: file.name,
    sizeBytes: file.size,
  }
}

export function createRestoredBackstockSourcePhoto({
  id,
  name,
  sizeBytes,
}: {
  id: string
  name: string
  sizeBytes: number
}): BackstockSourcePhoto {
  return {
    id,
    file: null,
    name,
    sizeBytes,
  }
}

export function isBlankBackstockDraftLineItem(lineItem: BackstockDraftLineItem) {
  return (
    lineItem.origin === 'manual' &&
    lineItem.quantityFullBottles === 1 &&
    lineItem.search.query.trim().length === 0 &&
    lineItem.search.results.length === 0 &&
    lineItem.selectedBottle === null
  )
}

export function buildFixtureGeneratedLineItems(
  sourcePhotos: BackstockSourcePhoto[],
): BackstockDraftLineItem[] {
  const generatedCatalog = [
    { bottleId: 'bottle-1', quantityFullBottles: 12 },
    { bottleId: 'bottle-4', quantityFullBottles: 6 },
    { bottleId: 'bottle-2', quantityFullBottles: 4 },
    { bottleId: 'bottle-3', quantityFullBottles: 3 },
  ] as const

  const visibleSuggestionCount = Math.min(
    generatedCatalog.length,
    Math.max(2, sourcePhotos.length + 1),
  )

  return generatedCatalog.slice(0, visibleSuggestionCount).map((suggestion) => {
    const bottle = fixtureBottleSearchResults.find(
      (candidate) => candidate.id === suggestion.bottleId,
    )

    if (!bottle) {
      throw new Error(`Fixture bottle missing for backstock suggestion: ${suggestion.bottleId}`)
    }

    return createBackstockDraftLineItem({
      origin: 'generated',
      quantityFullBottles: suggestion.quantityFullBottles,
      search: {
        query: bottle.name,
        results: [],
      },
      selectedBottle: bottle,
    })
  })
}

export function buildSubmittedBackstockSummary(
  lineItems: BackstockDraftLineItem[],
): SubmittedBackstockSummary {
  const mergedLineItems = new Map<string, SubmittedBackstockLineItem>()

  for (const lineItem of lineItems) {
    if (!lineItem.selectedBottle || lineItem.quantityFullBottles <= 0) {
      continue
    }

    const existingLineItem = mergedLineItems.get(lineItem.selectedBottle.id)

    if (existingLineItem) {
      existingLineItem.quantityFullBottles += lineItem.quantityFullBottles
      continue
    }

    mergedLineItems.set(lineItem.selectedBottle.id, {
      bottle: lineItem.selectedBottle,
      quantityFullBottles: lineItem.quantityFullBottles,
    })
  }

  const normalizedLineItems = [...mergedLineItems.values()].sort((left, right) =>
    left.bottle.name.localeCompare(right.bottle.name),
  )
  const totalBottleCount = normalizedLineItems.reduce(
    (sum, lineItem) => sum + lineItem.quantityFullBottles,
    0,
  )

  return {
    lineItems: normalizedLineItems,
    skuCount: normalizedLineItems.length,
    totalBottleCount,
  }
}

function createBackstockDraftEntityId(prefix: string) {
  nextDraftEntityId += 1

  return `${prefix}-${nextDraftEntityId}`
}
