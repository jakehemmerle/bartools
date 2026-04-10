import { describe, expect, it } from 'vitest'
import {
  inventoryScenarios,
  sessionsScenario,
  settingsScenarios,
} from './scenarios'

describe('fixture scenarios', () => {
  it('keeps inventory rows tied to confirmed session data', () => {
    for (const row of inventoryScenarios.default.rows) {
      expect(row.sourceSessionStatus).toBe('confirmed')
    }
  })

  it('keeps the restricted settings scenario non-manager only', () => {
    expect(settingsScenarios.restricted.user.canManageBar).toBe(false)
    expect(settingsScenarios.manager.user.canManageBar).toBe(true)
  })

  it('keeps a missing-media session scenario available for review', () => {
    const detail = sessionsScenario.details['session-missing-media']

    expect(detail).toBeDefined()
    expect(detail.bottleRecords[0]?.imageUrl).toBe('')
  })
})
