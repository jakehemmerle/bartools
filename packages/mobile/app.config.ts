// Env-switched Expo config. Reads app.json as the base, overlays variant-specific
// fields. Set APP_VARIANT=staging (via EAS env) to build the staging variant.

const IS_STAGING = process.env.APP_VARIANT === 'staging'

const STAGING_BUNDLE_ID = 'com.bartools.barback.staging'
const PROD_BUNDLE_ID = 'com.bartools.barback'

export default ({ config }: { config: Record<string, unknown> }) => ({
  ...config,
  name: IS_STAGING ? 'BarBack (Staging)' : config.name ?? 'BarBack',
  slug: config.slug ?? 'barback',
  scheme: IS_STAGING ? 'barback-staging' : config.scheme ?? 'barback',
  ios: {
    ...(config.ios as Record<string, unknown>),
    bundleIdentifier: IS_STAGING ? STAGING_BUNDLE_ID : PROD_BUNDLE_ID,
  },
  android: {
    ...(config.android as Record<string, unknown>),
    package: IS_STAGING ? STAGING_BUNDLE_ID : PROD_BUNDLE_ID,
  },
})
