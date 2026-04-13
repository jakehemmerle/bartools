import { describe, expect, it } from 'vitest'
import { makeInventoryRow } from '../fixtures/builders'
import {
  buildInventoryExportCsv,
  buildLowStockExportCsv,
  createExportFilename,
} from './csv'

describe('csv export helpers', () => {
  it('builds inventory csv with stable headers and escaped values', () => {
    const csv = buildInventoryExportCsv(
      [
        makeInventoryRow({
          productName: 'Tito’s Handmade Vodka',
          category: 'Vodka',
          upc: '111',
          displayQuantityLabel: '2.4 bottles',
          parComparableAmount: 1500,
          comparableUnit: 'ml',
          volumeMl: 750,
          latestReportId: 'report-1001',
        }),
        makeInventoryRow({
          productId: 'campari',
          productName: 'Campari, Apertivo',
          category: 'Aperitif',
          upc: '333',
          onHandComparableAmount: 350,
          displayQuantityLabel: '0.4 bottles',
          parComparableAmount: 1500,
          belowPar: true,
          asOf: '2026-03-18T19:02:00-05:00',
        }),
      ],
      'America/Chicago',
    )

    expect(csv).toContain(
      'Product name,Category,UPC,On-hand quantity,PAR level,Below par status,As of date,Volume (ml),Latest report id',
    )
    expect(csv).toContain(
      'Tito’s Handmade Vodka,Vodka,111,2.4 bottles,1500 ml,In range,2026-04-09 22:15,750,report-1001',
    )
    expect(csv).toContain(
      '"Campari, Apertivo",Aperitif,333,0.4 bottles,1500 ml,Below par,2026-03-18 19:02,750,report-1001',
    )
  })

  it('builds low-stock csv with reason column', () => {
    const csv = buildLowStockExportCsv(
      [
        makeInventoryRow({
          productId: 'tequila',
          productName: 'Espolòn Blanco',
          category: 'Tequila',
          upc: '222',
          displayQuantityLabel: '1.2 bottles',
          parComparableAmount: 1500,
          belowPar: true,
          belowParReason: 'Below PAR by 600 ml',
          latestReportId: 'report-1000',
        }),
      ],
      'America/Chicago',
    )

    expect(csv).toContain(
      'Product name,Category,UPC,On-hand quantity,PAR level,Below par reason,As of date,Volume (ml),Latest report id',
    )
    expect(csv).toContain(
      'Espolòn Blanco,Tequila,222,1.2 bottles,1500 ml,Below PAR by 600 ml,2026-04-09 22:15,750,report-1000',
    )
  })

  it('creates stable filenames in the bar timezone', () => {
    expect(
      createExportFilename(
        'inventory',
        'America/Chicago',
        new Date('2026-04-10T02:30:00Z'),
      ),
    ).toBe('inventory-2026-04-09.csv')
  })
})
