import { isValidUuid } from './api'

export type AddInventoryInput = {
  bottleId?: string
  locationId?: string
  fillPercent: number
  notes?: string
}

/**
 * Validate a proposed POST /inventory payload before hitting the network.
 * Returns a list of human-readable error messages; an empty array means the
 * input is ready to submit.
 */
export function validateAddInventoryForm(input: AddInventoryInput): string[] {
  const errors: string[] = []

  if (!input.bottleId) {
    errors.push('Bottle is required')
  } else if (!isValidUuid(input.bottleId)) {
    errors.push('Bottle is invalid')
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
