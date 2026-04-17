import { describe, expect, it } from 'vitest'
import { createDashboardRuntimeConfig } from './runtime-config'

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
})
