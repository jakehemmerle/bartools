import { pgTable, uuid, text, timestamp, numeric, integer, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ───────────────────────────────────────────────────────────

export const fillLevelEnum = pgEnum('fill_level', [
  'full',
  'three_quarters',
  'half',
  'quarter',
//   'nearly_empty', // could be added later if necessary, but I'm not confident it'll be identified reliably yet
  'empty',
]);

export const spiritCategoryEnum = pgEnum('spirit_category', [
  'whiskey',
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
//   'beer', // could be a stretch goal, but I doubt it since people don't put beer cans on shelves
  'wine',
  'other', // maybe useful for novelty spirits like mead or other non-spirit categories
]);

// ─── Users ───────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'), // Bar name or user name?
  //   zipCode: text('zip_code'), // for reorder alerts or local prices? Post MVP and can live on either users or bars.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Bars ────────────────────────────────────────────────────────────

export const bars = pgTable('bars', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  //   zipCode: text('zip_code'), // for reorder alerts or local prices? Post MVP.
  userId: uuid('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Bottles (the canonical bottle, not a specific instance) ─────────

export const bottles = pgTable('bottles', {
  id: uuid('id').primaryKey().defaultRandom(),
  brand: text('brand').notNull(),                    // e.g. "Johnnie Walker"
  product: text('product').notNull(),                // e.g. "Black Label"
  category: spiritCategoryEnum('category').notNull(),
  subcategory: text('subcategory'),                  // e.g. "Scotch", "Bourbon", "Reposado"; need to decide if open text or enum.
  sizeMl: integer('size_ml'),                        // e.g. 750
  vintage: integer('vintage'),                        // e.g. 2020
  abv: numeric('abv', { precision: 4, scale: 1 }),   // e.g. 40.0
  upc: text('upc').unique(),                         // barcode if known
  imageUrl: text('image_url'),                       // reference product image; assumes S3 or R2 storage.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('bottles_brand_idx').on(table.brand),
  index('bottles_category_idx').on(table.category),
]);

// ─── Sessions ───────────────────────────────────────────────────────
// A session groups scans from a single inventory count. This serves three purposes:
// 1. Batch processing — the SSE stream returns results for all scans in a session
// 2. Review UX — the ScrollView shows all bottles from one session for confirmation
// 3. Historical tracking — "inventory checks over time" for trend analysis (stretch)

export const sessionStatusEnum = pgEnum('session_status', [
  'capturing',   // user is still taking photos
  'processing',  // batch submitted, VLM processing in progress
  'reviewing',   // results returned, user is reviewing/correcting
  'confirmed',   // user confirmed all results, inventory updated
]);

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  barId: uuid('bar_id').notNull().references(() => bars.id),
  status: sessionStatusEnum('status').notNull().default('capturing'),
  photoCount: integer('photo_count').default(0),         // total photos in batch
  processedCount: integer('processed_count').default(0), // how many VLM results returned so far
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }), // null until user confirms
}, (table) => [
  index('sessions_user_idx').on(table.userId),
  index('sessions_bar_idx').on(table.barId),
  index('sessions_status_idx').on(table.status),         // find active/processing sessions quickly
  index('sessions_started_at_idx').on(table.startedAt),  // chronological session history
]);

// ─── Scans (each time a user photographs a bottle) ──────────────────

export const scans = pgTable('scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => sessions.id), // ties scan to its batch session
  userId: uuid('user_id').notNull().references(() => users.id),
  barId: uuid('bar_id').notNull().references(() => bars.id),
  bottleId: uuid('bottle_id').references(() => bottles.id),  // null if unrecognized
  photoUrl: text('photo_url').notNull(),
  vlmFillLevel: fillLevelEnum('vlm_fill_level'),      // coarse VLM estimate (enum bucket)
  userFillLevel: integer('user_fill_level'),           // fine-grained user correction 0-100%; null if user accepted VLM estimate without adjustment. Each correction is SME-annotated training data.
  confidenceScore: numeric('confidence_score', { precision: 4, scale: 3 }), // 0.000–1.000
  rawResponse: jsonb('raw_response'),               // full LLM response for debugging
  modelUsed: text('model_used'),                     // e.g. "gemini-2.0-flash"
  latencyMs: integer('latency_ms'),                  // API round-trip time
  scannedAt: timestamp('scanned_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('scans_session_idx').on(table.sessionId),  // all scans in a batch
  index('scans_user_idx').on(table.userId),
  index('scans_bar_idx').on(table.barId),
  index('scans_bottle_idx').on(table.bottleId),
  index('scans_scanned_at_idx').on(table.scannedAt),
]);

// ─── Inventory (a user's collection of bottles with current levels) ──

export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  barId: uuid('bar_id').notNull().references(() => bars.id),
  backstockQuantity: integer('backstock_quantity'), // how many bottles are in the back?
  bottleId: uuid('bottle_id').notNull().references(() => bottles.id),
  currentFillLevel: fillLevelEnum('current_fill_level').notNull(),
  lastScannedAt: timestamp('last_scanned_at', { withTimezone: true }),
  lastScanId: uuid('last_scan_id').references(() => scans.id),
  notes: text('notes'),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('inventory_user_idx').on(table.userId),
]);

// ─── Relations ───────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  bars: many(bars),
  sessions: many(sessions),
  scans: many(scans),
  inventory: many(inventory),
}));

export const barsRelations = relations(bars, ({ many }) => ({
  sessions: many(sessions),
  inventory: many(inventory),
  scans: many(scans),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  bar: one(bars, { fields: [sessions.barId], references: [bars.id] }),
  scans: many(scans),
}));

export const bottlesRelations = relations(bottles, ({ many }) => ({
  scans: many(scans),
  inventoryItems: many(inventory),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  session: one(sessions, { fields: [scans.sessionId], references: [sessions.id] }),
  user: one(users, { fields: [scans.userId], references: [users.id] }),
  bar: one(bars, { fields: [scans.barId], references: [bars.id] }),
  bottle: one(bottles, { fields: [scans.bottleId], references: [bottles.id] }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  user: one(users, { fields: [inventory.userId], references: [users.id] }),
  bottle: one(bottles, { fields: [inventory.bottleId], references: [bottles.id] }),
  lastScan: one(scans, { fields: [inventory.lastScanId], references: [scans.id] }),
}));