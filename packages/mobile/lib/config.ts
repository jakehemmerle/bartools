// Backend URL — override via EXPO_PUBLIC_BARTOOLS_API_URL env var for testing
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_BARTOOLS_API_URL ?? 'http://localhost:3000'

// TODO: replace with authenticated user/venue from auth context.
// These must match DEMO_USER_ID / DEMO_VENUE_ID in packages/backend/src/seed.ts.
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'
export const DEFAULT_VENUE_ID = '00000000-0000-0000-0000-000000000002'
