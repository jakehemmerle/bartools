// Backend URL — override via BARTOOLS_API_URL env var for testing
export const API_BASE_URL: string =
  process.env.BARTOOLS_API_URL ?? 'http://localhost:3000'

// Hardcoded until auth is implemented
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'
export const DEFAULT_VENUE_ID = '00000000-0000-0000-0000-000000000001'
