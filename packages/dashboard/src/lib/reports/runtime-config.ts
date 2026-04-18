import { z } from 'zod'

type DashboardEnvironment = {
  VITE_BARTOOLS_API_BASE_URL?: string
  VITE_BARTOOLS_REVIEWER_USER_ID?: string
  VITE_BARTOOLS_VENUE_ID?: string
}

export type DashboardRuntimeConfig =
  | { reportsMode: 'fixture' }
  | { reportsMode: 'backend'; backendBaseUrl: string }

const environmentSchema = z.object({
  VITE_BARTOOLS_API_BASE_URL: z.string().optional(),
  VITE_BARTOOLS_REVIEWER_USER_ID: z.string().optional(),
  VITE_BARTOOLS_VENUE_ID: z.string().optional(),
})

export const dashboardFixtureVenueId = 'fixture-venue'

const backendBaseUrlSchema = z.string().refine(isSupportedBackendBaseUrl, {
  message: 'Invalid URL',
})

export function createDashboardRuntimeConfig(
  environment: DashboardEnvironment,
): DashboardRuntimeConfig {
  const parsedEnvironment = environmentSchema.parse(environment)
  const backendBaseUrl = normalizeBackendBaseUrl(
    parsedEnvironment.VITE_BARTOOLS_API_BASE_URL,
  )

  if (!backendBaseUrl) {
    return { reportsMode: 'fixture' }
  }

  return {
    reportsMode: 'backend',
    backendBaseUrl: backendBaseUrlSchema.parse(backendBaseUrl),
  }
}

export function getDashboardRuntimeConfig(): DashboardRuntimeConfig {
  return createDashboardRuntimeConfig({
    VITE_BARTOOLS_API_BASE_URL: import.meta.env.VITE_BARTOOLS_API_BASE_URL,
  })
}

export function getDashboardVenueId(
  environment?: DashboardEnvironment,
) {
  const parsedEnvironment = environmentSchema.parse(environment ?? import.meta.env)

  return normalizeOptionalIdentifier(parsedEnvironment.VITE_BARTOOLS_VENUE_ID)
}

export function getDashboardReviewerUserId(
  environment?: DashboardEnvironment,
) {
  const parsedEnvironment = environmentSchema.parse(environment ?? import.meta.env)

  return normalizeOptionalIdentifier(parsedEnvironment.VITE_BARTOOLS_REVIEWER_USER_ID)
}

function normalizeBackendBaseUrl(value: string | undefined) {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    return undefined
  }

  return trimmedValue.replace(/\/+$/, '')
}

function normalizeOptionalIdentifier(value: string | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : undefined
}

function isSupportedBackendBaseUrl(value: string) {
  if (value.startsWith('/')) {
    return !value.startsWith('//')
  }

  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}
