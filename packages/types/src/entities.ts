import type { ItemCategory, ReportStatus } from './enums';

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
  name: string;
  category: ItemCategory;
  subcategory?: string;
  sizeMl?: number;
  vintage?: number;
  abv?: number;
  upc?: string;
  imageUrl?: string;
  createdAt: string;
};

export type Report = {
  id: string;
  userId: string;
  venueId: string;
  locationId?: string;
  status: ReportStatus;
  photoCount: number;
  processedCount: number;
  startedAt: string;
  reviewedAt?: string;
};

export type Scan = {
  id: string;
  reportId: string;
  userId: string;
  venueId: string;
  locationId?: string;
  bottleId?: string;
  photoUrl: string;
  sortOrder: number;
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
