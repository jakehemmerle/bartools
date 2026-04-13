import { describe, it, expect } from 'bun:test';
import type {
  User,
  Venue,
  VenueMember,
  Location,
  Bottle,
  Report,
  Scan,
  InventoryItem,
} from '../entities';

describe('entity type shapes', () => {
  it('User accepts a valid payload', () => {
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'bar@example.com',
      displayName: 'Test User',
      createdAt: '2026-04-10T00:00:00Z',
    };
    expect(user.id).toBeDefined();
    expect(user.email).toBe('bar@example.com');
    expect(user.displayName).toBe('Test User');
  });

  it('Venue and Location form a parent-child relationship', () => {
    const venue: Venue = {
      id: 'venue-1',
      name: 'Verbena',
      createdAt: '2026-04-10T00:00:00Z',
    };
    const location: Location = {
      id: 'loc-1',
      venueId: venue.id,
      name: 'Main Bar',
      createdAt: '2026-04-10T00:00:00Z',
    };
    expect(location.venueId).toBe(venue.id);
  });

  it('VenueMember links users to venues', () => {
    const member: VenueMember = {
      venueId: 'venue-1',
      userId: 'user-1',
      joinedAt: '2026-04-10T00:00:00Z',
    };
    expect(member.venueId).toBe('venue-1');
    expect(member.userId).toBe('user-1');
  });

  it('Bottle uses a single name field', () => {
    const bottle: Bottle = {
      id: 'bottle-1',
      name: 'Johnnie Walker Black Label',
      category: 'scotch',
      sizeMl: 750,
      abv: 40.0,
      upc: '088110110307',
      createdAt: '2026-04-10T00:00:00Z',
    };
    expect(bottle.name).toBe('Johnnie Walker Black Label');
    expect(bottle.category).toBe('scotch');
  });

  it('Report tracks the batch processing lifecycle', () => {
    const report: Report = {
      id: 'report-1',
      userId: 'user-1',
      venueId: 'venue-1',
      status: 'processing',
      photoCount: 5,
      processedCount: 2,
      startedAt: '2026-04-10T00:00:00Z',
    };
    expect(report.status).toBe('processing');
    expect(report.photoCount).toBe(5);
    expect(report.reviewedAt).toBeUndefined();
  });

  it('Scan references reportId and stores VLM results', () => {
    const scan: Scan = {
      id: 'scan-1',
      reportId: 'report-1',
      userId: 'user-1',
      venueId: 'venue-1',
      photoUrl: 'https://storage.example.com/photos/scan-1.jpg',
      sortOrder: 0,
      vlmFillTenths: 7,
      confidenceScore: 0.92,
      modelUsed: 'claude-sonnet-4-6',
      latencyMs: 1250,
      scannedAt: '2026-04-10T00:00:00Z',
    };
    expect(scan.reportId).toBe('report-1');
    expect(scan.vlmFillTenths).toBe(7);
  });

  it('InventoryItem is keyed by location + bottle', () => {
    const item: InventoryItem = {
      id: 'inv-1',
      locationId: 'loc-1',
      bottleId: 'bottle-1',
      fillLevelTenths: 3,
      lastScanId: 'scan-1',
      lastScannedAt: '2026-04-10T00:00:00Z',
      addedAt: '2026-04-10T00:00:00Z',
    };
    expect(item.fillLevelTenths).toBe(3);
    expect(item.locationId).toBe('loc-1');
  });
});
