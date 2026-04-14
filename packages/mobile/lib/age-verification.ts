const STORAGE_KEY = 'barback:age_verified'
const MINIMUM_AGE = 21

export { STORAGE_KEY, MINIMUM_AGE }

/**
 * Calculate the integer age from a birth date relative to a reference date.
 */
export function formatAge(birthDate: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - birthDate.getFullYear()
  const monthDiff = now.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

/**
 * Returns true if the person born on `birthDate` is at least MINIMUM_AGE years old.
 */
export function isOldEnough(birthDate: Date, now: Date = new Date()): boolean {
  return formatAge(birthDate, now) >= MINIMUM_AGE
}
