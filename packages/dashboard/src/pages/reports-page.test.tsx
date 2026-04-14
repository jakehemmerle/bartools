import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAppRoutes } from '../test/test-utils'

describe('Reports routes', () => {
  it('renders all backend lifecycle statuses on the reports list', async () => {
    renderAppRoutes({ initialEntries: ['/reports'] })

    expect(await screen.findByText('created')).toBeInTheDocument()
    expect(screen.getByText('processing')).toBeInTheDocument()
    expect(screen.getByText('unreviewed')).toBeInTheDocument()
    expect(screen.getByText('reviewed')).toBeInTheDocument()
  })

  it('shows missing-media fallback without hiding the record details', async () => {
    renderAppRoutes({
      initialEntries: ['/reports/report-missing-media'],
    })

    expect(await screen.findByText('Image unavailable')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Campari' })).toBeInTheDocument()
    expect(screen.queryByText('Corrected values')).not.toBeInTheDocument()
  })

  it('shows correction comparison when model and saved values both exist', async () => {
    renderAppRoutes({
      initialEntries: ['/reports/report-1003'],
    })

    expect(await screen.findByText('Original model output')).toBeInTheDocument()
    expect(screen.getByText('Final corrected values')).toBeInTheDocument()
  })

  it('shows failed record state on an unreviewed report', async () => {
    renderAppRoutes({
      initialEntries: ['/reports/report-1002'],
    })

    expect(await screen.findByText('Failed record')).toBeInTheDocument()
    expect(screen.getByText(/catalog_no_match/i)).toBeInTheDocument()
  })

  it('shows review controls but keeps submission blocked without user context', async () => {
    renderAppRoutes({
      initialEntries: ['/reports/report-1002'],
    })

    expect(await screen.findAllByText('Review draft')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Submit review' })).toBeDisabled()
    expect(
      screen.getByText(/submission unlocks once this workbench is connected/i),
    ).toBeInTheDocument()
  })
})
