import { isValidUuid } from './api'
import { ITEM_CATEGORIES } from '@bartools/types'
import type { ManualBottleInput } from '@bartools/types'

export type AddInventoryInput = {
  bottleId?: string
  bottle?: ManualBottleInput
  locationId?: string
  fillPercent: number
  notes?: string
}

export function validateManualBottle(input: ManualBottleInput | undefined): string[] {
  const errors: string[] = []
  if (!input) {
    errors.push('Bottle is required')
    return errors
  }

  if (input.name.trim().length === 0) {
    errors.push('Bottle name is required')
  }

  if (!ITEM_CATEGORIES.includes(input.category)) {
    errors.push('Bottle category is invalid')
  }

  if (
    input.sizeMl !== undefined &&
    (!Number.isInteger(input.sizeMl) || input.sizeMl <= 0 || input.sizeMl > 10_000)
  ) {
    errors.push('Bottle size must be a positive number')
  }

  if (input.subcategory !== undefined && input.subcategory.trim().length === 0) {
    errors.push('Subcategory cannot be blank')
  }

  if (input.upc !== undefined && input.upc.trim().length === 0) {
    errors.push('UPC cannot be blank')
  }

  return errors
}

/**
 * Validate a proposed POST /inventory payload before hitting the network.
 * Returns a list of human-readable error messages; an empty array means the
 * input is ready to submit.
 */
export function validateAddInventoryForm(input: AddInventoryInput): string[] {
  const errors: string[] = []

  const hasBottleId = typeof input.bottleId === 'string' && input.bottleId.length > 0
  const hasManualBottle = input.bottle !== undefined

  if (hasBottleId && hasManualBottle) {
    errors.push('Choose a catalog bottle or enter bottle details, not both')
  } else if (!hasBottleId && !hasManualBottle) {
    errors.push('Bottle is required')
  } else if (hasBottleId && !isValidUuid(input.bottleId!)) {
    errors.push('Bottle is invalid')
  } else if (hasManualBottle) {
    errors.push(...validateManualBottle(input.bottle))
  }

  if (!input.locationId) {
    errors.push('Location is required')
  } else if (!isValidUuid(input.locationId)) {
    errors.push('Location is invalid')
  }

  if (
    typeof input.fillPercent !== 'number' ||
    Number.isNaN(input.fillPercent) ||
    input.fillPercent < 0 ||
    input.fillPercent > 100
  ) {
    errors.push('Fill level must be between 0 and 100')
  }

  if (input.notes !== undefined && input.notes.trim().length === 0) {
    errors.push('Notes cannot be blank')
  }

  return errors
}
