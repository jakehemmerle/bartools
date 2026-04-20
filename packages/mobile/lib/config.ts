// Backend URL. Set EXPO_PUBLIC_BARTOOLS_API_URL via packages/mobile/.env.local
// (auto-loaded by Metro) or via `bun run start:staging|prod|lan|local`.
// EAS build profiles inject this at build time (see eas.json). The dev client
// re-reads env from Metro on every bundle, so the prebuild value is NOT sticky
// during development — local env is authoritative.
const envUrl = process.env.EXPO_PUBLIC_BARTOOLS_API_URL
if (!envUrl) {
  console.warn(
    '[config] EXPO_PUBLIC_BARTOOLS_API_URL is unset — falling back to http://localhost:3000. ' +
      'This will fail on physical devices and if port 3000 is taken. ' +
      'Set packages/mobile/.env.local or run `bun run start:staging`.',
  )
}
export const API_BASE_URL: string = envUrl ?? 'http://localhost:3000'

// TODO: replace with authenticated user/venue from auth context.
// These must match DEMO_USER_ID / DEMO_VENUE_ID in packages/backend/src/seed.ts.
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'
export const DEFAULT_VENUE_ID = '00000000-0000-0000-0000-000000000002'
