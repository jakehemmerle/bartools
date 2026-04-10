import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SettingsPage } from './settings-page'
import { renderWithProviders } from '../test/test-utils'

describe('SettingsPage', () => {
  it('lets managers update settings, overrides, invites, and access in fixture mode', () => {
    renderWithProviders(<SettingsPage />, {
      initialEntries: ['/settings'],
    })

    fireEvent.change(screen.getByLabelText('Timezone'), {
      target: { value: 'America/New_York' },
    })
    fireEvent.change(screen.getByLabelText('Default PAR'), {
      target: { value: '1750' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }))

    expect(
      screen.getByText(/Bar settings saved for America\/New_York/i),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search products'), {
      target: { value: 'Bulleit' },
    })
    fireEvent.change(screen.getByLabelText('PAR override for Bulleit Bourbon'), {
      target: { value: '4' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save override' }))

    expect(
      screen.getByText(/Bulleit Bourbon now uses an override PAR of 4 bottles/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Override')).toBeInTheDocument()

    const inviteInput = screen.getByLabelText('Latest invite link') as HTMLInputElement
    const firstInvite = inviteInput.value
    fireEvent.click(screen.getByRole('button', { name: 'Generate invite link' }))
    expect((screen.getByLabelText('Latest invite link') as HTMLInputElement).value).not.toBe(
      firstInvite,
    )

    const samRow = screen.getByText('Sam Ortiz').closest('tr')
    expect(samRow).not.toBeNull()
    fireEvent.click(
      within(samRow as HTMLTableRowElement).getByRole('button', {
        name: 'Grant manager',
      }),
    )

    expect(screen.getByText(/Sam Ortiz can now manage bar settings/i)).toBeInTheDocument()
    expect(within(samRow as HTMLTableRowElement).getByText('Manager')).toBeInTheDocument()
  })

  it('shows a restricted state for non-managers', () => {
    renderWithProviders(<SettingsPage />, {
      initialEntries: ['/settings?scenario=restricted'],
    })

    expect(
      screen.getByText('Manager permission required'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Save settings' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Generate invite link' }),
    ).toBeDisabled()
  })
})
