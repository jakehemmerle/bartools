import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAppRoutes } from '../test/test-utils'

describe('review harness routes', () => {
  const reviewRoutes: Array<{
    name: string
    path: string
    assert: () => Promise<void>
  }> = [
    {
      name: 'entry route',
      path: '/__review/entry',
      assert: async () => {
        expect(await screen.findByRole('heading', { name: 'Reports Workbench' })).toBeInTheDocument()
      },
    },
    {
      name: 'reports list route',
      path: '/__review/reports/list',
      assert: async () => {
        expect(await screen.findByRole('heading', { level: 1, name: 'Reports' })).toBeInTheDocument()
        expect(screen.getByText('8b3c6b41')).toBeInTheDocument()
      },
    },
    {
      name: 'reports empty route',
      path: '/__review/reports/empty',
      assert: async () => {
        expect(await screen.findByRole('heading', { level: 1, name: 'Reports' })).toBeInTheDocument()
        expect(
          screen.getByText('No reports found. Recent reports will appear here once they are available.'),
        ).toBeInTheDocument()
      },
    },
    {
      name: 'created report route',
      path: '/__review/report/created',
      assert: async () => {
        expect(await screen.findByRole('heading', { name: 'Report 1d7b9e4f' })).toBeInTheDocument()
        expect(screen.getByText('This report has been created. Processing has not started yet.')).toBeInTheDocument()
      },
    },
    {
      name: 'processing report route',
      path: '/__review/report/processing',
      assert: async () => {
        expect(await screen.findByText('Progress')).toBeInTheDocument()
        expect(screen.getByText('4c8e5f2a')).toBeInTheDocument()
        expect(screen.queryByText(/Failed/i)).not.toBeInTheDocument()
        expect(screen.getAllByText('Processing...')).toHaveLength(2)
      },
    },
    {
      name: 'unreviewed report route',
      path: '/__review/report/unreviewed',
      assert: async () => {
        expect(
          await screen.findByRole('heading', {
            name: 'Report f47ac10b-52c1-4b72-91f1-3d9a184a7e93',
          }),
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Submit Review' })).toBeEnabled()
        expect(screen.queryByText('Failed')).not.toBeInTheDocument()
        expect(screen.queryByText(/Error Code:/i)).not.toBeInTheDocument()
      },
    },
    {
      name: 'reviewed report route',
      path: '/__review/report/reviewed',
      assert: async () => {
        expect(
          await screen.findByRole('heading', {
            name: 'Report 8b3c6b41-25f6-45ab-b0d7-13da62fbe098',
          }),
        ).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Submit Review' })).not.toBeInTheDocument()
        expect(screen.getAllByText(/Original Model Output/i).length).toBeGreaterThan(0)
        expect(screen.getAllByText(/Final Corrected Values/i).length).toBeGreaterThan(0)
      },
    },
    {
      name: 'comparison report route',
      path: '/__review/report/comparison',
      assert: async () => {
        expect(
          await screen.findByRole('heading', {
            name: 'Report 8b3c6b41-25f6-45ab-b0d7-13da62fbe098',
          }),
        ).toBeInTheDocument()
        expect(screen.getByText(/Original Model Output/i)).toBeInTheDocument()
        expect(screen.getByText(/Final Corrected Values/i)).toBeInTheDocument()
      },
    },
    {
      name: 'failed report route',
      path: '/__review/report/failed',
      assert: async () => {
        expect(
          await screen.findByRole('heading', {
            name: 'Report f47ac10b-52c1-4b72-91f1-3d9a184a7e93',
          }),
        ).toBeInTheDocument()
        expect(screen.getByText(/Error Code:\s*E-402/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Submit Review' })).toBeEnabled()
        expect(screen.queryByRole('button', { name: /Tito's Handmade Vodka/i })).not.toBeInTheDocument()
      },
    },
    {
      name: 'blocked report route',
      path: '/__review/report/blocked',
      assert: async () => {
        expect(await screen.findByRole('heading', { name: 'Access Unavailable' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Submit Review' })).toBeDisabled()
        expect(screen.getByRole('link', { name: 'Back to Reports' })).toBeInTheDocument()
      },
    },
    {
      name: 'not found report route',
      path: '/__review/report/not-found',
      assert: async () => {
        expect(await screen.findByRole('heading', { name: 'Report Not Found' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Back to Reports' })).toBeInTheDocument()
      },
    },
  ]

  it.each(reviewRoutes)('renders approved $name deterministically', async ({ path, assert }) => {
    renderAppRoutes({ initialEntries: [path] })
    await assert()
  })
})
