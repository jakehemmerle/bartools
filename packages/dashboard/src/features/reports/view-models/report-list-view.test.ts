import { describe, expect, it } from 'vitest'
import { makeReportListItem } from '../../../lib/fixtures/builders'
import { buildReportListRows } from './report-list-view'

describe('report list view model', () => {
  it('maps backend location and progress fields into rendered row copy', () => {
    const [row] = buildReportListRows([
      makeReportListItem({
        id: 'report-2001',
        locationName: 'Cellar Bar',
        bottleCount: 14,
        photoCount: 16,
        processedCount: 11,
      }),
    ])

    expect(row).toMatchObject({
      id: 'report-2001',
      location: 'Cellar Bar',
      progressLabel: '11 / 16 photos',
      bottleCountLabel: '14 bottles',
    })
  })

  it('uses a calm fallback when the backend does not provide a location name', () => {
    const [row] = buildReportListRows([
      makeReportListItem({
        id: 'report-2002',
        locationName: undefined,
        bottleCount: 1,
        photoCount: 1,
        processedCount: 0,
      }),
    ])

    expect(row.location).toBe('Location not set')
    expect(row.bottleCountLabel).toBe('1 bottle')
  })
})
