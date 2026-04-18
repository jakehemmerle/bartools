import { useBlocker } from 'react-router-dom'
import { useEffect } from 'react'
import {
  createBackstockDraftLineItem,
  createRestoredBackstockSourcePhoto,
  type BackstockDraftLineItem,
  type BackstockSourcePhoto,
  type BackstockStartMode,
  type SubmittedBackstockSummary,
} from '../lib/backstock-draft'

const backstockDraftStorageKey = 'bartools.dashboard.backstock-draft.v1'
const unsavedBackstockDraftMessage = 'Leave this backstock draft? Unsaved changes will be lost.'

type PersistedBackstockDraft = {
  generatedPhotoSignature: string | null
  lineItems: Array<{
    id: string
    origin: BackstockDraftLineItem['origin']
    quantityFullBottles: number
    searchQuery: string
    selectedBottle: BackstockDraftLineItem['selectedBottle']
  }>
  locationId: string
  sourcePhotos: Array<{
    id: string
    name: string
    sizeBytes: number
  }>
  startMode: BackstockStartMode
}

export type RestoredBackstockDraft = {
  generatedPhotoSignature: string | null
  lineItems: BackstockDraftLineItem[]
  locationId: string
  sourcePhotos: BackstockSourcePhoto[]
  startMode: BackstockStartMode
}

export function useBackstockDraftProtection({
  generatedPhotoSignature,
  hasUnsavedChanges,
  lineItems,
  locationId,
  sourcePhotos,
  startMode,
  submittedSummary,
}: {
  generatedPhotoSignature: string | null
  hasUnsavedChanges: boolean
  lineItems: BackstockDraftLineItem[]
  locationId: string
  sourcePhotos: BackstockSourcePhoto[]
  startMode: BackstockStartMode
  submittedSummary: SubmittedBackstockSummary | null
}) {
  const navigationBlocker = useBlocker(hasUnsavedChanges)

  useEffect(() => {
    if (navigationBlocker.state !== 'blocked') {
      return
    }

    if (window.confirm(unsavedBackstockDraftMessage)) {
      clearPersistedBackstockDraft()
      navigationBlocker.proceed()
      return
    }

    navigationBlocker.reset()
  }, [navigationBlocker])

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = unsavedBackstockDraftMessage
      return unsavedBackstockDraftMessage
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  useEffect(() => {
    if (!hasUnsavedChanges || submittedSummary) {
      clearPersistedBackstockDraft()
      return
    }

    persistBackstockDraft({
      generatedPhotoSignature,
      lineItems,
      locationId,
      sourcePhotos,
      startMode,
    })
  }, [
    generatedPhotoSignature,
    hasUnsavedChanges,
    lineItems,
    locationId,
    sourcePhotos,
    startMode,
    submittedSummary,
  ])
}

export function loadPersistedBackstockDraft(): RestoredBackstockDraft | null {
  const rawSnapshot = window.sessionStorage.getItem(backstockDraftStorageKey)

  if (!rawSnapshot) {
    return null
  }

  try {
    const snapshot = JSON.parse(rawSnapshot) as PersistedBackstockDraft

    if (!isPersistedBackstockDraft(snapshot)) {
      clearPersistedBackstockDraft()
      return null
    }

    return {
      generatedPhotoSignature: snapshot.generatedPhotoSignature,
      lineItems: snapshot.lineItems.map((lineItem) =>
        createBackstockDraftLineItem({
          id: lineItem.id,
          origin: lineItem.origin,
          quantityFullBottles: lineItem.quantityFullBottles,
          search: {
            query: lineItem.searchQuery,
            results: [],
          },
          selectedBottle: lineItem.selectedBottle,
        }),
      ),
      locationId: snapshot.locationId,
      sourcePhotos: snapshot.sourcePhotos.map(createRestoredBackstockSourcePhoto),
      startMode: snapshot.startMode,
    }
  } catch {
    clearPersistedBackstockDraft()
    return null
  }
}

export function clearPersistedBackstockDraft() {
  window.sessionStorage.removeItem(backstockDraftStorageKey)
}

function persistBackstockDraft({
  generatedPhotoSignature,
  lineItems,
  locationId,
  sourcePhotos,
  startMode,
}: {
  generatedPhotoSignature: string | null
  lineItems: BackstockDraftLineItem[]
  locationId: string
  sourcePhotos: BackstockSourcePhoto[]
  startMode: BackstockStartMode
}) {
  const snapshot: PersistedBackstockDraft = {
    generatedPhotoSignature,
    lineItems: lineItems.map((lineItem) => ({
      id: lineItem.id,
      origin: lineItem.origin,
      quantityFullBottles: lineItem.quantityFullBottles,
      searchQuery: lineItem.search.query,
      selectedBottle: lineItem.selectedBottle,
    })),
    locationId,
    sourcePhotos: sourcePhotos.map((sourcePhoto) => ({
      id: sourcePhoto.id,
      name: sourcePhoto.name,
      sizeBytes: sourcePhoto.sizeBytes,
    })),
    startMode,
  }

  window.sessionStorage.setItem(backstockDraftStorageKey, JSON.stringify(snapshot))
}

function isPersistedBackstockDraft(value: unknown): value is PersistedBackstockDraft {
  if (!value || typeof value !== 'object') {
    return false
  }

  const snapshot = value as Partial<PersistedBackstockDraft>

  return (
    (snapshot.generatedPhotoSignature === null ||
      typeof snapshot.generatedPhotoSignature === 'string') &&
    typeof snapshot.locationId === 'string' &&
    (snapshot.startMode === 'manual' || snapshot.startMode === 'photo') &&
    Array.isArray(snapshot.lineItems) &&
    Array.isArray(snapshot.sourcePhotos)
  )
}
