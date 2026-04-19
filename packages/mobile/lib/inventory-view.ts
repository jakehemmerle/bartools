import type { InventoryListItem } from '@bartools/types'

export type InventorySectionItem =
  | { type: 'header'; category: string }
  | { type: 'bottle'; data: InventoryListItem }

/**
 * Filter an inventory list by a search query (case-insensitive substring on
 * `name`) and a category chip label. Pass `'All Bottles'` to bypass the
 * category filter.
 */
export function filterInventory(
  items: InventoryListItem[],
  query: string,
  category: string,
): InventoryListItem[] {
  let result = items

  const trimmed = query.trim()
  if (trimmed) {
    const q = trimmed.toLowerCase()
    result = result.filter((b) => b.name.toLowerCase().includes(q))
  }

  if (category !== 'All Bottles') {
    const cat = category.toLowerCase()
    result = result.filter((b) => b.category === cat)
  }

  return result
}

/**
 * Group a pre-filtered inventory list into an interleaved array of category
 * headers and bottle entries, suitable for feeding into a FlatList. Categories
 * are emitted in input order; items within a category follow their input
 * order.
 */
export function groupByCategory(
  items: InventoryListItem[],
): InventorySectionItem[] {
  const groups = new Map<string, InventoryListItem[]>()
  for (const bottle of items) {
    const cat = bottle.category
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(bottle)
  }

  const out: InventorySectionItem[] = []
  for (const [category, bottles] of groups) {
    out.push({ type: 'header', category })
    for (const bottle of bottles) {
      out.push({ type: 'bottle', data: bottle })
    }
  }
  return out
}
