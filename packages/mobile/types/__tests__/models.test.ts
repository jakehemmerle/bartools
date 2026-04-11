import { describe, it, expect } from 'bun:test';
import type {
  User,
  Venue,
  VenueMember,
  Location,
  Bottle,
  Session,
  Scan,
  InventoryItem,
} from '../models';

/**
 * Type-level tests: these verify that our model types compile correctly
 * and accept the shapes we expect from the backend API. If the backend
 * schema changes and these types drift, the tests will fail to compile.
 */

describe('model type shapes', () => {
  it('User accepts a valid user payload', () => {
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'bar@example.com',
      displayName: 'Test Bar',
      createdAt: '2026-04-10T00:00:00Z',
    };
    expect(user.id).toBeDefined();
    expect(user.email).toBe('bar@example.com');
    expect(user.displayName).toBe('Test Bar');
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
    expect(location.name).toBe('Main Bar');
    expect(venue.name).toBe('Verbena');
  });

  it('Bottle contains the full identification schema', () => {
    const bottle: Bottle = {
      id: 'bottle-1',
      brand: 'Johnnie Walker',
      product: 'Black Label',
      category: 'scotch',
      subcategory: 'blended',
      sizeMl: 750,
      vintage: 2020,
      abv: 40.0,
      upc: '088110110307',
      createdAt: '2026-04-10T00:00:00Z',
    };
    expect(bottle.brand).toBe('Johnnie Walker');
    expect(bottle.product).toBe('Black Label');
    expect(bottle.category).toBe('scotch');
    expect(bottle.sizeMl).toBe(750);
    expect(bottle.upc).toBe('088110110307');
  });

  it('Session tracks the batch processing lifecycle', () => {
    const session: Session = {
      id: 'session-1',
      userId: 'user-1',
      venueId: 'venue-1',
      status: 'processing',
      photoCount: 5,
      processedCount: 2,
      startedAt: '2026-04-10T00:00:00Z',
    };
    expect(session.status).toBe('processing');
    expect(session.photoCount).toBe(5);
    expect(session.processedCount).toBe(2);
    expect(session.confirmedAt).toBeUndefined();
  });

  it('Scan stores VLM results and links to session + bottle', () => {
    const scan: Scan = {
      id: 'scan-1',
      sessionId: 'session-1',
      userId: 'user-1',
      venueId: 'venue-1',
      locationId: 'loc-1',
      bottleId: 'bottle-1',
      photoUrl: 'https://storage.example.com/photos/scan-1.jpg',
      vlmFillTenths: 7,
      confidenceScore: 0.92,
      modelUsed: 'claude-sonnet-4-6',
      latencyMs: 1250,
      scannedAt: '2026-04-10T00:00:00Z',
    };
    expect(scan.sessionId).toBe('session-1');
    expect(scan.vlmFillTenths).toBe(7);
    expect(scan.confidenceScore).toBe(0.92);
    expect(scan.modelUsed).toBe('claude-sonnet-4-6');
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
    expect(item.locationId).toBe('loc-1');
    expect(item.bottleId).toBe('bottle-1');
    expect(item.fillLevelTenths).toBe(3);
    expect(item.lastScanId).toBe('scan-1');
  });

  it('VenueMember links users to venues', () => {
    const member: VenueMember = {
      venueId: 'venue-1',
      userId: 'user-1',
      joinedAt: '2026-04-10T00:00:00Z',
    };
    expect(member.venueId).toBe('venue-1');
    expect(member.userId).toBe('user-1');
    expect(member.joinedAt).toBeDefined();
  });
});
