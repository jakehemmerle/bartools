# Dashboard Data Contracts

## Purpose

Define the minimum data the dashboard needs from the backend so frontend and backend work can align before implementation.

This document defines dashboard-facing contracts only. It does not prescribe backend storage, training, retention, or internal service structure.

## Auth

### User

```ts
type User = {
  id: string
  email: string
  displayName?: string
  barId: string
  canManageBar: boolean
}
```

MVP auth assumption:

- Each user belongs to exactly one bar
- Multi-bar switching is out of scope
- Multiple users may belong to the same bar

type SignupOnboardingChoice = 'create_bar' | 'join_bar'
type InviteLink = {
  url: string
}

type BarMember = {
  userId: string
  displayName?: string
  email: string
  canManageBar: boolean
}

## Settings

```ts
type BarSettings = {
  barId: string
  timezone: string
  defaultParComparableAmount: number
  defaultParComparableUnit: 'ml' | 'bottle_equivalent'
}

type ProductParOverride = {
  productId: string
  productName: string
  upc: string
  parComparableAmount: number
  parComparableUnit: 'ml' | 'bottle_equivalent'
}
```

Example resources:

- bar settings
- product PAR override list
- invite link generation
- bar member list with manager capability updates

## Inventory

```ts
type InventoryProductRow = {
  productId: string
  productName: string
  category?: string
  upc: string
  volumeMl?: number
  onHandComparableAmount: number
  comparableUnit: 'ml' | 'bottle_equivalent'
  displayQuantityLabel?: string
  belowPar: boolean
  belowParReason?: string
  parComparableAmount?: number
  barDefaultParComparableAmount?: number
  asOf: string
  latestSessionId?: string
  sourceSessionStatus: 'confirmed'
}
```

MVP inventory assumptions:

- UPC is the practical canonical product identifier
- Inventory is shown as the latest confirmed on-hand stock by product
- `below par` is derived from total on-hand stock versus PAR level
- The dashboard must not invent comparison math locally
- Backend must provide inventory and PAR values in the same comparable unit for a given product
- The preferred comparable unit is milliliters when the pipeline can support it reliably
- If milliliter-accurate normalization is not trustworthy for a product, backend may provide `bottle_equivalent` instead as long as inventory and PAR use the same unit
- Human-readable quantity labels may be derived from that canonical comparable value for display
- PAR is set per product, with a bar-level default available as a fallback
- Only confirmed session data may influence product-level inventory rows

Example query capabilities:

- `search`
- `lowStock`
- `sort`

## Low Stock

Low stock can reuse `InventoryProductRow` if the inventory resource supports filtering.

Example resource options:

- inventory resource with a `lowStock` filter
- or a dedicated low-stock resource

Low stock in MVP means:

- Product-level `below par` status based on total on-hand stock
- Comparison against PAR uses the backend-provided comparable unit for that product
- Only confirmed session data may influence low-stock status

## Sessions

```ts
type SessionListItem = {
  id: string
  startedAt?: string
  completedAt?: string
  userId?: string
  userDisplayName?: string
  bottleCount: number
  status: 'in_progress' | 'confirmed' | 'failed'
}
```

Example resource:

- sessions list

## Session Detail

```ts
type SessionBottleRecord = {
  id: string
  imageUrl: string
  bottleName: string
  category?: string
  upc?: string
  volumeMl?: number
  fillPercent: number
  corrected: boolean
  originalModelOutput?: {
    bottleName?: string
    category?: string
    upc?: string
    volumeMl?: number
    fillPercent?: number
  }
  correctedValues?: {
    bottleName?: string
    category?: string
    upc?: string
    volumeMl?: number
    fillPercent?: number
  }
}

type SessionDetail = {
  id: string
  startedAt?: string
  completedAt?: string
  userId?: string
  userDisplayName?: string
  status: 'in_progress' | 'confirmed' | 'failed'
  bottleRecords: SessionBottleRecord[]
}
```

Example resource:

- session detail by id

## Export

Example export capabilities:

- inventory export
- low-stock export

An acceptable MVP alternative is client-side CSV generation from fetched JSON if backend export endpoints are not needed yet.

Session export is deferred from MVP unless the team explicitly re-promotes it later.

## Backstock Reports

```ts
type BackstockReportLineItem = {
  productId: string
  productName: string
  category?: string
  upc?: string
  volumeMl?: number
  quantityFullBottles: number
}

type BackstockSourcePhoto = {
  id: string
  imageUrl: string
  uploadedAt?: string
}

type BackstockReportListItem = {
  id: string
  locationId: string
  locationName: string
  userId?: string
  userDisplayName?: string
  createdAt?: string
  submittedAt?: string
  skuCount: number
  totalBottleCount: number
  status: 'draft' | 'submitted'
  reportMode: 'backstock'
}

type BackstockReportDetail = {
  id: string
  locationId: string
  locationName: string
  userId?: string
  userDisplayName?: string
  createdAt?: string
  submittedAt?: string
  status: 'draft' | 'submitted'
  reportMode: 'backstock'
  lineItems: BackstockReportLineItem[]
  sourcePhotos: BackstockSourcePhoto[]
}
```

MVP backstock assumptions:

- Backstock reports are product-level reports, not bottle-level review records
- Line items represent integer counts of full bottles
- Backstock reports do not use fill sliders in MVP
- Source photos are optional input for generated draft line items in MVP
- When source photos are used, they are provided up front to create the initial draft rather than attached later as evidence
- The operator must be able to edit generated products and counts before submit
- The dashboard must not invent quantity inference locally from attached photos
- Backstock reports are scoped to one location
- This draft assumes snapshot semantics by default rather than delta semantics
- The editable draft can remain frontend-local in MVP after generation returns

Example resource capabilities:

- request presigned upload targets for backstock source photos
- optionally generate backstock draft from source photos supplied at creation time
- submit backstock report
- list backstock reports
- get backstock report detail

Open contract questions:

- whether submitted detail always retains the source photos or allows later pruning
- whether backstock report history shares a collection with scan reports or uses a dedicated resource
- how low-confidence or partial-coverage warnings are represented in the generated draft

Implementation note:

- Photo-assisted backstock should assume direct-to-storage uploads via presigned URLs because the backend is expected to run in a serverless shape.

## Notes

- Session detail assumes thumbnail images are available for confirmed bottle records in MVP.
- The dashboard should be able to display both original model output and final corrected values when that data is exposed.
- Exact resource names matter less than agreeing on stable shapes and query behavior before implementation.
- Product-level inventory rows and bottle-level session records are intentionally separate shapes in MVP.
