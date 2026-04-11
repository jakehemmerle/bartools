/**
 * Client-side model types mirroring the backend Drizzle schema.
 * These represent the JSON shapes returned by the API, not the DB columns directly.
 * UUIDs come across as strings; timestamps as ISO 8601 strings.
 */

import type { ItemCategory, SessionStatus } from './enums';

export type User = {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
};

export type Venue = {
  id: string;
  name: string;
  createdAt: string;
};

export type VenueMember = {
  venueId: string;
  userId: string;
  joinedAt: string;
};

export type Location = {
  id: string;
  venueId: string;
  name: string;
  createdAt: string;
};

export type Bottle = {
  id: string;
  brand: string;
  product: string;
  category: ItemCategory;
  subcategory?: string;
  sizeMl?: number;
  vintage?: number;
  abv?: number;
  upc?: string;
  imageUrl?: string;
  createdAt: string;
};

export type Session = {
  id: string;
  userId: string;
  venueId: string;
  status: SessionStatus;
  photoCount: number;
  processedCount: number;
  startedAt: string;
  confirmedAt?: string;
};

export type Scan = {
  id: string;
  sessionId: string;
  userId: string;
  venueId: string;
  locationId?: string;
  bottleId?: string;
  photoUrl: string;
  vlmFillTenths?: number;
  confidenceScore?: number;
  rawResponse?: unknown;
  modelUsed?: string;
  latencyMs?: number;
  scannedAt: string;
};

export type InventoryItem = {
  id: string;
  locationId: string;
  bottleId: string;
  fillLevelTenths: number;
  lastScanId?: string;
  lastScannedAt?: string;
  notes?: string;
  addedAt: string;
};
