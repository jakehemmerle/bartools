import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LandingPage } from './auth-pages'
import { renderWithProviders } from '../test/test-utils'

describe('LandingPage', () => {
  it('uses product-facing copy instead of planning language', () => {
    renderWithProviders(<LandingPage />)

    expect(
      screen.getByRole('heading', {
        name: 'Track report progress and saved bottle records.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/web dashboard mvp/i),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/default signed-in view/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/warning badges/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument()
  })
})
