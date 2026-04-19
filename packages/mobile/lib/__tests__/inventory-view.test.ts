import { describe, it, expect } from 'bun:test'
import type { InventoryListItem } from '@bartools/types'
import { filterInventory, groupByCategory } from '../inventory-view'

function item(partial: Partial<InventoryListItem>): InventoryListItem {
  return {
    id: 'inv-x',
    locationId: 'loc-1',
    locationName: 'Main Bar',
    bottleId: 'b-x',
    name: 'Buffalo Trace',
    category: 'bourbon',
    fillPercent: 50,
    addedAt: '2024-01-01T00:00:00Z',
    ...partial,
  }
}

describe('filterInventory', () => {
  it('returns [] for empty input', () => {
    expect(filterInventory([], '', 'All Bottles')).toEqual([])
  })

  it('matches name substring case-insensitively', () => {
    const items = [
      item({ id: 'a', name: 'Buffalo Trace' }),
      item({ id: 'b', name: "Hendrick's Gin", category: 'gin' }),
      item({ id: 'c', name: 'Old Grand-Dad' }),
    ]
    const result = filterInventory(items, 'buffalo', 'All Bottles')
    expect(result.map((i) => i.id)).toEqual(['a'])

    const resultUpper = filterInventory(items, 'BUFFALO', 'All Bottles')
    expect(resultUpper.map((i) => i.id)).toEqual(['a'])
  })

  it('filters by category when not All Bottles', () => {
    const items = [
      item({ id: 'a', category: 'bourbon' }),
      item({ id: 'b', category: 'gin' }),
      item({ id: 'c', category: 'bourbon' }),
    ]
    const result = filterInventory(items, '', 'Bourbon')
    expect(result.map((i) => i.id)).toEqual(['a', 'c'])
  })

  it('"All Bottles" bypasses category filter', () => {
    const items = [
      item({ id: 'a', category: 'bourbon' }),
      item({ id: 'b', category: 'gin' }),
    ]
    const result = filterInventory(items, '', 'All Bottles')
    expect(result.map((i) => i.id)).toEqual(['a', 'b'])
  })

  it('applies both search and category filter', () => {
    const items = [
      item({ id: 'a', name: 'Buffalo Trace', category: 'bourbon' }),
      item({ id: 'b', name: 'Buffalo Gin', category: 'gin' }),
      item({ id: 'c', name: 'Macallan', category: 'scotch' }),
    ]
    const result = filterInventory(items, 'buffalo', 'Bourbon')
    expect(result.map((i) => i.id)).toEqual(['a'])
  })

  it('ignores whitespace-only search', () => {
    const items = [item({ id: 'a', name: 'Anything' })]
    expect(filterInventory(items, '   ', 'All Bottles')).toEqual(items)
  })
})

describe('groupByCategory', () => {
  it('returns [] for empty input', () => {
    expect(groupByCategory([])).toEqual([])
  })

  it('produces interleaved header/bottle entries in input order', () => {
    const items = [
      item({ id: 'a', category: 'bourbon', name: 'A' }),
      item({ id: 'b', category: 'bourbon', name: 'B' }),
      item({ id: 'c', category: 'gin', name: 'C' }),
    ]
    const result = groupByCategory(items)
    expect(result).toEqual([
      { type: 'header', category: 'bourbon' },
      { type: 'bottle', data: items[0]! },
      { type: 'bottle', data: items[1]! },
      { type: 'header', category: 'gin' },
      { type: 'bottle', data: items[2]! },
    ])
  })

  it('does not re-open a category header once switched (assumes pre-sorted input)', () => {
    // Input already grouped by category - matches how filter feeds into it.
    const items = [
      item({ id: 'a', category: 'bourbon' }),
      item({ id: 'b', category: 'gin' }),
    ]
    const result = groupByCategory(items)
    expect(result.filter((r) => r.type === 'header')).toHaveLength(2)
  })
})
