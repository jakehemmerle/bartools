import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  pgEnum,
  jsonb,
  index,
  primaryKey,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ───────────────────────────────────────────────────────────

// Item categories. Spirits are flat (bourbon/rye/scotch/shochu live alongside
// whiskey) because that's how Verbena's spreadsheet treats them and how bar
// staff actually think about pour categories. Non-spirits and bar consumables
// share the same shelf concept, so they live in one enum.
export const itemCategoryEnum = pgEnum('item_category', [
  // spirits
  'whiskey',
  'bourbon',
  'rye',
  'scotch',
  'shochu',
  'vodka',
  'gin',
  'rum',
  'tequila',
  'mezcal',
  'brandy',
  'cognac',
  'liqueur',
  'amaro',
  'vermouth',
  // not spirits but on the same shelf
  'wine',
  'beer',
  // bar consumables
  'bitters',
  'syrup',
  'mixer',
  'juice',
  'puree',
  'garnish',
  // catch-all
  'other',
  'n/a',
]);

export const reportStatusEnum = pgEnum('report_status', [
  'created', // report created, user may still be taking photos
  'processing', // batch submitted, VLM processing in progress
  'unreviewed', // results returned, awaiting user review
  'reviewed', // user reviewed all records; report is final
]);

// Fill levels are stored as integers in tenths (0..10 → 0%..100% in 10% steps).
// No PG enum — application-level validation enforces the range.

export const reportRecordStatusEnum = pgEnum('report_record_status', [
  'pending',
  'inferred',
  'failed',
  'reviewed',
]);

export const inferenceJobStatusEnum = pgEnum('inference_job_status', [
  'queued',
  'running',
  'succeeded',
  'failed',
]);

// ─── Users ───────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Venues (top-level abstraction) ──────────────────────────────────
// A venue is the establishment (bar, restaurant, hotel pool bar, etc.).
// Many users can be members of one venue; many venues can be tracked by one
// user. Membership is a join table; all members share the same permissions
// for now (no role column).

export const venues = pgTable('venues', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const venueMembers = pgTable(
  'venue_members',
  {
    venueId: uuid('venue_id')
      .notNull()
      .references(() => venues.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.venueId, table.userId] }),
    index('venue_members_user_idx').on(table.userId),
  ]
);

// ─── Locations (sub-areas within a venue) ────────────────────────────
// e.g. "Main Bar", "Pool Bar", "Liquor Room", "Cooler", "Backstock". Free-text
// name so any venue can model its own physical layout. Unique per venue so the
// same venue can't have two locations with the same name.

export const locations = pgTable(
  'locations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    venueId: uuid('venue_id')
      .notNull()
      .references(() => venues.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('locations_venue_name_uniq').on(table.venueId, table.name),
    index('locations_venue_idx').on(table.venueId),
  ]
);

// ─── Bottles (the canonical bottle, not a specific instance) ─────────

export const bottles = pgTable(
  'bottles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(), // e.g. "Johnnie Walker Black Label"
    category: itemCategoryEnum('category').notNull(),
    subcategory: text('subcategory'), // free text, e.g. "single malt", "reposado", "IPA"
    sizeMl: integer('size_ml'), // e.g. 750
    vintage: integer('vintage'), // e.g. 2020
    abv: numeric('abv', { precision: 4, scale: 1 }), // e.g. 40.0
    upc: text('upc').unique(), // barcode if known; nullable for unmatched bottles
    imageUrl: text('image_url'), // reference product image; assumes object storage.
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('bottles_name_uniq').on(table.name),
    index('bottles_category_idx').on(table.category),
  ]
);

// ─── Reports ────────────────────────────────────────────────────────
// A report groups scans from a single inventory count at a specific location.
// 1. Batch processing — the SSE stream returns results for all scans in a report
// 2. Review UX — the ScrollView shows all bottles from one report for confirmation
// 3. Historical tracking — "inventory checks over time" for trend analysis (stretch)
// Human-readable ID: derive from UUID prefix at the app layer — id.slice(0, 8).toUpperCase()

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    venueId: uuid('venue_id').notNull().references(() => venues.id),
    locationId: uuid('location_id').references(() => locations.id),
    status: reportStatusEnum('status').notNull().default('created'),
    photoCount: integer('photo_count').default(0), // total photos in batch
    processedCount: integer('processed_count').default(0), // how many VLM results returned so far
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }), // null until user reviews
  },
  (table) => [
    index('reports_user_idx').on(table.userId),
    index('reports_venue_idx').on(table.venueId),
    index('reports_location_idx').on(table.locationId),
    index('reports_status_idx').on(table.status),
    index('reports_started_at_idx').on(table.startedAt),
  ]
);

// ─── Scans (each time a user photographs a bottle) ──────────────────

export const scans = pgTable(
  'scans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id').notNull().references(() => reports.id),
    userId: uuid('user_id').notNull().references(() => users.id),
    venueId: uuid('venue_id').notNull().references(() => venues.id),
    locationId: uuid('location_id').references(() => locations.id), // which sub-area was being counted
    bottleId: uuid('bottle_id').references(() => bottles.id), // null if unrecognized
    photoGcsBucket: text('photo_gcs_bucket').notNull(),
    photoGcsObject: text('photo_gcs_object').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    vlmFillTenths: integer('vlm_fill_tenths'), // 0..10, the VLM's fill estimate at scan time
    confidenceScore: numeric('confidence_score', { precision: 4, scale: 3 }), // 0.000–1.000
    rawResponse: jsonb('raw_response'), // full LLM response for debugging
    modelUsed: text('model_used'), // e.g. "claude-sonnet-4-6" or "claude-haiku-4-5"
    latencyMs: integer('latency_ms'), // API round-trip time
    scannedAt: timestamp('scanned_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('scans_report_idx').on(table.reportId),
    index('scans_user_idx').on(table.userId),
    index('scans_venue_idx').on(table.venueId),
    index('scans_location_idx').on(table.locationId),
    index('scans_bottle_idx').on(table.bottleId),
    index('scans_scanned_at_idx').on(table.scannedAt),
  ]
);

// ─── Report records (review-layer view over scans) ──────────────────
// One row per uploaded photo after a report is submitted. This separates:
// 1. raw capture (`scans`)
// 2. model output (`original_*`)
// 3. reviewed final output (`corrected_*`)

export const reportRecords = pgTable(
  'report_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    scanId: uuid('scan_id')
      .notNull()
      .references(() => scans.id, { onDelete: 'cascade' }),
    status: reportRecordStatusEnum('status').notNull().default('pending'),
    originalBottleId: uuid('original_bottle_id').references(() => bottles.id),
    originalBottleName: text('original_bottle_name'),
    originalCategory: itemCategoryEnum('original_category'),
    originalUpc: text('original_upc'),
    originalVolumeMl: integer('original_volume_ml'),
    originalFillTenths: integer('original_fill_tenths'),
    originalConfidenceScore: numeric('original_confidence_score', {
      precision: 4,
      scale: 3,
    }),
    correctedBottleId: uuid('corrected_bottle_id').references(() => bottles.id),
    correctedBottleName: text('corrected_bottle_name'),
    correctedCategory: itemCategoryEnum('corrected_category'),
    correctedUpc: text('corrected_upc'),
    correctedVolumeMl: integer('corrected_volume_ml'),
    correctedFillTenths: integer('corrected_fill_tenths'),
    correctedByUserId: uuid('corrected_by_user_id').references(() => users.id),
    errorCode: text('error_code'),
    errorMessage: text('error_message'),
    inferredAt: timestamp('inferred_at', { withTimezone: true }),
    correctedAt: timestamp('corrected_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('report_records_scan_uniq').on(table.scanId),
    index('report_records_report_idx').on(table.reportId),
    index('report_records_status_idx').on(table.status),
  ]
);

// ─── Inference queue bookkeeping ────────────────────────────────────

export const inferenceJobs = pgTable(
  'inference_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    scanId: uuid('scan_id')
      .notNull()
      .references(() => scans.id, { onDelete: 'cascade' }),
    status: inferenceJobStatusEnum('status').notNull().default('queued'),
    provider: text('provider').notNull().default('anthropic'),
    jobKey: text('job_key').notNull().unique(),
    queuedAt: timestamp('queued_at', { withTimezone: true }).defaultNow().notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    lastErrorCode: text('last_error_code'),
    lastErrorMessage: text('last_error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('inference_jobs_scan_uniq').on(table.scanId),
    index('inference_jobs_report_idx').on(table.reportId),
    index('inference_jobs_status_idx').on(table.status),
  ]
);

export const inferenceAttempts = pgTable(
  'inference_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id')
      .notNull()
      .references(() => inferenceJobs.id, { onDelete: 'cascade' }),
    attemptNumber: integer('attempt_number').notNull(),
    modelUsed: text('model_used'),
    promptName: text('prompt_name').notNull(),
    promptSource: text('prompt_source').notNull().default('langsmith'),
    promptResolvedVersion: text('prompt_resolved_version'),
    latencyMs: integer('latency_ms'),
    confidenceScore: numeric('confidence_score', { precision: 4, scale: 3 }),
    rawResponse: jsonb('raw_response'),
    errorCode: text('error_code'),
    errorMessage: text('error_message'),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
  },
  (table) => [
    unique('inference_attempts_job_attempt_uniq').on(table.jobId, table.attemptNumber),
    index('inference_attempts_job_idx').on(table.jobId),
  ]
);

// ─── Inventory (the current state of a bottle in a location) ─────────
// Keyed on (location_id, bottle_id). One row per (location, bottle) — if the
// bar wants to track multiple physical bottles of the same product in the
// same location, that's a future qty column. For now, fill_level_tenths
// represents the aggregate fill of that product at that location.

export const inventory = pgTable(
  'inventory',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    locationId: uuid('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' }),
    bottleId: uuid('bottle_id').notNull().references(() => bottles.id),
    fillLevelTenths: integer('fill_level_tenths').notNull(), // 0..10
    lastScanId: uuid('last_scan_id').references(() => scans.id),
    lastScannedAt: timestamp('last_scanned_at', { withTimezone: true }),
    notes: text('notes'),
    addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('inventory_location_bottle_uniq').on(table.locationId, table.bottleId),
    index('inventory_location_idx').on(table.locationId),
    index('inventory_bottle_idx').on(table.bottleId),
  ]
);

// ─── Relations ───────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  venueMemberships: many(venueMembers),
  reports: many(reports),
  scans: many(scans),
  correctedReportRecords: many(reportRecords),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  members: many(venueMembers),
  locations: many(locations),
  reports: many(reports),
  scans: many(scans),
}));

export const venueMembersRelations = relations(venueMembers, ({ one }) => ({
  venue: one(venues, { fields: [venueMembers.venueId], references: [venues.id] }),
  user: one(users, { fields: [venueMembers.userId], references: [users.id] }),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  venue: one(venues, { fields: [locations.venueId], references: [venues.id] }),
  reports: many(reports),
  inventory: many(inventory),
  scans: many(scans),
}));

export const bottlesRelations = relations(bottles, ({ many }) => ({
  scans: many(scans),
  inventoryItems: many(inventory),
  originalReportRecords: many(reportRecords, {
    relationName: 'report_record_original_bottle',
  }),
  correctedReportRecords: many(reportRecords, {
    relationName: 'report_record_corrected_bottle',
  }),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  user: one(users, { fields: [reports.userId], references: [users.id] }),
  venue: one(venues, { fields: [reports.venueId], references: [venues.id] }),
  location: one(locations, { fields: [reports.locationId], references: [locations.id] }),
  scans: many(scans),
  records: many(reportRecords),
  inferenceJobs: many(inferenceJobs),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  report: one(reports, { fields: [scans.reportId], references: [reports.id] }),
  user: one(users, { fields: [scans.userId], references: [users.id] }),
  venue: one(venues, { fields: [scans.venueId], references: [venues.id] }),
  location: one(locations, { fields: [scans.locationId], references: [locations.id] }),
  bottle: one(bottles, { fields: [scans.bottleId], references: [bottles.id] }),
  record: one(reportRecords, { fields: [scans.id], references: [reportRecords.scanId] }),
  inferenceJob: one(inferenceJobs, { fields: [scans.id], references: [inferenceJobs.scanId] }),
}));

export const reportRecordsRelations = relations(reportRecords, ({ one }) => ({
  report: one(reports, { fields: [reportRecords.reportId], references: [reports.id] }),
  scan: one(scans, { fields: [reportRecords.scanId], references: [scans.id] }),
  originalBottle: one(bottles, {
    relationName: 'report_record_original_bottle',
    fields: [reportRecords.originalBottleId],
    references: [bottles.id],
  }),
  correctedBottle: one(bottles, {
    relationName: 'report_record_corrected_bottle',
    fields: [reportRecords.correctedBottleId],
    references: [bottles.id],
  }),
  correctedByUser: one(users, {
    fields: [reportRecords.correctedByUserId],
    references: [users.id],
  }),
}));

export const inferenceJobsRelations = relations(inferenceJobs, ({ one, many }) => ({
  report: one(reports, { fields: [inferenceJobs.reportId], references: [reports.id] }),
  scan: one(scans, { fields: [inferenceJobs.scanId], references: [scans.id] }),
  attempts: many(inferenceAttempts),
}));

export const inferenceAttemptsRelations = relations(inferenceAttempts, ({ one }) => ({
  job: one(inferenceJobs, {
    fields: [inferenceAttempts.jobId],
    references: [inferenceJobs.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  location: one(locations, { fields: [inventory.locationId], references: [locations.id] }),
  bottle: one(bottles, { fields: [inventory.bottleId], references: [bottles.id] }),
  lastScan: one(scans, { fields: [inventory.lastScanId], references: [scans.id] }),
}));
