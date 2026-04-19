import type { Bottle, Location } from '@bartools/types'

// Low stock alert type (still used by components/AlertBanner.tsx until the
// backend surfaces a real low-stock feed).
export type LowStockAlert = {
  bottle: Pick<Bottle, 'id' | 'name'>
  location: Pick<Location, 'id' | 'name'>
  fillPercent: number
  parThreshold: number
}

// Stub low-stock alerts — placeholder until the backend exposes a real feed.
export const MOCK_LOW_STOCK_ALERTS: LowStockAlert[] = [
  {
    bottle: { id: 'b-2', name: 'Buffalo Trace Kentucky Straight' },
    location: { id: 'loc-1', name: 'Main Bar' },
    fillPercent: 15,
    parThreshold: 25,
  },
  {
    bottle: { id: 'b-7', name: 'Carpano Antica Formula' },
    location: { id: 'loc-1', name: 'Main Bar' },
    fillPercent: 8,
    parThreshold: 20,
  },
  {
    bottle: { id: 'b-8', name: 'Angostura Aromatic Bitters' },
    location: { id: 'loc-2', name: 'Cocktail Lab' },
    fillPercent: 22,
    parThreshold: 30,
  },
]

// Filter categories for the inventory screen's chip row.
export const INVENTORY_FILTERS = ['All Bottles', 'Bourbon', 'Gin', 'Amaro', 'Rum', 'Vermouth'] as const
