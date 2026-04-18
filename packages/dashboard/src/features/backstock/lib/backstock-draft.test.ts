import { describe, expect, it } from 'vitest'
import {
  buildFixtureGeneratedLineItems,
  buildSubmittedBackstockSummary,
  createBackstockDraftLineItem,
} from './backstock-draft'

function createPhoto(name: string) {
  return {
    id: name,
    file: new File(['fixture'], name, { type: 'image/png' }),
    name,
    sizeBytes: 7,
  }
}

describe('backstock draft helpers', () => {
  it('seeds grouped generated line items from source photos', () => {
    const lineItems = buildFixtureGeneratedLineItems([
      createPhoto('shelf-1.png'),
      createPhoto('shelf-2.png'),
    ])

    expect(lineItems).toHaveLength(3)
    expect(lineItems[0]?.selectedBottle?.name).toBe("Tito's Handmade Vodka")
    expect(lineItems[0]?.quantityFullBottles).toBe(12)
    expect(lineItems[0]?.origin).toBe('generated')
  })

  it('consolidates duplicate products when building a submission summary', () => {
    const summary = buildSubmittedBackstockSummary([
      createBackstockDraftLineItem({
        quantityFullBottles: 4,
        selectedBottle: {
          id: 'bottle-1',
          name: "Tito's Handmade Vodka",
          category: 'vodka',
          upc: '619947000013',
          volumeMl: 750,
        },
      }),
      createBackstockDraftLineItem({
        quantityFullBottles: 2,
        selectedBottle: {
          id: 'bottle-1',
          name: "Tito's Handmade Vodka",
          category: 'vodka',
          upc: '619947000013',
          volumeMl: 750,
        },
      }),
      createBackstockDraftLineItem({
        quantityFullBottles: 1,
        selectedBottle: {
          id: 'bottle-2',
          name: 'Espolòn Blanco',
          category: 'tequila',
          upc: '080686834203',
          volumeMl: 750,
        },
      }),
    ])

    expect(summary.skuCount).toBe(2)
    expect(summary.totalBottleCount).toBe(7)
    expect(summary.lineItems).toEqual([
      {
        bottle: {
          id: 'bottle-2',
          name: 'Espolòn Blanco',
          category: 'tequila',
          upc: '080686834203',
          volumeMl: 750,
        },
        quantityFullBottles: 1,
      },
      {
        bottle: {
          id: 'bottle-1',
          name: "Tito's Handmade Vodka",
          category: 'vodka',
          upc: '619947000013',
          volumeMl: 750,
        },
        quantityFullBottles: 6,
      },
    ])
  })
})
