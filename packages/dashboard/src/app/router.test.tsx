import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAppRoutes } from '../test/test-utils'

describe('app routing', () => {
  it('redirects signed-out users away from authenticated routes', async () => {
    renderAppRoutes({ initialEntries: ['/inventory'] })

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('allows staff users into authenticated routes through persona override', async () => {
    renderAppRoutes({ initialEntries: ['/settings?persona=staff'] })

    expect(await screen.findByText('Manager permission required')).toBeInTheDocument()
  })
})
