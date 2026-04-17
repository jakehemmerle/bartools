import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAppRoutes } from '../../../test/test-utils'

describe('Reports workbench routes', () => {
  it('renders all backend lifecycle statuses on the reports list', async () => {
    renderAppRoutes({ initialEntries: ['/reports'] })

    expect(await screen.findByText('created')).toBeInTheDocument()
    expect(screen.getByText('processing')).toBeInTheDocument()
    expect(screen.getByText('unreviewed')).toBeInTheDocument()
    expect(screen.getByText('reviewed')).toBeInTheDocument()
  })

  it('keeps reviewed record details visible even when media is unavailable', async () => {
    renderAppRoutes({
      initialEntries: ['/reports/report-missing-media'],
    })

    expect(await screen.findByRole('heading', { name: 'Campari' })).toBeInTheDocument()
    expect(await screen.findByText('Original Model Output')).toBeInTheDocument()
    expect(screen.getByText('Final Corrected Values')).toBeInTheDocument()
  })

  it('shows corrected comparison labels on reviewed reports', async () => {
    renderAppRoutes({
      initialEntries: ['/reports/report-1003'],
    })

    expect((await screen.findAllByText('Original Model Output')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Final Corrected Values').length).toBeGreaterThan(0)
  })

  it('shows failed record review controls on an unreviewed report', async () => {
    renderAppRoutes({
      initialEntries: ['/reports/report-1002'],
    })

    expect(await screen.findByText('Fill Level (Tenths)')).toBeInTheDocument()
    expect(screen.getByText(/catalog_no_match/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Review' })).toBeDisabled()
  })
})
