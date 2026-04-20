import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFixtureReportsClient } from '../../../lib/reports/client'
import { renderAppRoutes } from '../../../test/test-utils'

afterEach(() => {
  vi.useRealTimers()
})

describe('Reports workbench routes: baseline states', () => {
  it('renders all backend lifecycle statuses on the reports list', async () => {
    renderAppRoutes({ initialEntries: ['/reports'] })

    expect(await screen.findByText('created')).toBeInTheDocument()
    expect(screen.getByText('processing')).toBeInTheDocument()
    expect(screen.getByText('unreviewed')).toBeInTheDocument()
    expect(screen.getByText('reviewed')).toBeInTheDocument()
    expect(screen.getByText('Private Room')).toBeInTheDocument()
    expect(screen.getByText('Backstock')).toBeInTheDocument()
    expect(screen.getByText('7 / 9 photos')).toBeInTheDocument()
    expect(screen.getByText('18 bottles')).toBeInTheDocument()
  })

  it('keeps reviewed record details visible even when media is unavailable', async () => {
    renderAppRoutes({
      initialEntries: ['/reports/report-missing-media'],
    })

    expect(await screen.findByRole('heading', { name: 'Campari' })).toBeInTheDocument()
    expect(await screen.findByText('Original Model Output')).toBeInTheDocument()
    expect(screen.getByText('Final Corrected Values')).toBeInTheDocument()
    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
  })

  it('shows corrected comparison labels on reviewed reports', async () => {
    renderAppRoutes({
      initialEntries: ['/reports/report-1003'],
    })

    expect(await screen.findByRole('img', { name: /Tito's Handmade Vodka/i })).toBeInTheDocument()
    expect((await screen.findAllByText('Original Model Output')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Final Corrected Values').length).toBeGreaterThan(0)
  })

  it('shows failed record review controls on an unreviewed report', async () => {
    renderAppRoutes({
      initialEntries: ['/reports/report-1002'],
    })

    expect(await screen.findByDisplayValue('Montelobos Mezcal')).toBeInTheDocument()
    expect(screen.getByText('Current match: Montelobos Mezcal.')).toBeInTheDocument()
    expect(await screen.findByText('Fill Level (Tenths)')).toBeInTheDocument()
    expect(screen.getByText(/catalog_no_match/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Review' })).toBeDisabled()
  })

  it('submits a fixture review once every actionable record is resolved', async () => {
    const user = userEvent.setup()

    renderAppRoutes({
      initialEntries: ['/reports/report-1002'],
    })

    const failedRecordCard = (
      await screen.findByText(/catalog_no_match/i)
    ).closest('.bt-record-card')

    expect(failedRecordCard).toBeTruthy()
    await user.type(
      within(failedRecordCard as HTMLElement).getByRole('textbox', { name: 'Product Match' }),
      'espol',
    )
    await user.click(await screen.findByRole('button', { name: /Espolòn Blanco/i }))
    await user.click(screen.getByRole('button', { name: 'Submit Review' }))

    expect((await screen.findAllByText('Final Corrected Values')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Original Model Output').length).toBeGreaterThan(0)
  })
})

describe('Reports workbench routes: resilience', () => {
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

  it('polls live reports every 15 seconds to discover new backend work', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })

    const baseClient = createFixtureReportsClient()
    const listReports = vi.fn(async () => baseClient.listReports())
    const reportsClient = {
      ...baseClient,
      listReports,
      readiness: {
        backendEnabled: true,
        blockedReason: 'none' as const,
        message: 'Live reports are connected.',
      },
    }

    renderAppRoutes({
      initialEntries: ['/reports'],
      reportsClient,
    })

    expect(await screen.findByText('created')).toBeInTheDocument()
    expect(listReports).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000)
    })

    expect(listReports).toHaveBeenCalledTimes(2)
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
})

describe('Reports workbench routes: live transitions', () => {
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

  it('keeps live review disabled until every actionable record is resolved', async () => {
    const baseClient = createFixtureReportsClient()
    const detail = await baseClient.getReport('report-1002')
    const reportsClient = {
      ...baseClient,
      readiness: {
        backendEnabled: true,
        blockedReason: 'none' as const,
        message: 'Live reports are connected.',
      },
      async getReport() {
        return detail
      },
      streamReport() {
        return () => undefined
      },
    }

    renderAppRoutes({
      initialEntries: ['/reports/report-1002'],
      reportsClient,
    })

    expect(await screen.findByDisplayValue('Montelobos Mezcal')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Review' })).toBeDisabled()
  })

  it('hydrates review draft state from streamed records before processing becomes reviewable', async () => {
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
            type: 'record.inferred',
            data: {
              id: 'record-processing-2',
              bottleId: 'bottle-3',
              imageUrl: '/fixtures/report-bottle-clear.svg',
              bottleName: 'Montelobos Mezcal',
              category: 'Mezcal',
              upc: '618115630028',
              volumeMl: 750,
              fillPercent: 40,
              corrected: false,
              status: 'inferred',
              originalModelOutput: {
                bottleName: 'Montelobos Mezcal',
                fillPercent: 40,
              },
            },
          })
          onEvent({
            type: 'report.ready_for_review',
            data: {
              id: 'report-1001',
              status: 'unreviewed',
              photoCount: 3,
              processedCount: 3,
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

    expect(await screen.findByDisplayValue('Montelobos Mezcal')).toBeInTheDocument()
    expect(screen.getByText('Current match: Montelobos Mezcal.')).toBeInTheDocument()
  })
})
