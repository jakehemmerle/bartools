import {
  inventoryScenarioSchema,
  settingsScenarioSchema,
  type InventoryScenario,
  type SettingsScenario,
} from './schemas'
import {
  makeBarMember,
  makeBarSettings,
  makeInviteLink,
  makeInventoryRow,
  makeProductParOverride,
  makeUser,
} from './builders'

export const inventoryScenarios = {
  default: inventoryScenarioSchema.parse({
    user: makeUser(),
    barSettings: makeBarSettings(),
    rows: [
      makeInventoryRow(),
      makeInventoryRow({
        productId: 'product-2',
        productName: 'Espolòn Blanco',
        category: 'Tequila',
        upc: '080686834203',
        onHandComparableAmount: 900,
        displayQuantityLabel: '1.2 bottles',
        belowPar: true,
        belowParReason: 'Below PAR by 600 ml',
        parComparableAmount: 1500,
        asOf: '2026-04-08T22:09:00-05:00',
        latestReportId: 'report-1000',
      }),
      makeInventoryRow({
        productId: 'product-3',
        productName: 'Bulleit Bourbon',
        category: 'Whiskey',
        upc: '082000770011',
        onHandComparableAmount: 3.2,
        comparableUnit: 'bottle_equivalent',
        displayQuantityLabel: '3.2 bottles',
        belowPar: false,
        parComparableAmount: 2,
        barDefaultParComparableAmount: 2,
        asOf: '2026-04-04T20:31:00-05:00',
        latestReportId: 'report-0996',
      }),
    ],
  }),
  empty: inventoryScenarioSchema.parse({
    user: makeUser(),
    barSettings: makeBarSettings(),
    rows: [],
  }),
  stale: inventoryScenarioSchema.parse({
    user: makeUser(),
    barSettings: makeBarSettings(),
    rows: [
      makeInventoryRow({
        productId: 'product-4',
        productName: 'Campari',
        category: 'Aperitif',
        upc: '721059000101',
        onHandComparableAmount: 350,
        displayQuantityLabel: '0.5 bottles',
        belowPar: true,
        belowParReason: 'Below PAR by 1,150 ml',
        asOf: '2026-03-18T19:02:00-05:00',
        latestReportId: 'report-0980',
      }),
    ],
  }),
  staff: inventoryScenarioSchema.parse({
    user: makeUser({
      id: 'user-staff-1',
      email: 'morgan@thechallenger.example',
      displayName: 'Morgan Lee',
      canManageBar: false,
    }),
    barSettings: makeBarSettings(),
    rows: [makeInventoryRow()],
  }),
} satisfies Record<string, InventoryScenario>

export const settingsScenarios = {
  manager: settingsScenarioSchema.parse({
    user: makeUser(),
    barSettings: makeBarSettings(),
    overrides: [
      makeProductParOverride(),
      makeProductParOverride({
        productId: 'product-2',
        productName: 'Espolòn Blanco',
        upc: '080686834203',
        parComparableAmount: 2250,
      }),
    ],
    members: [
      makeBarMember({
        userId: 'user-manager-1',
        email: 'avery@thechallenger.example',
        displayName: 'Avery Quinn',
        canManageBar: true,
      }),
      makeBarMember(),
      makeBarMember({
        userId: 'user-staff-2',
        email: 'sam@thechallenger.example',
        displayName: 'Sam Ortiz',
      }),
    ],
    inviteLink: makeInviteLink(),
  }),
  restricted: settingsScenarioSchema.parse({
    user: makeUser({
      id: 'user-staff-1',
      email: 'morgan@thechallenger.example',
      displayName: 'Morgan Lee',
      canManageBar: false,
    }),
    barSettings: makeBarSettings(),
    overrides: [makeProductParOverride()],
    members: [
      makeBarMember(),
      makeBarMember({
        userId: 'user-manager-2',
        email: 'avery@thechallenger.example',
        displayName: 'Avery Quinn',
        canManageBar: true,
      }),
    ],
  }),
} satisfies Record<string, SettingsScenario>
