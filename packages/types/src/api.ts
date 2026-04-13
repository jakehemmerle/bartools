import type { ItemCategory, ReportRecordStatus, ReportStatus } from './enums';

export type ModelOutput = {
  bottleName?: string;
  category?: string;
  upc?: string;
  volumeMl?: number;
  fillPercent?: number;
};

export type ReportListItem = {
  id: string;
  startedAt?: string;
  completedAt?: string;
  userId?: string;
  userDisplayName?: string;
  bottleCount: number;
  status: ReportStatus;
};

export type ReportBottleRecord = {
  id: string;
  imageUrl: string;
  bottleName: string;
  category?: string;
  upc?: string;
  volumeMl?: number;
  fillPercent: number;
  corrected: boolean;
  status: ReportRecordStatus;
  errorCode?: string;
  errorMessage?: string;
  originalModelOutput?: ModelOutput;
  correctedValues?: ModelOutput;
};

export type ReportDetail = {
  id: string;
  startedAt?: string;
  completedAt?: string;
  userId?: string;
  userDisplayName?: string;
  status: ReportStatus;
  bottleRecords: ReportBottleRecord[];
};

export type ReportProgress = {
  id: string;
  status: ReportStatus;
  photoCount: number;
  processedCount: number;
};

export type ReportStreamState = {
  report: ReportProgress;
  records: ReportBottleRecord[];
};

export type BottleSearchResult = {
  id: string;
  name: string;
  category: ItemCategory;
  upc?: string;
  volumeMl?: number;
};

export type LocationListItem = {
  id: string;
  name: string;
  createdAt?: string;
};
