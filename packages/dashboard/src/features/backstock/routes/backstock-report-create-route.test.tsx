import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createFixtureReportsClient } from '../../../lib/reports/client'
import { renderAppRoutes } from '../../../test/test-utils'

describe('Backstock report creation route', () => {
  it('links to the backstock route from the reports list header', async () => {
    renderAppRoutes({ initialEntries: ['/reports'] })

    expect(await screen.findByRole('link', { name: 'New Backstock Report' })).toHaveAttribute(
      'href',
      '/reports/backstock/new',
    )
  })

  it('supports a manual entry submission flow', async () => {
    const user = userEvent.setup()

    renderAppRoutes({ initialEntries: ['/reports/backstock/new'] })

    await user.click(await screen.findByRole('button', { name: 'Enter Manually' }))
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Backstock Location' }),
      'location-1',
    )
    await user.type(await screen.findByRole('textbox', { name: 'Product' }), 'tito')
    await user.click(await screen.findByRole('button', { name: /Tito's Handmade Vodka/i }))
    await user.clear(screen.getByRole('spinbutton', { name: /Full Bottles/i }))
    await user.type(screen.getByRole('spinbutton', { name: /Full Bottles/i }), '9')
    await user.click(screen.getByRole('button', { name: 'Submit Backstock Report' }))

    expect(await screen.findByRole('heading', { name: 'Backstock Report Submitted' })).toBeInTheDocument()
    expect(screen.getByText('Main Bar')).toBeInTheDocument()
    expect(screen.getByText("Tito's Handmade Vodka")).toBeInTheDocument()
    expect(within(screen.getByLabelText('Submitted line items')).getByText('9')).toBeInTheDocument()
  })

  it('generates a grouped draft from uploaded photos before submit', async () => {
    const user = userEvent.setup()

    renderAppRoutes({ initialEntries: ['/reports/backstock/new'] })

    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Backstock Location' }),
      'location-2',
    )
    await user.upload(await screen.findByLabelText('Choose Photos'), [
      new File(['a'], 'shelf-1.png', { type: 'image/png' }),
      new File(['b'], 'shelf-2.png', { type: 'image/png' }),
    ])
    await user.click(screen.getByRole('button', { name: 'Generate Draft' }))

    expect(await screen.findByDisplayValue("Tito's Handmade Vodka")).toBeInTheDocument()
    expect(screen.getByDisplayValue('12')).toBeInTheDocument()
    expect(screen.getByDisplayValue('6')).toBeInTheDocument()
    expect(screen.getByDisplayValue('4')).toBeInTheDocument()
  })

  it('restores an unfinished draft from session storage', async () => {
    const user = userEvent.setup()
    const firstRender = renderAppRoutes({ initialEntries: ['/reports/backstock/new'] })

    await user.click(await screen.findByRole('button', { name: 'Enter Manually' }))
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Backstock Location' }),
      'location-1',
    )
    await user.type(await screen.findByRole('textbox', { name: 'Product' }), 'espo')
    await user.click(await screen.findByRole('button', { name: /Espolòn Blanco/i }))
    await user.clear(screen.getByRole('spinbutton', { name: /Full Bottles/i }))
    await user.type(screen.getByRole('spinbutton', { name: /Full Bottles/i }), '8')

    firstRender.unmount()
    renderAppRoutes({ initialEntries: ['/reports/backstock/new'] })

    expect(await screen.findByText('Draft restored from this browser session.')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Backstock Location' })).toHaveValue('location-1')
    expect(screen.getByDisplayValue('Espolòn Blanco')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /Full Bottles/i })).toHaveValue(8)
  })

  it('requires regeneration when source photos change after a draft is generated', async () => {
    const user = userEvent.setup()

    renderAppRoutes({ initialEntries: ['/reports/backstock/new'] })

    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Backstock Location' }),
      'location-1',
    )
    await user.upload(await screen.findByLabelText('Choose Photos'), [
      new File(['a'], 'shelf-1.png', { type: 'image/png' }),
    ])
    await user.click(screen.getByRole('button', { name: 'Generate Draft' }))
    expect(await screen.findByDisplayValue("Tito's Handmade Vodka")).toBeInTheDocument()

    await user.upload(screen.getByLabelText('Choose Photos'), [
      new File(['b'], 'shelf-2.png', { type: 'image/png' }),
    ])

    expect(
      screen.getByText('Source photos changed. Regenerate the draft before submitting.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Backstock Report' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Regenerate Draft' })).toBeInTheDocument()
  })

  it('shows a retry state when backstock locations fail to load', async () => {
    const baseClient = createFixtureReportsClient()
    const user = userEvent.setup()
    let attempts = 0
    const reportsClient = {
      ...baseClient,
      listVenueLocations: vi.fn(async (venueId: string) => {
        attempts += 1

        if (attempts === 1) {
          throw new Error(`failed_to_load_${venueId}`)
        }

        return baseClient.listVenueLocations(venueId)
      }),
    }

    renderAppRoutes({
      initialEntries: ['/reports/backstock/new'],
      reportsClient,
    })

    expect(
      await screen.findByRole('heading', { name: 'Backstock Locations Unavailable' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Backstock locations could not be loaded right now. Try again in a moment.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('heading', { name: 'New Backstock Report' })).toBeInTheDocument()
    expect(attempts).toBe(2)
  })

  it('blocks live backstock loading until a venue id is configured', async () => {
    const listVenueLocations = vi.fn()

    renderAppRoutes({
      initialEntries: ['/reports/backstock/new'],
      reportsClient: {
        ...createFixtureReportsClient(),
        listVenueLocations,
        readiness: {
          backendEnabled: true,
          blockedReason: 'review_submission_requires_user_context',
          message: 'Review submission requires user context.',
        },
      },
    })

    expect(
      await screen.findByRole('heading', { name: 'Backstock Locations Unavailable' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Backstock locations need a configured venue context before live data can load here.',
      ),
    ).toBeInTheDocument()
    expect(listVenueLocations).not.toHaveBeenCalled()
  })
})
