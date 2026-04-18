import type { BackstockStartMode } from '../lib/backstock-draft'

export function buildBackstockWorkflowStage({
  hasValidDraft,
  locationId,
  sourcePhotoCount,
  startMode,
}: {
  hasValidDraft: boolean
  locationId: string
  sourcePhotoCount: number
  startMode: BackstockStartMode
}) {
  if (!locationId) {
    return 0
  }

  if (startMode === 'photo' && sourcePhotoCount === 0) {
    return 1
  }

  if (!hasValidDraft) {
    return 2
  }

  return 3
}
