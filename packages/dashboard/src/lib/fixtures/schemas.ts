import { z } from 'zod'
import {
  REPORT_RECORD_STATUSES,
  REPORT_STATUSES,
  type ReportBottleRecord as SharedReportBottleRecord,
  type ReportDetail as SharedReportDetail,
  type ReportListItem as SharedReportListItem,
} from '@bartools/types'

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  displayName: z.string().optional(),
  barId: z.string(),
  canManageBar: z.boolean(),
})

export const inviteLinkSchema = z.object({
  url: z.string().url(),
})

export const barMemberSchema = z.object({
  userId: z.string(),
  displayName: z.string().optional(),
  email: z.email(),
  canManageBar: z.boolean(),
})

export const comparableUnitSchema = z.enum(['ml', 'bottle_equivalent'])

export const barSettingsSchema = z.object({
  barId: z.string(),
  timezone: z.string(),
  defaultParComparableAmount: z.number().nonnegative(),
  defaultParComparableUnit: comparableUnitSchema,
})

export const productParOverrideSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  upc: z.string(),
  parComparableAmount: z.number().nonnegative(),
  parComparableUnit: comparableUnitSchema,
})

export const inventoryProductRowSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  category: z.string().optional(),
  upc: z.string(),
  volumeMl: z.number().optional(),
  onHandComparableAmount: z.number().nonnegative(),
  comparableUnit: comparableUnitSchema,
  displayQuantityLabel: z.string().optional(),
  belowPar: z.boolean(),
  belowParReason: z.string().optional(),
  parComparableAmount: z.number().optional(),
  barDefaultParComparableAmount: z.number().optional(),
  asOf: z.string(),
  latestReportId: z.string().optional(),
  sourceReportStatus: z.literal('reviewed'),
})

const modelOutputSchema = z.object({
  bottleName: z.string().optional(),
  category: z.string().optional(),
  upc: z.string().optional(),
  volumeMl: z.number().optional(),
  fillPercent: z.number().min(0).max(100).optional(),
})

export const reportListItemSchema: z.ZodType<SharedReportListItem> = z.object({
  id: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  userId: z.string().optional(),
  userDisplayName: z.string().optional(),
  bottleCount: z.number().int().nonnegative(),
  status: z.enum(REPORT_STATUSES),
})

export const reportBottleRecordSchema: z.ZodType<SharedReportBottleRecord> = z.object({
  id: z.string(),
  imageUrl: z.string(),
  bottleName: z.string(),
  category: z.string().optional(),
  upc: z.string().optional(),
  volumeMl: z.number().optional(),
  fillPercent: z.number().min(0).max(100),
  corrected: z.boolean(),
  status: z.enum(REPORT_RECORD_STATUSES),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  originalModelOutput: modelOutputSchema.optional(),
  correctedValues: modelOutputSchema.optional(),
})

export const reportDetailSchema: z.ZodType<SharedReportDetail> = z.object({
  id: z.string(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  userId: z.string().optional(),
  userDisplayName: z.string().optional(),
  status: z.enum(REPORT_STATUSES),
  bottleRecords: z.array(reportBottleRecordSchema),
})

export const inventoryScenarioSchema = z.object({
  user: userSchema,
  barSettings: barSettingsSchema,
  rows: z.array(inventoryProductRowSchema),
})

export const settingsScenarioSchema = z.object({
  user: userSchema,
  barSettings: barSettingsSchema,
  overrides: z.array(productParOverrideSchema),
  members: z.array(barMemberSchema),
  inviteLink: inviteLinkSchema.optional(),
})

export const reportsScenarioSchema = z.object({
  user: userSchema,
  reports: z.array(reportListItemSchema),
  details: z.record(z.string(), reportDetailSchema),
})

export type User = z.infer<typeof userSchema>
export type BarMember = z.infer<typeof barMemberSchema>
export type BarSettings = z.infer<typeof barSettingsSchema>
export type ProductParOverride = z.infer<typeof productParOverrideSchema>
export type InventoryProductRow = z.infer<typeof inventoryProductRowSchema>
export type ReportListItem = SharedReportListItem
export type ReportDetail = SharedReportDetail
export type InventoryScenario = z.infer<typeof inventoryScenarioSchema>
export type SettingsScenario = z.infer<typeof settingsScenarioSchema>
export type ReportsScenario = z.infer<typeof reportsScenarioSchema>
