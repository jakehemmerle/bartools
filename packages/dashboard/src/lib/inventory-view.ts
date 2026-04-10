import type { InventoryProductRow } from './fixtures/schemas'

export type InventoryFilter = 'all' | 'below-par'
export type InventorySort = 'name' | 'quantity' | 'as-of'
export type LowStockSort = 'urgency' | 'as-of' | 'name'

export function filterInventoryRows(
  rows: InventoryProductRow[],
  query: string,
  filter: InventoryFilter,
) {
  const normalizedQuery = query.trim().toLowerCase()

  return rows.filter((row) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      row.productName.toLowerCase().includes(normalizedQuery) ||
      row.upc.includes(normalizedQuery)
    const matchesFilter = filter === 'all' ? true : row.belowPar

    return matchesQuery && matchesFilter
  })
}

export function sortInventoryRows(
  rows: InventoryProductRow[],
  sort: InventorySort,
) {
  return [...rows].sort((left, right) => {
    if (sort === 'quantity') {
      return right.onHandComparableAmount - left.onHandComparableAmount
    }

    if (sort === 'as-of') {
      return new Date(right.asOf).getTime() - new Date(left.asOf).getTime()
    }

    return left.productName.localeCompare(right.productName)
  })
}

export function sortLowStockRows(
  rows: InventoryProductRow[],
  sort: LowStockSort,
) {
  return [...rows].sort((left, right) => {
    if (sort === 'as-of') {
      return new Date(right.asOf).getTime() - new Date(left.asOf).getTime()
    }

    if (sort === 'name') {
      return left.productName.localeCompare(right.productName)
    }

    const leftGap =
      (left.parComparableAmount ?? 0) - left.onHandComparableAmount
    const rightGap =
      (right.parComparableAmount ?? 0) - right.onHandComparableAmount

    return rightGap - leftGap
  })
}
