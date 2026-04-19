import { describe, it, expect } from 'bun:test';
import type {
  ModelOutput,
  ReportListItem,
  ReportBottleRecord,
  ReportDetail,
  ReportProgress,
  ReportStreamState,
  BottleSearchResult,
  LocationListItem,
} from '../api';

describe('API response type shapes', () => {
  it('ReportListItem matches listReports() shape', () => {
    const item: ReportListItem = {
      id: 'report-1',
      startedAt: '2026-04-10T00:00:00Z',
      completedAt: '2026-04-10T01:00:00Z',
      userId: 'user-1',
      userDisplayName: 'Jake',
      bottleCount: 12,
      photoCount: 12,
      processedCount: 12,
      status: 'reviewed',
    };
    expect(item.bottleCount).toBe(12);
    expect(item.status).toBe('reviewed');
  });

  it('ReportBottleRecord includes model output and corrections', () => {
    const modelOutput: ModelOutput = {
      bottleName: 'Maker\'s Mark',
      category: 'bourbon',
      fillPercent: 70,
    };
    const record: ReportBottleRecord = {
      id: 'rec-1',
      imageUrl: '/uploads/photo.jpg',
      bottleName: 'Maker\'s Mark',
      category: 'bourbon',
      fillPercent: 70,
      corrected: false,
      status: 'inferred',
      originalModelOutput: modelOutput,
    };
    expect(record.originalModelOutput?.bottleName).toBe('Maker\'s Mark');
    expect(record.correctedValues).toBeUndefined();
  });

  it('ReportDetail contains header + bottleRecords', () => {
    const detail: ReportDetail = {
      id: 'report-1',
      startedAt: '2026-04-10T00:00:00Z',
      status: 'unreviewed',
      bottleRecords: [
        {
          id: 'rec-1',
          imageUrl: '/uploads/photo.jpg',
          bottleName: 'Test Bottle',
          fillPercent: 50,
          corrected: false,
          status: 'inferred',
        },
      ],
    };
    expect(detail.bottleRecords.length).toBe(1);
    expect(detail.status).toBe('unreviewed');
  });

  it('ReportProgress tracks processing state', () => {
    const progress: ReportProgress = {
      id: 'report-1',
      status: 'processing',
      photoCount: 5,
      processedCount: 2,
    };
    expect(progress.processedCount).toBeLessThan(progress.photoCount);
  });

  it('ReportStreamState combines progress + records', () => {
    const state: ReportStreamState = {
      report: {
        id: 'report-1',
        status: 'processing',
        photoCount: 1,
        processedCount: 0,
      },
      records: [],
    };
    expect(state.report.status).toBe('processing');
    expect(state.records).toEqual([]);
  });

  it('BottleSearchResult matches searchBottles() shape', () => {
    const result: BottleSearchResult = {
      id: 'bottle-1',
      name: 'Hakushu 12Y',
      category: 'whiskey',
      upc: '4901777281585',
      volumeMl: 700,
    };
    expect(result.name).toBe('Hakushu 12Y');
  });

  it('LocationListItem matches listVenueLocations() shape', () => {
    const loc: LocationListItem = {
      id: 'loc-1',
      name: 'Main Bar',
      createdAt: '2026-04-10T00:00:00Z',
    };
    expect(loc.name).toBe('Main Bar');
  });
});
