import { describe, it, expect } from 'bun:test'
import { isOldEnough, formatAge, MINIMUM_AGE } from '../age-verification'

describe('age-verification', () => {
  describe('formatAge', () => {
    it('returns 21 for someone exactly 21 today', () => {
      const now = new Date(2026, 3, 13) // April 13, 2026
      const birth = new Date(2005, 3, 13) // April 13, 2005
      expect(formatAge(birth, now)).toBe(21)
    })

    it('returns 20 for someone turning 21 tomorrow', () => {
      const now = new Date(2026, 3, 12) // April 12, 2026
      const birth = new Date(2005, 3, 13) // April 13, 2005
      expect(formatAge(birth, now)).toBe(20)
    })

    it('returns 20 for someone 20 years and 364 days old', () => {
      const now = new Date(2026, 3, 12) // April 12, 2026
      const birth = new Date(2005, 3, 13) // April 13, 2005 (birthday is tomorrow)
      expect(formatAge(birth, now)).toBe(20)
    })

    it('returns 22 for someone who is 22', () => {
      const now = new Date(2026, 3, 13)
      const birth = new Date(2004, 0, 1) // Jan 1, 2004
      expect(formatAge(birth, now)).toBe(22)
    })

    it('returns 18 for someone who is 18', () => {
      const now = new Date(2026, 3, 13)
      const birth = new Date(2008, 3, 13) // April 13, 2008
      expect(formatAge(birth, now)).toBe(18)
    })

    it('handles leap year birthday on non-leap year', () => {
      // Born Feb 29, 2000 (leap year)
      const birth = new Date(2000, 1, 29)
      // Check on Feb 28, 2025 (non-leap year) — still 24
      const feb28 = new Date(2025, 1, 28)
      expect(formatAge(birth, feb28)).toBe(24)
      // Check on Mar 1, 2025 — now 25
      const mar1 = new Date(2025, 2, 1)
      expect(formatAge(birth, mar1)).toBe(25)
    })
  })

  describe('isOldEnough', () => {
    it('passes for someone exactly 21 today', () => {
      const now = new Date(2026, 3, 13)
      const birth = new Date(2005, 3, 13)
      expect(isOldEnough(birth, now)).toBe(true)
    })

    it('fails for someone turning 21 tomorrow', () => {
      const now = new Date(2026, 3, 12)
      const birth = new Date(2005, 3, 13)
      expect(isOldEnough(birth, now)).toBe(false)
    })

    it('fails for someone 20 years 364 days old', () => {
      // Born April 13, 2005 — on April 12, 2026 they are still 20
      const now = new Date(2026, 3, 12)
      const birth = new Date(2005, 3, 13)
      expect(isOldEnough(birth, now)).toBe(false)
    })

    it('passes for someone who is 22', () => {
      const now = new Date(2026, 3, 13)
      const birth = new Date(2004, 0, 1)
      expect(isOldEnough(birth, now)).toBe(true)
    })

    it('fails for someone who is 18', () => {
      const now = new Date(2026, 3, 13)
      const birth = new Date(2008, 3, 13)
      expect(isOldEnough(birth, now)).toBe(false)
    })

    it('handles leap year birthday: born Feb 29, checking non-leap year', () => {
      const birth = new Date(2000, 1, 29)
      // On Feb 28, 2021 — still 20 (birthday hasn't happened yet)
      expect(isOldEnough(birth, new Date(2021, 1, 28))).toBe(false)
      // On Mar 1, 2021 — now 21
      expect(isOldEnough(birth, new Date(2021, 2, 1))).toBe(true)
    })

    it('uses MINIMUM_AGE of 21', () => {
      expect(MINIMUM_AGE).toBe(21)
    })
  })
})
