import type { Bottle, Location, InventoryItem } from '@bartools/types'

// Locations
export const MOCK_LOCATIONS: Location[] = [
  { id: 'loc-1', venueId: 'v-1', name: 'Main Bar', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'loc-2', venueId: 'v-1', name: 'Cocktail Lab', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'loc-3', venueId: 'v-1', name: 'Pool Bar', createdAt: '2024-01-01T00:00:00Z' },
]

// Bottles (from Stitch screens) — uses `name` (single field, per @bartools/types)
export const MOCK_BOTTLES: Bottle[] = [
  {
    id: 'b-1', name: 'Old Grand-Dad 114',
    category: 'bourbon', subcategory: 'High Rye',
    sizeMl: 750, abv: 57, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b-2', name: 'Buffalo Trace Kentucky Straight',
    category: 'bourbon', subcategory: 'Kentucky Straight',
    sizeMl: 1000, abv: 45, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b-3', name: 'The Botanist Islay Dry Gin',
    category: 'gin', subcategory: 'Dry Gin',
    sizeMl: 700, abv: 46, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b-4', name: 'Macallan 12 Year',
    category: 'scotch', subcategory: 'Speyside Single Malt',
    sizeMl: 750, abv: 43, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b-5', name: "Hendrick's Gin",
    category: 'gin', subcategory: 'Small Batch',
    sizeMl: 750, abv: 44, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b-6', name: 'Aviation American Gin',
    category: 'gin', subcategory: 'House Recommended',
    sizeMl: 750, abv: 42, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b-7', name: 'Carpano Antica Formula',
    category: 'vermouth', subcategory: 'Sweet Vermouth',
    sizeMl: 1000, abv: 16.5, createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'b-8', name: 'Angostura Aromatic Bitters',
    category: 'bitters', subcategory: 'Aromatic',
    sizeMl: 200, abv: 44.7, createdAt: '2024-01-01T00:00:00Z',
  },
]

// Inventory items with fill levels
export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', locationId: 'loc-1', bottleId: 'b-1', fillLevelTenths: 9, addedAt: '2024-01-01T00:00:00Z' },
  { id: 'inv-2', locationId: 'loc-1', bottleId: 'b-2', fillLevelTenths: 2, addedAt: '2024-01-01T00:00:00Z' },
  { id: 'inv-3', locationId: 'loc-1', bottleId: 'b-3', fillLevelTenths: 10, addedAt: '2024-01-01T00:00:00Z' },
  { id: 'inv-4', locationId: 'loc-1', bottleId: 'b-4', fillLevelTenths: 9, addedAt: '2024-01-01T00:00:00Z' },
  { id: 'inv-5', locationId: 'loc-1', bottleId: 'b-5', fillLevelTenths: 4, addedAt: '2024-01-01T00:00:00Z' },
  { id: 'inv-6', locationId: 'loc-2', bottleId: 'b-6', fillLevelTenths: 10, addedAt: '2024-01-01T00:00:00Z' },
  { id: 'inv-7', locationId: 'loc-1', bottleId: 'b-7', fillLevelTenths: 1, addedAt: '2024-01-01T00:00:00Z' },
  { id: 'inv-8', locationId: 'loc-2', bottleId: 'b-8', fillLevelTenths: 2, addedAt: '2024-01-01T00:00:00Z' },
]

// Low stock alert type
export type LowStockAlert = {
  bottle: Pick<Bottle, 'id' | 'name'>
  location: Pick<Location, 'id' | 'name'>
  fillPercent: number
  parThreshold: number
}

// Low stock alerts (from Stitch screens)
export const MOCK_LOW_STOCK_ALERTS: LowStockAlert[] = [
  { bottle: MOCK_BOTTLES[1], location: MOCK_LOCATIONS[0], fillPercent: 15, parThreshold: 25 },
  { bottle: MOCK_BOTTLES[6], location: MOCK_LOCATIONS[0], fillPercent: 8, parThreshold: 20 },
  { bottle: MOCK_BOTTLES[7], location: MOCK_LOCATIONS[1], fillPercent: 22, parThreshold: 30 },
]

// Filter categories for inventory screen
export const INVENTORY_FILTERS = ['All Bottles', 'Bourbon', 'Gin', 'Amaro', 'Rum', 'Vermouth'] as const
