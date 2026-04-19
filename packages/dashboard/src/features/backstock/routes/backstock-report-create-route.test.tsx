import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFixtureReportsClient } from '../../../lib/reports/client'
import { renderAppRoutes } from '../../../test/test-utils'

afterEach(() => {
  window.sessionStorage.clear()
  vi.unstubAllEnvs()
})

describe('Backstock report creation route: core flows', () => {
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

  it('allows a generated draft to submit after every source photo is removed', async () => {
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

    await user.click(
      within(screen.getByLabelText('Selected source photos')).getByRole('button', {
        name: 'Remove',
      }),
    )

    expect(
      screen.queryByText('Source photos changed. Regenerate the draft before submitting.'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Backstock Report' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Submit Backstock Report' }))

    expect(
      await screen.findByRole('heading', { name: 'Backstock Report Submitted' }),
    ).toBeInTheDocument()
  })

  it('surfaces a calm message when product search fails', async () => {
    const baseClient = createFixtureReportsClient()
    const user = userEvent.setup()
    const reportsClient = {
      ...baseClient,
      searchBottles: vi.fn(async () => {
        throw new Error('search_unavailable')
      }),
    }

    renderAppRoutes({
      initialEntries: ['/reports/backstock/new'],
      reportsClient,
    })

    await user.click(await screen.findByRole('button', { name: 'Enter Manually' }))
    await user.type(await screen.findByRole('textbox', { name: 'Product' }), 'ti')

    expect(
      await screen.findByText('Product search is temporarily unavailable. Try again in a moment.'),
    ).toBeInTheDocument()
  })

})

describe('Backstock report creation route: resilience', () => {
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
})

describe('Live backstock route guards', () => {
  it('loads live backstock locations without requiring a configured venue id', async () => {
    const baseClient = createFixtureReportsClient()
    const listVenueLocations = vi.fn(async (venueId: string) => {
      void venueId
      return baseClient.listVenueLocations('venue-1')
    })

    renderAppRoutes({
      initialEntries: ['/reports/backstock/new'],
      reportsClient: {
        ...baseClient,
        listVenueLocations,
        readiness: {
          backendEnabled: true,
          blockedReason: 'none',
          message: 'Live reports are connected.',
        },
      },
    })

    expect(await screen.findByRole('heading', { name: 'New Backstock Report' })).toBeInTheDocument()
    expect(listVenueLocations).toHaveBeenCalledTimes(1)
  })

  it('keeps live-only backstock actions explicit about pending backend work', async () => {
    renderAppRoutes({
      initialEntries: ['/reports/backstock/new'],
      reportsClient: {
        ...createFixtureReportsClient(),
        readiness: {
          backendEnabled: true,
          blockedReason: 'none',
          message: 'Live reports are connected.',
        },
      },
    })

    expect(await screen.findByRole('combobox', { name: 'Backstock Location' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Live backstock creation is still waiting on backend support. Photo-generated drafts and final submission are not connected yet.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generation Pending' })).toBeDisabled()
    expect(
      screen.getByText(
        'Photo-generated drafts need backend uploads and grouping before they can run here.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submission Pending' })).toBeDisabled()
    expect(
      screen.getByText(
        'Live backstock submission needs a dedicated backend contract before it can be sent.',
      ),
    ).toBeInTheDocument()
  })
})
