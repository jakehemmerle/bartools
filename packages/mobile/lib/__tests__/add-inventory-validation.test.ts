import { describe, it, expect } from 'bun:test'
import { validateAddInventoryForm } from '../add-inventory-validation'

const UUID_A = '11111111-1111-4111-8111-111111111111'
const UUID_B = '22222222-2222-4222-8222-222222222222'

describe('validateAddInventoryForm', () => {
  it('returns no errors for a valid input', () => {
    const errors = validateAddInventoryForm({
      bottleId: UUID_A,
      locationId: UUID_B,
      fillPercent: 50,
    })
    expect(errors).toEqual([])
  })

  it('allows notes when trimmed non-empty', () => {
    const errors = validateAddInventoryForm({
      bottleId: UUID_A,
      locationId: UUID_B,
      fillPercent: 0,
      notes: '  behind the well shelf  ',
    })
    expect(errors).toEqual([])
  })

  it('rejects missing bottleId', () => {
    const errors = validateAddInventoryForm({
      locationId: UUID_B,
      fillPercent: 50,
    })
    expect(errors.length).toBeGreaterThan(0)
    expect(errors.some((e) => e.toLowerCase().includes('bottle'))).toBe(true)
  })

  it('rejects non-uuid bottleId', () => {
    const errors = validateAddInventoryForm({
      bottleId: 'not-a-uuid',
      locationId: UUID_B,
      fillPercent: 50,
    })
    expect(errors.some((e) => e.toLowerCase().includes('bottle'))).toBe(true)
  })

  it('rejects missing locationId', () => {
    const errors = validateAddInventoryForm({
      bottleId: UUID_A,
      fillPercent: 50,
    })
    expect(errors.some((e) => e.toLowerCase().includes('location'))).toBe(true)
  })

  it('rejects non-uuid locationId', () => {
    const errors = validateAddInventoryForm({
      bottleId: UUID_A,
      locationId: 'nope',
      fillPercent: 50,
    })
    expect(errors.some((e) => e.toLowerCase().includes('location'))).toBe(true)
  })

  it('rejects fillPercent below 0', () => {
    const errors = validateAddInventoryForm({
      bottleId: UUID_A,
      locationId: UUID_B,
      fillPercent: -1,
    })
    expect(errors.some((e) => e.toLowerCase().includes('fill'))).toBe(true)
  })

  it('rejects fillPercent above 100', () => {
    const errors = validateAddInventoryForm({
      bottleId: UUID_A,
      locationId: UUID_B,
      fillPercent: 101,
    })
    expect(errors.some((e) => e.toLowerCase().includes('fill'))).toBe(true)
  })

  it('accepts 0 and 100 as valid fillPercent bounds', () => {
    expect(
      validateAddInventoryForm({
        bottleId: UUID_A,
        locationId: UUID_B,
        fillPercent: 0,
      }),
    ).toEqual([])
    expect(
      validateAddInventoryForm({
        bottleId: UUID_A,
        locationId: UUID_B,
        fillPercent: 100,
      }),
    ).toEqual([])
  })

  it('rejects notes that are whitespace-only', () => {
    const errors = validateAddInventoryForm({
      bottleId: UUID_A,
      locationId: UUID_B,
      fillPercent: 50,
      notes: '   ',
    })
    expect(errors.some((e) => e.toLowerCase().includes('notes'))).toBe(true)
  })

  it('allows missing (undefined) notes', () => {
    const errors = validateAddInventoryForm({
      bottleId: UUID_A,
      locationId: UUID_B,
      fillPercent: 50,
    })
    expect(errors).toEqual([])
  })
})
