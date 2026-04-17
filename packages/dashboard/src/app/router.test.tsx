import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAppRoutes } from '../test/test-utils'

describe('app routing', () => {
  it.each([
    '/inventory',
    '/low-stock',
    '/settings',
    '/sign-in',
    '/sign-up',
    '/reset-password',
    '/onboarding/create',
    '/onboarding/join',
    '/totally-unknown-route',
  ])('redirects %s back to the reports workbench', async (route) => {
    renderAppRoutes({ initialEntries: [route] })

    expect(await screen.findByRole('heading', { name: 'Reports' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Inventory' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Low Stock' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
  })

  it('keeps the entry route active as a real product surface', async () => {
    renderAppRoutes({ initialEntries: ['/'] })

    expect(await screen.findByRole('heading', { name: 'Reports Workbench' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open reports/i })).toBeInTheDocument()
  })

  it('keeps reports detail routes active', async () => {
    renderAppRoutes({ initialEntries: ['/reports/report-1002'] })

    expect(await screen.findByRole('heading', { name: 'Report 1002' })).toBeInTheDocument()
  })
})
