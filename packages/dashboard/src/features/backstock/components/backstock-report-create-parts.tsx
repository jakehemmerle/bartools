import type { BottleSearchResult } from '@bartools/types'
import { Button } from '../../../components/primitives/button'
import { ReportBottleMatchField } from '../../reports/components/report-bottle-match-field'
import type {
  BackstockDraftLineItem,
} from '../lib/backstock-draft'

export function BackstockLineItemEditor({
  index,
  lineItem,
  onQuantityChange,
  onQueryChange,
  onRemoveLineItem,
  onSearch,
  onSelectResult,
}: {
  index: number
  lineItem: BackstockDraftLineItem
  onQuantityChange: (lineItemId: string, quantity: number) => void
  onQueryChange: (lineItemId: string, query: string) => void
  onRemoveLineItem: (lineItemId: string) => void
  onSearch: (lineItemId: string, query: string) => void
  onSelectResult: (lineItemId: string, result: BottleSearchResult) => void
}) {
  const quantityInputId = `${lineItem.id}-quantity`
  const selectedBottleLabel = lineItem.selectedBottle?.name ?? `Line item ${index + 1}`

  return (
    <div className="bb-backstock-line-item">
      <div className="bb-backstock-line-item__meta">
        <p className="bb-backstock-line-item__eyebrow">
          {lineItem.origin === 'generated' ? 'Generated Suggestion' : 'Manual Entry'}
        </p>
        <Button onPress={() => onRemoveLineItem(lineItem.id)} variant="ghost">
          Remove
        </Button>
      </div>

      <div className="bb-backstock-line-item__fields">
        <ReportBottleMatchField
          emptyHint="Search by product name to add the right bottle."
          inputId={`${lineItem.id}-product`}
          label="Product"
          onQueryChange={(query) => onQueryChange(lineItem.id, query)}
          onSearch={(query) => onSearch(lineItem.id, query)}
          onSelectResult={(result) => onSelectResult(lineItem.id, result)}
          placeholder="Search the bottle catalog…"
          search={lineItem.search}
          selectedBottleId={lineItem.selectedBottle?.id ?? null}
        />

        <label className="bb-field" htmlFor={quantityInputId}>
          <span className="bb-field__label">Full Bottles</span>
          <input
            className="bb-input"
            id={quantityInputId}
            inputMode="numeric"
            min={0}
            onChange={(event) =>
              onQuantityChange(lineItem.id, normalizeFullBottleQuantity(event.currentTarget.valueAsNumber))
            }
            step={1}
            type="number"
            value={lineItem.quantityFullBottles}
          />
          <p className="bb-field__hint">
            {lineItem.selectedBottle
              ? `${selectedBottleLabel} is counted as sealed and full.`
              : 'Choose a product before submitting this line item.'}
          </p>
        </label>
      </div>
    </div>
  )
}

function normalizeFullBottleQuantity(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.trunc(value))
}

export function BackstockSummaryGrid({
  locationName,
  productCount,
  sourcePhotoCount,
  totalBottleCount,
}: {
  locationName: string
  productCount: number
  sourcePhotoCount: number
  totalBottleCount: number
}) {
  return (
    <div className="bb-backstock-summary-grid">
      <div>
        <p className="bb-backstock-stat__label">Location</p>
        <p className="bb-backstock-stat__value">{locationName}</p>
      </div>
      <div>
        <p className="bb-backstock-stat__label">Products</p>
        <p className="bb-backstock-stat__value">{productCount}</p>
      </div>
      <div>
        <p className="bb-backstock-stat__label">Full Bottles</p>
        <p className="bb-backstock-stat__value">{totalBottleCount}</p>
      </div>
      <div>
        <p className="bb-backstock-stat__label">Source Photos</p>
        <p className="bb-backstock-stat__value">{sourcePhotoCount}</p>
      </div>
    </div>
  )
}
