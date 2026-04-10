import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAppRoutes } from '../test/test-utils'

describe('Sessions routes', () => {
  it('shows an empty state for the sessions history when no counts are present', () => {
    localStorage.setItem('bartools.dashboard.fixture-persona', 'manager')

    renderAppRoutes({
      initialEntries: ['/sessions?scenario=empty'],
    })

    expect(screen.getByText('No completed sessions yet')).toBeInTheDocument()
  })

  it('shows missing-media fallback without hiding the record details', () => {
    localStorage.setItem('bartools.dashboard.fixture-persona', 'manager')

    renderAppRoutes({
      initialEntries: ['/sessions/session-missing-media'],
    })

    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Campari' })).toBeInTheDocument()
    expect(screen.queryByText('Corrected values')).not.toBeInTheDocument()
  })

  it('shows correction comparison when model and saved values both exist', () => {
    localStorage.setItem('bartools.dashboard.fixture-persona', 'manager')

    renderAppRoutes({
      initialEntries: ['/sessions/session-1001'],
    })

    expect(screen.getByText('Corrected values')).toBeInTheDocument()
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })
})
