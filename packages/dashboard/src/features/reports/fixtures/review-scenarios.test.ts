import { describe, expect, it } from 'vitest'
import {
  reviewReportComparison,
  reviewReportCreated,
  reviewReportFailed,
  reviewReportProcessing,
  reviewReportsEmpty,
  reviewReportsList,
  reviewReportReviewed,
  reviewReportUnreviewed,
  searchReviewBottles,
} from './review-scenarios'

describe('review scenarios', () => {
  it('covers every lifecycle state needed for the approved screen family', () => {
    expect(reviewReportsEmpty).toEqual([])
    expect(reviewReportsList.some((report) => report.status === 'created')).toBe(true)
    expect(reviewReportsList.some((report) => report.status === 'processing')).toBe(true)
    expect(reviewReportsList.some((report) => report.status === 'unreviewed')).toBe(true)
    expect(reviewReportsList.some((report) => report.status === 'reviewed')).toBe(true)
  })

  it('keeps detail scenarios aligned to their intended screen states', () => {
    expect(reviewReportCreated.status).toBe('created')
    expect(reviewReportProcessing.status).toBe('processing')
    expect(reviewReportUnreviewed.status).toBe('unreviewed')
    expect(reviewReportReviewed.status).toBe('reviewed')
    expect(reviewReportComparison.status).toBe('reviewed')
    expect(reviewReportFailed.status).toBe('unreviewed')
  })

  it('keeps comparison and failed-emphasis scenarios structurally intentional', () => {
    expect(
      reviewReportComparison.bottleRecords.every(
        (record) => Boolean(record.correctedValues || record.originalModelOutput),
      ),
    ).toBe(true)

    expect(reviewReportFailed.bottleRecords).toHaveLength(3)
    expect(reviewReportFailed.bottleRecords.every((record) => record.status === 'failed')).toBe(
      true,
    )
    expect(reviewReportFailed.bottleRecords.every((record) => Boolean(record.errorMessage))).toBe(
      true,
    )
  })

  it('keeps the primary unreviewed scenario free of failed-emphasis drift', () => {
    expect(reviewReportUnreviewed.bottleRecords).toHaveLength(2)
    expect(reviewReportUnreviewed.bottleRecords.every((record) => record.status === 'inferred')).toBe(
      true,
    )
    expect(reviewReportUnreviewed.bottleRecords.some((record) => record.bottleName === "Maker's Mark")).toBe(
      true,
    )
  })

  it('keeps the processing scenario focused on inferred and pending rows only', () => {
    expect(
      reviewReportProcessing.bottleRecords.every(
        (record) => record.status === 'inferred' || record.status === 'pending',
      ),
    ).toBe(true)
    expect(reviewReportProcessing.bottleRecords.filter((record) => record.status === 'pending')).toHaveLength(2)
  })

  it('returns search results for a real bottle query', () => {
    expect(searchReviewBottles('espol')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Espolòn Blanco',
        }),
      ]),
    )
  })
})
