import type { BottleSearchResult } from '@bartools/types'
import { Button } from '../../../components/primitives/button'
import { Select } from '../../../components/primitives/select'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import { BackstockPhotoIntake } from './backstock-photo-intake'
import { buildBackstockWorkflowStage } from './backstock-report-create-workflow'
import {
  BackstockLineItemEditor,
  BackstockSummaryGrid,
} from './backstock-report-create-parts'
import { buildBottleMeta } from './backstock-report-formatting'
import type {
  BackstockDraftLineItem,
  BackstockSourcePhoto,
  BackstockStartMode,
  SubmittedBackstockSummary,
} from '../lib/backstock-draft'
type BackstockLocationOption = {
  id: string
  name: string
}
type BackstockReportCreateScreenProps = {
  canGenerateDraft: boolean
  canSubmitDraft: boolean
  draftStatusMessage: string | null
  draftSummary: SubmittedBackstockSummary
  generatingDraft: boolean
  hasGeneratedDraft: boolean
  integrationNotice: string | null
  lineItems: BackstockDraftLineItem[]
  locationId: string
  locationOptions: ReadonlyArray<BackstockLocationOption>
  needsDraftRegeneration: boolean
  onAddLineItem: () => void
  onGenerateDraft: () => void
  onLocationChange: (locationId: string) => void
  onPhotoFilesSelected: (files: FileList | null) => void
  onQueryChange: (lineItemId: string, query: string) => void
  onRemoveLineItem: (lineItemId: string) => void
  onRemoveSourcePhoto: (sourcePhotoId: string) => void
  onSearch: (lineItemId: string, query: string) => void
  onSelectResult: (lineItemId: string, result: BottleSearchResult) => void
  onStartAnotherReport: () => void
  onStartModeChange: (mode: BackstockStartMode) => void
  onSubmit: () => void
  onQuantityChange: (lineItemId: string, quantity: number) => void
  photoGenerationBlockedMessage: string | null
  sourcePhotos: BackstockSourcePhoto[]
  startMode: BackstockStartMode
  submissionBlockedMessage: string | null
  submissionReadinessMessage: string | null
  submittedSummary: SubmittedBackstockSummary | null
}
export function BackstockReportCreateScreen({
  canGenerateDraft,
  canSubmitDraft,
  draftStatusMessage,
  draftSummary,
  generatingDraft,
  hasGeneratedDraft,
  integrationNotice,
  lineItems,
  locationId,
  locationOptions,
  needsDraftRegeneration,
  onAddLineItem,
  onGenerateDraft,
  onLocationChange,
  onPhotoFilesSelected,
  onQueryChange,
  onRemoveLineItem,
  onRemoveSourcePhoto,
  onSearch,
  onSelectResult,
  onStartAnotherReport,
  onStartModeChange,
  onSubmit,
  onQuantityChange,
  photoGenerationBlockedMessage,
  sourcePhotos,
  startMode,
  submissionBlockedMessage,
  submissionReadinessMessage,
  submittedSummary,
}: BackstockReportCreateScreenProps) {
  const selectedLocation =
    locationOptions.find((location) => location.id === locationId) ?? null
  const hasValidDraft = draftSummary.skuCount > 0
  const workflowStage = buildBackstockWorkflowStage({
    hasValidDraft,
    locationId,
    sourcePhotoCount: sourcePhotos.length,
    startMode,
  })
  if (submittedSummary && selectedLocation) {
    return (
      <BackstockSubmittedState
        locationName={selectedLocation.name}
        onStartAnotherReport={onStartAnotherReport}
        sourcePhotoCount={sourcePhotos.length}
        submittedSummary={submittedSummary}
      />
    )
  }

  return (
    <div className="bb-backstock-screen">
      <BackstockReportHeader
        support="Count sealed bottles in one backstock location. Start from photos or enter line items directly."
        title="New Backstock Report"
      />
      <BackstockWorkflowRail
        currentStage={workflowStage}
        photoGenerationBlocked={!!photoGenerationBlockedMessage}
        startMode={startMode}
        submissionBlocked={!!submissionBlockedMessage}
      />
      {integrationNotice ? (
        <SurfaceCard className="bb-message-panel" tone="low">
          <p className="bb-message-panel__body">{integrationNotice}</p>
        </SurfaceCard>
      ) : null}
      {draftStatusMessage ? (
        <SurfaceCard className="bb-message-panel" tone="low">
          <p aria-live="polite" className="bb-message-panel__body">
            {draftStatusMessage}
          </p>
        </SurfaceCard>
      ) : null}
      <BackstockSetupCard
        locationId={locationId}
        locationOptions={locationOptions}
        onLocationChange={onLocationChange}
        onStartModeChange={onStartModeChange}
        startMode={startMode}
      />
      {startMode === 'photo' ? (
        <BackstockPhotoIntake
          canGenerateDraft={canGenerateDraft}
          generationBlockedMessage={photoGenerationBlockedMessage}
          hasGeneratedDraft={hasGeneratedDraft}
          generatingDraft={generatingDraft}
          needsDraftRegeneration={needsDraftRegeneration}
          onGenerateDraft={onGenerateDraft}
          onPhotoFilesSelected={onPhotoFilesSelected}
          onRemoveSourcePhoto={onRemoveSourcePhoto}
          sourcePhotos={sourcePhotos}
        />
      ) : null}
      <BackstockLineItemsCard
        lineItems={lineItems}
        onAddLineItem={onAddLineItem}
        onQuantityChange={onQuantityChange}
        onQueryChange={onQueryChange}
        onRemoveLineItem={onRemoveLineItem}
        onSearch={onSearch}
        onSelectResult={onSelectResult}
        startMode={startMode}
      />
      <BackstockSummaryCard
        draftSummary={draftSummary}
        locationName={selectedLocation?.name ?? 'Choose one location'}
        needsDraftRegeneration={needsDraftRegeneration}
        onSubmit={onSubmit}
        submissionBlockedMessage={submissionBlockedMessage}
        submissionReadinessMessage={submissionReadinessMessage}
        sourcePhotoCount={sourcePhotos.length}
        submitDisabled={
          !locationId || !canSubmitDraft || needsDraftRegeneration || !!submissionBlockedMessage
        }
      />
    </div>
  )
}

function BackstockWorkflowRail({
  currentStage,
  photoGenerationBlocked,
  startMode,
  submissionBlocked,
}: {
  currentStage: number
  photoGenerationBlocked: boolean
  startMode: BackstockStartMode
  submissionBlocked: boolean
}) {
  const steps = [
    { label: 'Setup', support: 'Choose the backstock location.' },
    {
      label: 'Stage Photos',
      support:
        startMode === 'photo'
          ? photoGenerationBlocked
            ? 'Queue shelf photos while draft generation is pending backend work.'
            : 'Queue shelf photos for the first draft.'
          : 'Optional when you want to start manually.',
    },
    { label: 'Review Draft', support: 'Fix grouped counts and product matches.' },
    {
      label: 'Submit Snapshot',
      support: submissionBlocked ? 'Pending backend support.' : 'Save the sealed full-bottle count.',
    },
  ]

  return (
    <ol className="bb-backstock-workflow" aria-label="Backstock report workflow">
      {steps.map((step, index) => {
        const state =
          index < currentStage ? 'complete' : index === currentStage ? 'active' : 'upcoming'

        return (
          <li className={`bb-backstock-workflow__step is-${state}`} key={step.label}>
            <div className="bb-backstock-workflow__marker">{index + 1}</div>
            <div>
              <p className="bb-backstock-workflow__label">{step.label}</p>
              <p className="bb-backstock-workflow__support">{step.support}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function BackstockReportHeader({
  support,
  title,
}: {
  support: string
  title: string
}) {
  return (
    <section className="bb-backstock-header">
      <p className="bb-backstock-header__eyebrow">Reports</p>
      <h1 className="bb-page-title">{title}</h1>
      <p className="bb-reports-header__support">{support}</p>
    </section>
  )
}

function BackstockSubmittedState({
  locationName,
  onStartAnotherReport,
  sourcePhotoCount,
  submittedSummary,
}: {
  locationName: string
  onStartAnotherReport: () => void
  sourcePhotoCount: number
  submittedSummary: SubmittedBackstockSummary
}) {
  return (
    <div className="bb-backstock-screen">
      <BackstockReportHeader
        support="Fixture mode keeps this submitted snapshot in the current browser session for flow review."
        title="Backstock Report Submitted"
      />

      <SurfaceCard className="bb-backstock-card bb-backstock-card--summary" tone="low">
        <BackstockSummaryGrid
          locationName={locationName}
          productCount={submittedSummary.skuCount}
          sourcePhotoCount={sourcePhotoCount}
          totalBottleCount={submittedSummary.totalBottleCount}
        />

        <div className="bb-backstock-submitted-list" aria-label="Submitted line items">
          {submittedSummary.lineItems.map((lineItem) => (
            <div className="bb-backstock-submitted-row" key={lineItem.bottle.id}>
              <div>
                <p className="bb-backstock-submitted-row__name">{lineItem.bottle.name}</p>
                <p className="bb-backstock-submitted-row__meta">
                  {buildBottleMeta(lineItem.bottle)}
                </p>
              </div>
              <p className="bb-backstock-submitted-row__count">
                {lineItem.quantityFullBottles}
              </p>
            </div>
          ))}
        </div>

        <div className="bb-backstock-card__actions">
          <Button onPress={onStartAnotherReport} variant="secondary">
            Start Another Report
          </Button>
          <Button to="/reports">Back to Reports</Button>
        </div>
      </SurfaceCard>
    </div>
  )
}

function BackstockSetupCard({
  locationId,
  locationOptions,
  onLocationChange,
  onStartModeChange,
  startMode,
}: {
  locationId: string
  locationOptions: ReadonlyArray<BackstockLocationOption>
  onLocationChange: (locationId: string) => void
  onStartModeChange: (mode: BackstockStartMode) => void
  startMode: BackstockStartMode
}) {
  return (
    <SurfaceCard className="bb-backstock-card" tone="low">
      <div className="bb-backstock-card__heading">
        <div>
          <h2 className="bb-backstock-card__title">Report Setup</h2>
          <p className="bb-backstock-card__support">
            Choose one location and the fastest starting point for this count.
          </p>
        </div>
      </div>

      <div className="bb-backstock-setup-grid">
        <Select
          label="Backstock Location"
          onChange={(event) => onLocationChange(event.currentTarget.value)}
          value={locationId}
        >
          <option value="">Choose one location</option>
          {locationOptions.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </Select>

        <div className="bb-field">
          <span className="bb-field__label">How To Start</span>
          <div className="bb-backstock-mode-toggle" role="group" aria-label="How To Start">
            <button
              aria-pressed={startMode === 'photo'}
              className={`bb-backstock-mode-toggle__option${startMode === 'photo' ? ' is-active' : ''}`}
              onClick={() => onStartModeChange('photo')}
              type="button"
            >
              Use Photos
            </button>
            <button
              aria-pressed={startMode === 'manual'}
              className={`bb-backstock-mode-toggle__option${startMode === 'manual' ? ' is-active' : ''}`}
              onClick={() => onStartModeChange('manual')}
              type="button"
            >
              Enter Manually
            </button>
          </div>
        </div>
      </div>
    </SurfaceCard>
  )
}

function BackstockLineItemsCard({
  lineItems,
  onAddLineItem,
  onQuantityChange,
  onQueryChange,
  onRemoveLineItem,
  onSearch,
  onSelectResult,
  startMode,
}: {
  lineItems: BackstockDraftLineItem[]
  onAddLineItem: () => void
  onQuantityChange: (lineItemId: string, quantity: number) => void
  onQueryChange: (lineItemId: string, query: string) => void
  onRemoveLineItem: (lineItemId: string) => void
  onSearch: (lineItemId: string, query: string) => void
  onSelectResult: (lineItemId: string, result: BottleSearchResult) => void
  startMode: BackstockStartMode
}) {
  return (
    <SurfaceCard className="bb-backstock-card" tone="low">
      <div className="bb-backstock-card__heading">
        <div>
          <h2 className="bb-backstock-card__title">Line Items</h2>
          <p className="bb-backstock-card__support">
            Review grouped counts, fix product matches, and add anything the draft missed.
          </p>
        </div>
        <Button onPress={onAddLineItem} variant="ghost">
          Add Product
        </Button>
      </div>

      {lineItems.length > 0 ? (
        <div className="bb-backstock-line-items">
          {lineItems.map((lineItem, index) => (
            <BackstockLineItemEditor
              index={index}
              key={lineItem.id}
              lineItem={lineItem}
              onQuantityChange={onQuantityChange}
              onQueryChange={onQueryChange}
              onRemoveLineItem={onRemoveLineItem}
              onSearch={onSearch}
              onSelectResult={onSelectResult}
            />
          ))}
        </div>
      ) : (
        <SurfaceCard className="bb-backstock-empty-state" tone="canvas">
          <p className="bb-empty-state__body">
            {startMode === 'photo'
              ? 'Generate a draft from source photos or add a product manually to begin.'
              : 'Add the first product line item to begin the backstock snapshot.'}
          </p>
        </SurfaceCard>
      )}
    </SurfaceCard>
  )
}

function BackstockSummaryCard({
  draftSummary,
  locationName,
  needsDraftRegeneration,
  onSubmit,
  sourcePhotoCount,
  submissionBlockedMessage,
  submissionReadinessMessage,
  submitDisabled,
}: {
  draftSummary: SubmittedBackstockSummary
  locationName: string
  needsDraftRegeneration: boolean
  onSubmit: () => void
  sourcePhotoCount: number
  submissionBlockedMessage: string | null
  submissionReadinessMessage: string | null
  submitDisabled: boolean
}) {
  return (
    <SurfaceCard className="bb-backstock-card" tone="base">
      <div className="bb-backstock-card__heading">
        <div>
          <h2 className="bb-backstock-card__title">Snapshot Summary</h2>
          <p className="bb-backstock-card__support">
            {submissionBlockedMessage
              ? 'Finalize the snapshot details now. Live submission will connect here after backend support lands.'
              : 'Submit once the grouped counts reflect what is sealed and on hand right now.'}
          </p>
        </div>
      </div>

      <BackstockSummaryGrid
        locationName={locationName}
        productCount={draftSummary.skuCount}
        sourcePhotoCount={sourcePhotoCount}
        totalBottleCount={draftSummary.totalBottleCount}
      />

      <div className="bb-backstock-card__actions">
        <div className="bb-backstock-card__actions-copy">
          {submissionBlockedMessage ? (
            <p aria-live="polite" className="bb-field__hint bb-field__hint--warning">
              {submissionBlockedMessage}
            </p>
          ) : needsDraftRegeneration ? (
            <p aria-live="polite" className="bb-field__hint bb-field__hint--warning">
              Regenerate the draft to match the current photo set before submitting.
            </p>
          ) : submissionReadinessMessage ? (
            <p aria-live="polite" className="bb-field__hint bb-field__hint--warning">
              {submissionReadinessMessage}
            </p>
          ) : null}
        </div>
        <Button disabled={submitDisabled} onPress={onSubmit}>
          {submissionBlockedMessage ? 'Submission Pending' : 'Submit Backstock Report'}
        </Button>
        <Button to="/reports" variant="ghost">
          Cancel
        </Button>
      </div>
    </SurfaceCard>
  )
}
