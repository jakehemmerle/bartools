import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LowStockPage } from './low-stock-page'
import { renderWithProviders } from '../test/test-utils'

const csvMocks = vi.hoisted(() => ({
  buildLowStockExportCsv: vi.fn(() => 'low-stock-csv'),
  createExportFilename: vi.fn(() => 'low-stock-2026-04-10.csv'),
  downloadCsvFile: vi.fn(),
}))

vi.mock('../lib/export/csv', () => csvMocks)

describe('LowStockPage export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports the currently sorted low-stock queue', () => {
    renderWithProviders(<LowStockPage />, {
      initialEntries: ['/low-stock'],
    })

    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))

    const exportedRows = (csvMocks.buildLowStockExportCsv as any).mock.calls[0]?.[0] as
      | Array<{ productName: string }>
      | undefined

    expect(csvMocks.buildLowStockExportCsv).toHaveBeenCalledTimes(1)
    expect(exportedRows).toHaveLength(1)
    expect(exportedRows?.[0]?.productName).toBe('Espolòn Blanco')
    expect(csvMocks.downloadCsvFile).toHaveBeenCalledWith(
      'low-stock-2026-04-10.csv',
      'low-stock-csv',
    )
  })
})
