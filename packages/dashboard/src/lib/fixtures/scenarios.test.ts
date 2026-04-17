import { describe, expect, it } from 'vitest'
import {
  inventoryScenarios,
  settingsScenarios,
} from './scenarios'

describe('fixture scenarios', () => {
  it('keeps inventory rows tied to reviewed report data', () => {
    for (const row of inventoryScenarios.default.rows) {
      expect(row.sourceReportStatus).toBe('reviewed')
    }
  })

  it('keeps the restricted settings scenario non-manager only', () => {
    expect(settingsScenarios.restricted.user.canManageBar).toBe(false)
    expect(settingsScenarios.manager.user.canManageBar).toBe(true)
  })
})
