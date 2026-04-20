import type { ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { ReportBottleRecord, ReportDetail } from '@bartools/types'
import { AppProviders } from '../../../app/providers'
import { createFixtureReportsClient, type ReportsClient } from '../../../lib/reports/client'
import { RecordMedia } from './report-record-media'
import { ProcessingRecord } from './report-processing-record'

const baseRecord: ReportBottleRecord = {
  id: 'record-1',
  bottleId: 'bottle-1',
  imageUrl: 'https://example.com/original.jpg',
  bottleName: 'Orphan Barrel Fanged Pursuit',
  category: 'bourbon',
  volumeMl: 750,
  fillPercent: 50,
  corrected: false,
  status: 'inferred',
}

describe('RecordMedia', () => {
  it('opens the full image in a new tab when media is available', () => {
    renderWithRoute(<RecordMedia record={baseRecord} />, {
      initialEntries: ['/reports/report-123'],
      routePath: '/reports/:reportId',
    })

    expect(
      screen.getByRole('link', { name: /Open Orphan Barrel Fanged Pursuit image in a new tab/i }),
    ).toHaveAttribute('href', 'https://example.com/original.jpg')
    expect(
      screen.getByRole('link', { name: /Open Orphan Barrel Fanged Pursuit image in a new tab/i }),
    ).toHaveAttribute('target', '_blank')
  })

  it('shows the calm fallback when the image request fails outside a live report route', () => {
    renderWithRoute(<RecordMedia record={baseRecord} />, {
      initialEntries: ['/__review/report/unreviewed'],
      routePath: '/__review/report/unreviewed',
    })

    fireEvent.error(screen.getByRole('img', { name: /Orphan Barrel Fanged Pursuit/i }))

    expect(screen.getByText('Image unavailable')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Orphan Barrel Fanged Pursuit/i })).not.toBeInTheDocument()
  })

  it('requests one fresh signed url before giving up on a live report route', async () => {
    const getReport = vi.fn(async () => buildDetail('https://example.com/refreshed.jpg'))
    const reportsClient = buildReportsClient({ getReport })

    renderWithRoute(<RecordMedia record={baseRecord} />, {
      initialEntries: ['/reports/report-123'],
      reportsClient,
      routePath: '/reports/:reportId',
    })

    fireEvent.error(screen.getByRole('img', { name: /Orphan Barrel Fanged Pursuit/i }))

    await waitFor(() => {
      expect(getReport).toHaveBeenCalledWith('report-123')
      expect(screen.getByRole('img', { name: /Orphan Barrel Fanged Pursuit/i })).toHaveAttribute(
        'src',
        'https://example.com/refreshed.jpg',
      )
    })
  })
})

describe('ProcessingRecord', () => {
  it('opens the full image in a new tab when media is available', () => {
    renderWithRoute(<ProcessingRecord record={baseRecord} />, {
      initialEntries: ['/reports/report-123'],
      routePath: '/reports/:reportId',
    })

    expect(
      screen.getByRole('link', { name: /Open Orphan Barrel Fanged Pursuit image in a new tab/i }),
    ).toHaveAttribute('href', 'https://example.com/original.jpg')
  })

  it('falls back to the processing placeholder when an image request fails', () => {
    renderWithRoute(<ProcessingRecord record={baseRecord} />, {
      initialEntries: ['/reports/report-123'],
      routePath: '/reports/:reportId',
    })

    fireEvent.error(screen.getByRole('img', { name: /Orphan Barrel Fanged Pursuit/i }))

    expect(screen.getByText('◻')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Orphan Barrel Fanged Pursuit/i })).not.toBeInTheDocument()
  })
})

function renderWithRoute(
  element: ReactNode,
  {
    initialEntries,
    reportsClient,
    routePath,
  }: {
    initialEntries: string[]
    reportsClient?: ReportsClient
    routePath: string
  },
) {
  const router = createMemoryRouter([{ path: routePath, element }], { initialEntries })

  return render(
    <AppProviders reportsClient={reportsClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}

function buildReportsClient(overrides?: Partial<ReportsClient>): ReportsClient {
  const client = createFixtureReportsClient()

  return {
    ...client,
    ...overrides,
  }
}

function buildDetail(imageUrl: string): ReportDetail {
  return {
    id: 'report-123',
    status: 'unreviewed',
    bottleRecords: [{ ...baseRecord, imageUrl }],
  }
}
