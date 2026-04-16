import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAppRoutes } from '../test/test-utils'

describe('app routing', () => {
  it('redirects legacy product routes back to the reports workbench', async () => {
    renderAppRoutes({ initialEntries: ['/inventory'] })

    expect(await screen.findByRole('heading', { name: 'Reports' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Inventory' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Low Stock' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
  })

  it('keeps reports detail routes active', async () => {
    renderAppRoutes({ initialEntries: ['/reports/report-1002'] })

    expect(await screen.findByRole('heading', { name: 'Report 1002' })).toBeInTheDocument()
  })
})
