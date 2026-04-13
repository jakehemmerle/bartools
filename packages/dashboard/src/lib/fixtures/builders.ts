import {
  barMemberSchema,
  barSettingsSchema,
  inventoryProductRowSchema,
  inviteLinkSchema,
  productParOverrideSchema,
  reportBottleRecordSchema,
  reportDetailSchema,
  reportListItemSchema,
  userSchema,
  type BarMember,
  type BarSettings,
  type InventoryProductRow,
  type ProductParOverride,
  type ReportDetail,
  type ReportListItem,
  type User,
} from './schemas'

export function makeUser(overrides: Partial<User> = {}) {
  return userSchema.parse({
    id: 'user-manager-1',
    email: 'avery@thechallenger.example',
    displayName: 'Avery Quinn',
    barId: 'bar-1',
    canManageBar: true,
    ...overrides,
  })
}

export function makeBarSettings(overrides: Partial<BarSettings> = {}) {
  return barSettingsSchema.parse({
    barId: 'bar-1',
    timezone: 'America/Chicago',
    defaultParComparableAmount: 1500,
    defaultParComparableUnit: 'ml',
    ...overrides,
  })
}

export function makeInventoryRow(
  overrides: Partial<InventoryProductRow> = {},
) {
  return inventoryProductRowSchema.parse({
    productId: 'product-1',
    productName: 'Tito’s Handmade Vodka',
    category: 'Vodka',
    upc: '619947000013',
    volumeMl: 750,
    onHandComparableAmount: 1900,
    comparableUnit: 'ml',
    displayQuantityLabel: '2.5 bottles',
    belowPar: false,
    parComparableAmount: 1500,
    barDefaultParComparableAmount: 1500,
    asOf: '2026-04-09T22:15:00-05:00',
    latestReportId: 'report-1001',
    sourceReportStatus: 'reviewed',
    ...overrides,
  })
}

export function makeProductParOverride(
  overrides: Partial<ProductParOverride> = {},
) {
  return productParOverrideSchema.parse({
    productId: 'product-1',
    productName: 'Tito’s Handmade Vodka',
    upc: '619947000013',
    parComparableAmount: 2250,
    parComparableUnit: 'ml',
    ...overrides,
  })
}

export function makeReportListItem(
  overrides: Partial<ReportListItem> = {},
) {
  return reportListItemSchema.parse({
    id: 'report-1001',
    startedAt: '2026-04-09T21:44:00-05:00',
    completedAt: '2026-04-09T22:15:00-05:00',
    userId: 'user-manager-1',
    userDisplayName: 'Avery Quinn',
    bottleCount: 18,
    status: 'reviewed',
    ...overrides,
  })
}

export function makeReportDetail(
  overrides: Partial<ReportDetail> = {},
) {
  return reportDetailSchema.parse({
    id: 'report-1001',
    startedAt: '2026-04-09T21:44:00-05:00',
    completedAt: '2026-04-09T22:15:00-05:00',
    userId: 'user-manager-1',
    userDisplayName: 'Avery Quinn',
    status: 'reviewed',
    bottleRecords: [
      reportBottleRecordSchema.parse({
        id: 'record-1',
        imageUrl: '/favicon.svg',
        bottleName: 'Tito’s Handmade Vodka',
        category: 'Vodka',
        upc: '619947000013',
        volumeMl: 750,
        fillPercent: 62,
        corrected: false,
      }),
    ],
    ...overrides,
  })
}

export function makeBarMember(
  overrides: Partial<BarMember> = {},
) {
  return barMemberSchema.parse({
    userId: 'user-staff-1',
    email: 'morgan@thechallenger.example',
    displayName: 'Morgan Lee',
    canManageBar: false,
    ...overrides,
  })
}

export function makeInviteLink(url = 'https://bartools.app/join/invite-123') {
  return inviteLinkSchema.parse({ url })
}
