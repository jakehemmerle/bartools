import { describe, expect, it } from 'vitest'
import { makeInventoryRow } from './fixtures/builders'
import {
  filterInventoryRows,
  sortInventoryRows,
  sortLowStockRows,
} from './inventory-view'

const rows = [
  makeInventoryRow({
    productId: 'vodka',
    productName: 'Tito’s Handmade Vodka',
    upc: '111',
    onHandComparableAmount: 1800,
    asOf: '2026-04-09T22:15:00-05:00',
    belowPar: false,
  }),
  makeInventoryRow({
    productId: 'tequila',
    productName: 'Espolòn Blanco',
    upc: '222',
    onHandComparableAmount: 900,
    asOf: '2026-04-08T22:15:00-05:00',
    belowPar: true,
    parComparableAmount: 1500,
  }),
  makeInventoryRow({
    productId: 'amaro',
    productName: 'Campari',
    upc: '333',
    onHandComparableAmount: 350,
    asOf: '2026-03-18T22:15:00-05:00',
    belowPar: true,
    parComparableAmount: 1500,
  }),
]

describe('inventory view helpers', () => {
  it('filters rows by product name and below-par status', () => {
    expect(filterInventoryRows(rows, 'espo', 'all')).toHaveLength(1)
    expect(filterInventoryRows(rows, '', 'below-par')).toHaveLength(2)
  })

  it('sorts inventory rows by on-hand quantity descending', () => {
    const sorted = sortInventoryRows(rows, 'quantity')

    expect(sorted.map((row) => row.productId)).toEqual([
      'vodka',
      'tequila',
      'amaro',
    ])
  })

  it('sorts low-stock rows by urgency gap', () => {
    const sorted = sortLowStockRows(rows.filter((row) => row.belowPar), 'urgency')

    expect(sorted.map((row) => row.productId)).toEqual(['amaro', 'tequila'])
  })
})
