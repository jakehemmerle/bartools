import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InventoryPage } from './inventory-page'
import { renderWithProviders } from '../test/test-utils'

const csvMocks = vi.hoisted(() => ({
  buildInventoryExportCsv: vi.fn(() => 'inventory-csv'),
  createExportFilename: vi.fn(() => 'inventory-2026-04-10.csv'),
  downloadCsvFile: vi.fn(),
}))

vi.mock('../lib/export/csv', () => csvMocks)

describe('InventoryPage export', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports the filtered inventory rows currently on screen', () => {
    renderWithProviders(<InventoryPage />, {
      initialEntries: ['/inventory'],
    })

    fireEvent.change(screen.getByLabelText('Search by product name'), {
      target: { value: 'Espol' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))

    const exportCalls = (
      csvMocks.buildInventoryExportCsv as unknown as {
        mock: { calls: [Array<{ productName: string }>, string][] }
      }
    ).mock.calls
    const exportedRows = exportCalls[0]?.[0]

    expect(csvMocks.buildInventoryExportCsv).toHaveBeenCalledTimes(1)
    expect(exportedRows).toHaveLength(1)
    expect(exportedRows?.[0]?.productName).toBe('Espolòn Blanco')
    expect(csvMocks.downloadCsvFile).toHaveBeenCalledWith(
      'inventory-2026-04-10.csv',
      'inventory-csv',
    )
  })
})
