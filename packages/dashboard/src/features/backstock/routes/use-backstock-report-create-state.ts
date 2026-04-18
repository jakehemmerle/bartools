import type { BottleSearchResult } from '@bartools/types'
import { useMemo, useState } from 'react'
import { useReportsClient } from '../../../lib/reports/provider'
import {
  buildFixtureGeneratedLineItems,
  buildSubmittedBackstockSummary,
  createBackstockDraftLineItem,
  createBackstockSourcePhoto,
  isBlankBackstockDraftLineItem,
  type BackstockDraftLineItem,
  type BackstockSourcePhoto,
  type BackstockStartMode,
  type SubmittedBackstockSummary,
} from '../lib/backstock-draft'
import {
  clearPersistedBackstockDraft,
  loadPersistedBackstockDraft,
  useBackstockDraftProtection,
  type RestoredBackstockDraft,
} from './backstock-draft-persistence'

type BackstockDraftFormState = ReturnType<typeof useBackstockDraftState>
type BackstockIntegrationState = ReturnType<typeof createBackstockIntegrationState>

export function useBackstockReportCreateState() {
  const reportsClient = useReportsClient()
  const restoredDraft = useMemo(() => loadPersistedBackstockDraft(), [])
  const formState = useBackstockDraftState(restoredDraft)
  const integrationState = useMemo(
    () => createBackstockIntegrationState(reportsClient.readiness.backendEnabled),
    [reportsClient.readiness.backendEnabled],
  )

  const draftSummary = useMemo(
    () => buildSubmittedBackstockSummary(formState.lineItems),
    [formState.lineItems],
  )
  const sourcePhotoSignature = useMemo(
    () => formState.sourcePhotos.map((sourcePhoto) => sourcePhoto.id).join(':'),
    [formState.sourcePhotos],
  )
  const needsDraftRegeneration =
    formState.generatedPhotoSignature !== null &&
    formState.generatedPhotoSignature !== sourcePhotoSignature
  const hasUnsavedChanges =
    formState.submittedSummary === null &&
    (formState.locationId !== '' ||
      formState.sourcePhotos.length > 0 ||
      formState.startMode !== 'photo' ||
      formState.lineItems.some((lineItem) => !isBlankBackstockDraftLineItem(lineItem)))

  useBackstockDraftProtection({
    generatedPhotoSignature: formState.generatedPhotoSignature,
    hasUnsavedChanges,
    lineItems: formState.lineItems,
    locationId: formState.locationId,
    sourcePhotos: formState.sourcePhotos,
    startMode: formState.startMode,
    submittedSummary: formState.submittedSummary,
  })
  const actions = createBackstockDraftActions({
    draftSummary,
    formState,
    integrationState,
    needsDraftRegeneration,
    reportsClient,
    sourcePhotoSignature,
  })

  return {
    canGenerateDraft:
      integrationState.photoDraftGenerationEnabled && formState.sourcePhotos.length > 0,
    draftStatusMessage: formState.draftStatusMessage,
    draftSummary,
    generatingDraft: formState.generatingDraft,
    hasGeneratedDraft: formState.generatedPhotoSignature !== null,
    integrationNotice: integrationState.integrationNotice,
    lineItems: formState.lineItems,
    locationId: formState.locationId,
    needsDraftRegeneration,
    onAddLineItem: actions.handleAddLineItem,
    onGenerateDraft: actions.handleGenerateDraft,
    onLocationChange: actions.handleLocationChange,
    onPhotoFilesSelected: actions.handlePhotoFilesSelected,
    onQueryChange: actions.handleQueryChange,
    onQuantityChange: actions.handleQuantityChange,
    onRemoveLineItem: actions.handleRemoveLineItem,
    onRemoveSourcePhoto: actions.handleRemoveSourcePhoto,
    onSearch: actions.handleSearch,
    onSelectResult: actions.handleSelectResult,
    onStartAnotherReport: actions.handleStartAnotherReport,
    onStartModeChange: actions.handleStartModeChange,
    onSubmit: actions.handleSubmit,
    photoGenerationBlockedMessage: integrationState.photoGenerationBlockedMessage,
    sourcePhotos: formState.sourcePhotos,
    startMode: formState.startMode,
    submissionBlockedMessage: integrationState.submissionBlockedMessage,
    submittedSummary: formState.submittedSummary,
  }
}

function createBackstockDraftActions({
  draftSummary,
  formState,
  integrationState,
  needsDraftRegeneration,
  reportsClient,
  sourcePhotoSignature,
}: {
  draftSummary: SubmittedBackstockSummary
  formState: BackstockDraftFormState
  integrationState: BackstockIntegrationState
  needsDraftRegeneration: boolean
  reportsClient: ReturnType<typeof useReportsClient>
  sourcePhotoSignature: string
}) {
  async function handleSearch(lineItemId: string, query: string) {
    if (query.trim().length < 2) {
      formState.setDraftStatusMessage(null)
      formState.setLineItems((currentLineItems) =>
        clearLineItemSearchResults(currentLineItems, lineItemId),
      )
      return
    }

    const results = await reportsClient.searchBottles(query)

    formState.setDraftStatusMessage(null)
    formState.setLineItems((currentLineItems) =>
      applySearchResultsToLineItem(currentLineItems, lineItemId, query, results),
    )
  }

  function handleQueryChange(lineItemId: string, query: string) {
    formState.setDraftStatusMessage(null)
    formState.setLineItems((currentLineItems) =>
      applyQueryToLineItem(currentLineItems, lineItemId, query),
    )
  }

  function handleSelectResult(lineItemId: string, result: BottleSearchResult) {
    formState.setDraftStatusMessage(null)
    formState.setLineItems((currentLineItems) =>
      applySelectedBottleToLineItem(currentLineItems, lineItemId, result),
    )
  }

  function handleQuantityChange(lineItemId: string, quantity: number) {
    formState.setDraftStatusMessage(null)
    formState.setLineItems((currentLineItems) =>
      applyQuantityToLineItem(currentLineItems, lineItemId, quantity),
    )
  }

  function handleRemoveLineItem(lineItemId: string) {
    formState.setDraftStatusMessage(null)
    formState.setLineItems((currentLineItems) =>
      removeLineItemOrReset(currentLineItems, lineItemId),
    )
  }

  async function handleGenerateDraft() {
    if (!integrationState.photoDraftGenerationEnabled) {
      formState.setDraftStatusMessage(integrationState.photoGenerationBlockedMessage)
      return
    }

    if (formState.sourcePhotos.length === 0) {
      return
    }

    formState.setGeneratingDraft(true)
    await Promise.resolve()
    formState.setLineItems(buildFixtureGeneratedLineItems(formState.sourcePhotos))
    formState.setGeneratedPhotoSignature(sourcePhotoSignature)
    formState.setDraftStatusMessage(null)
    formState.setGeneratingDraft(false)
  }

  function handleLocationChange(nextLocationId: string) {
    formState.setDraftStatusMessage(null)
    formState.setLocationId(nextLocationId)
  }

  function handlePhotoFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) {
      return
    }

    formState.setDraftStatusMessage(null)
    const nextPhotos = [...files].map(createBackstockSourcePhoto)
    formState.setSourcePhotos((currentPhotos) => [...currentPhotos, ...nextPhotos])
  }

  function handleRemoveSourcePhoto(sourcePhotoId: string) {
    formState.setDraftStatusMessage(null)
    formState.setSourcePhotos((currentPhotos) =>
      currentPhotos.filter((sourcePhoto) => sourcePhoto.id !== sourcePhotoId),
    )
  }

  function handleAddLineItem() {
    formState.setDraftStatusMessage(null)
    formState.setLineItems((currentLineItems) => [
      ...currentLineItems,
      createBackstockDraftLineItem(),
    ])
  }

  function handleStartAnotherReport() {
    clearPersistedBackstockDraft()
    formState.setSubmittedSummary(null)
    formState.setLocationId('')
    formState.setSourcePhotos([])
    formState.setLineItems([createBackstockDraftLineItem()])
    formState.setStartMode('photo')
    formState.setGeneratedPhotoSignature(null)
    formState.setDraftStatusMessage(null)
  }

  function handleStartModeChange(mode: BackstockStartMode) {
    formState.setDraftStatusMessage(null)
    formState.setStartMode(mode)
  }

  function handleSubmit() {
    if (!integrationState.submissionEnabled) {
      formState.setDraftStatusMessage(integrationState.submissionBlockedMessage)
      return
    }

    if (needsDraftRegeneration) {
      return
    }

    clearPersistedBackstockDraft()
    formState.setDraftStatusMessage(null)
    formState.setSubmittedSummary(draftSummary)
  }

  return {
    handleAddLineItem,
    handleGenerateDraft,
    handleLocationChange,
    handlePhotoFilesSelected,
    handleQueryChange,
    handleQuantityChange,
    handleRemoveLineItem,
    handleRemoveSourcePhoto,
    handleSearch,
    handleSelectResult,
    handleStartAnotherReport,
    handleStartModeChange,
    handleSubmit,
  }
}

function useBackstockDraftState(restoredDraft: RestoredBackstockDraft | null) {
  const [startMode, setStartMode] = useState<BackstockStartMode>(
    () => restoredDraft?.startMode ?? 'photo',
  )
  const [locationId, setLocationId] = useState(() => restoredDraft?.locationId ?? '')
  const [sourcePhotos, setSourcePhotos] = useState<BackstockSourcePhoto[]>(
    () => restoredDraft?.sourcePhotos ?? [],
  )
  const [lineItems, setLineItems] = useState<BackstockDraftLineItem[]>(
    () => restoredDraft?.lineItems ?? [createBackstockDraftLineItem()],
  )
  const [generatingDraft, setGeneratingDraft] = useState(false)
  const [generatedPhotoSignature, setGeneratedPhotoSignature] = useState<string | null>(
    () => restoredDraft?.generatedPhotoSignature ?? null,
  )
  const [submittedSummary, setSubmittedSummary] = useState<SubmittedBackstockSummary | null>(null)
  const [draftStatusMessage, setDraftStatusMessage] = useState<string | null>(() =>
    restoredDraft ? 'Draft restored from this browser session.' : null,
  )

  return {
    draftStatusMessage,
    generatedPhotoSignature,
    generatingDraft,
    lineItems,
    locationId,
    setDraftStatusMessage,
    setGeneratedPhotoSignature,
    setGeneratingDraft,
    setLineItems,
    setLocationId,
    setSourcePhotos,
    setStartMode,
    setSubmittedSummary,
    sourcePhotos,
    startMode,
    submittedSummary,
  }
}

function createBackstockIntegrationState(backendEnabled: boolean) {
  if (!backendEnabled) {
    return {
      integrationNotice: null,
      photoDraftGenerationEnabled: true,
      photoGenerationBlockedMessage: null,
      submissionBlockedMessage: null,
      submissionEnabled: true,
    }
  }

  return {
    integrationNotice:
      'Live backstock creation is still waiting on backend support. Photo-generated drafts and final submission are not connected yet.',
    photoDraftGenerationEnabled: false,
    photoGenerationBlockedMessage:
      'Photo-generated drafts need backend uploads and grouping before they can run here.',
    submissionBlockedMessage:
      'Live backstock submission needs a dedicated backend contract before it can be sent.',
    submissionEnabled: false,
  }
}

function clearLineItemSearchResults(
  lineItems: BackstockDraftLineItem[],
  lineItemId: string,
) {
  return lineItems.map((lineItem) =>
    lineItem.id === lineItemId
      ? {
          ...lineItem,
          search: {
            ...lineItem.search,
            results: [],
          },
        }
      : lineItem,
  )
}

function applySearchResultsToLineItem(
  lineItems: BackstockDraftLineItem[],
  lineItemId: string,
  query: string,
  results: BottleSearchResult[],
) {
  return lineItems.map((lineItem) =>
    lineItem.id === lineItemId && lineItem.search.query === query
      ? {
          ...lineItem,
          search: {
            query,
            results,
          },
        }
      : lineItem,
  )
}

function applyQueryToLineItem(
  lineItems: BackstockDraftLineItem[],
  lineItemId: string,
  query: string,
) {
  return lineItems.map((lineItem) =>
    lineItem.id === lineItemId
      ? {
          ...lineItem,
          selectedBottle:
            lineItem.selectedBottle?.name === query ? lineItem.selectedBottle : null,
          search: {
            ...lineItem.search,
            query,
            results: query.trim().length < 2 ? [] : lineItem.search.results,
          },
        }
      : lineItem,
  )
}

function applySelectedBottleToLineItem(
  lineItems: BackstockDraftLineItem[],
  lineItemId: string,
  result: BottleSearchResult,
) {
  return lineItems.map((lineItem) =>
    lineItem.id === lineItemId
      ? {
          ...lineItem,
          selectedBottle: result,
          search: {
            query: result.name,
            results: [],
          },
        }
      : lineItem,
  )
}

function applyQuantityToLineItem(
  lineItems: BackstockDraftLineItem[],
  lineItemId: string,
  quantity: number,
) {
  return lineItems.map((lineItem) =>
    lineItem.id === lineItemId
      ? {
          ...lineItem,
          quantityFullBottles: quantity,
        }
      : lineItem,
  )
}

function removeLineItemOrReset(
  lineItems: BackstockDraftLineItem[],
  lineItemId: string,
) {
  const nextLineItems = lineItems.filter((lineItem) => lineItem.id !== lineItemId)

  return nextLineItems.length > 0 ? nextLineItems : [createBackstockDraftLineItem()]
}
