import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SettingsPage } from './settings-page'
import { renderWithProviders } from '../test/test-utils'

describe('SettingsPage', () => {
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
