import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createFixtureReportsClient } from '../../../lib/reports/client'
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

  it('shows a calm reports unavailable state when the reports request fails', async () => {
    const baseClient = createFixtureReportsClient()
    const user = userEvent.setup()
    let attempts = 0
    const reportsClient = {
      ...baseClient,
      listReports: async () => {
        attempts += 1

        if (attempts === 1) {
          throw new Error('network_error')
        }

        return baseClient.listReports()
      },
    }

    renderAppRoutes({
      initialEntries: ['/reports'],
      reportsClient,
    })

    expect(await screen.findByText('Reports Unavailable')).toBeInTheDocument()
    expect(
      screen.getByText('Reports could not be loaded right now. Try again in a moment.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('created')).toBeInTheDocument()
    expect(attempts).toBe(2)
  })

  it('shows a calm report unavailable state when report detail fails to load', async () => {
    const baseClient = createFixtureReportsClient()
    const user = userEvent.setup()
    let attempts = 0
    const reportsClient = {
      ...baseClient,
      getReport: async () => {
        attempts += 1

        if (attempts === 1) {
          throw new Error('network_error')
        }

        return baseClient.getReport('report-1002')
      },
    }

    renderAppRoutes({
      initialEntries: ['/reports/report-1002'],
      reportsClient,
    })

    expect(await screen.findByRole('heading', { name: 'Report Unavailable' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Reports' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('heading', { name: 'Report 1002' })).toBeInTheDocument()
    expect(attempts).toBe(2)
  })

  it('shows a calm stream notice when live updates disconnect', async () => {
    const baseClient = createFixtureReportsClient()
    const detail = await baseClient.getReport('report-1001')
    const reportsClient = {
      ...baseClient,
      async getReport() {
        return detail
      },
      streamReport(_reportId: string, onEvent: Parameters<typeof baseClient.streamReport>[1]) {
        queueMicrotask(() => {
          onEvent({
            type: 'report.stream_disconnected',
            data: {
              message: 'Live updates paused. Refresh or try again in a moment.',
            },
          })
        })

        return () => undefined
      },
    }

    renderAppRoutes({
      initialEntries: ['/reports/report-1001'],
      reportsClient,
    })

    expect(
      await screen.findByText('Live updates paused. Refresh or try again in a moment.'),
    ).toBeInTheDocument()
  })
})
