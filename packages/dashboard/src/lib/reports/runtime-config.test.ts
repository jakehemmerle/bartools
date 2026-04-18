import { describe, expect, it } from 'vitest'
import {
  createDashboardRuntimeConfig,
  getDashboardReviewerUserId,
  getDashboardVenueId,
} from './runtime-config'

describe('dashboard runtime config', () => {
  it('defaults to fixture mode when the backend base url is missing', () => {
    expect(createDashboardRuntimeConfig({})).toEqual({
      reportsMode: 'fixture',
    })
  })

  it('normalizes the backend base url when configured', () => {
    expect(
      createDashboardRuntimeConfig({
        VITE_BARTOOLS_API_BASE_URL:
          ' https://bartools-backend-staging-zjausnxoyq-ue.a.run.app/ ',
      }),
    ).toEqual({
      reportsMode: 'backend',
      backendBaseUrl: 'https://bartools-backend-staging-zjausnxoyq-ue.a.run.app',
    })
  })

  it('accepts a relative proxy path for local development', () => {
    expect(
      createDashboardRuntimeConfig({
        VITE_BARTOOLS_API_BASE_URL: '/api/',
      }),
    ).toEqual({
      reportsMode: 'backend',
      backendBaseUrl: '/api',
    })
  })

  it('rejects invalid backend urls', () => {
    expect(() =>
      createDashboardRuntimeConfig({
        VITE_BARTOOLS_API_BASE_URL: 'not-a-url',
      }),
    ).toThrow('Invalid URL')
  })

  it('normalizes the configured venue id when present', () => {
    expect(
      getDashboardVenueId({
        VITE_BARTOOLS_VENUE_ID: ' venue-1 ',
      }),
    ).toBe('venue-1')
  })

  it('normalizes the configured reviewer user id when present', () => {
    expect(
      getDashboardReviewerUserId({
        VITE_BARTOOLS_REVIEWER_USER_ID: ' user-1 ',
      }),
    ).toBe('user-1')
  })
})
