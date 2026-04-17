import { describe, expect, it } from 'vitest'
import { baseReportsScenario } from './base-scenario'
import {
  applyReportStreamEvent,
  createReportStreamViewState,
} from './stream'

describe('report stream reducer', () => {
  it('applies record and progress events to detail state', () => {
    const initialState = createReportStreamViewState(baseReportsScenario.details['report-1001'])
    const inferredRecord = initialState.detail.bottleRecords[1]

    if (!inferredRecord) {
      throw new Error('Expected fixture report to include an inferred record candidate.')
    }

    const afterRecord = applyReportStreamEvent(initialState, {
      type: 'record.inferred',
      data: {
        ...inferredRecord,
        bottleName: 'Wild Turkey 101',
        category: 'Bourbon',
        upc: '072105900151',
        volumeMl: 1000,
        fillPercent: 40,
        corrected: false,
        status: 'inferred',
        originalModelOutput: {
          bottleName: 'Wild Turkey 101',
          fillPercent: 40,
        },
      },
    })

    const afterReady = applyReportStreamEvent(afterRecord, {
      type: 'report.ready_for_review',
      data: {
        id: 'report-1001',
        status: 'unreviewed',
        photoCount: 3,
        processedCount: 3,
      },
    })

    expect(afterRecord.detail.bottleRecords[1]?.status).toBe('inferred')
    expect(afterReady.detail.status).toBe('unreviewed')
    expect(afterReady.report.processedCount).toBe(3)
  })
})
