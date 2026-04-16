import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAppRoutes } from '../test/test-utils'

describe('review harness routes', () => {
  it('renders the empty reports review state deterministically', async () => {
    renderAppRoutes({ initialEntries: ['/__review/reports/empty'] })

    expect(await screen.findByRole('heading', { level: 1, name: 'Reports' })).toBeInTheDocument()
    expect(
      screen.getByText('No reports found. Recent reports will appear here once they are available.'),
    ).toBeInTheDocument()
  })

  it('renders the blocked report review state deterministically', async () => {
    renderAppRoutes({ initialEntries: ['/__review/report/blocked'] })

    expect(await screen.findByRole('heading', { name: 'Access Unavailable' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Review' })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Back to Reports' })).toBeInTheDocument()
  })
})
