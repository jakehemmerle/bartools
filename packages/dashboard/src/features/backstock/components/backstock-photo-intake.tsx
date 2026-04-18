import { Button } from '../../../components/primitives/button'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import { formatBytes } from './backstock-report-formatting'
import type { BackstockSourcePhoto } from '../lib/backstock-draft'

type BackstockPhotoIntakeProps = {
  canGenerateDraft: boolean
  generationBlockedMessage: string | null
  hasGeneratedDraft: boolean
  generatingDraft: boolean
  needsDraftRegeneration: boolean
  onGenerateDraft: () => void
  onPhotoFilesSelected: (files: FileList | null) => void
  onRemoveSourcePhoto: (sourcePhotoId: string) => void
  sourcePhotos: BackstockSourcePhoto[]
}

export function BackstockPhotoIntake({
  canGenerateDraft,
  generationBlockedMessage,
  hasGeneratedDraft,
  generatingDraft,
  needsDraftRegeneration,
  onGenerateDraft,
  onPhotoFilesSelected,
  onRemoveSourcePhoto,
  sourcePhotos,
}: BackstockPhotoIntakeProps) {
  return (
    <SurfaceCard className="bt-backstock-card bt-backstock-intake" tone="base">
      <BackstockPhotoIntakeHeader
        generationBlockedMessage={generationBlockedMessage}
        sourcePhotoCount={sourcePhotos.length}
      />

      <div className="bt-backstock-intake__stage">
        <BackstockPhotoDropzone
          generationBlockedMessage={generationBlockedMessage}
          onPhotoFilesSelected={onPhotoFilesSelected}
          sourcePhotoCount={sourcePhotos.length}
        />
        <BackstockPhotoWorkflow
          generationBlockedMessage={generationBlockedMessage}
          startModeHasPhotos={sourcePhotos.length > 0}
        />
      </div>

      {sourcePhotos.length > 0 ? (
        <BackstockPhotoTray
          onRemoveSourcePhoto={onRemoveSourcePhoto}
          sourcePhotos={sourcePhotos}
        />
      ) : (
        <p className="bt-field__hint">
          {generationBlockedMessage
            ? 'Queue one or more images now. Grouped draft generation will connect here after backend work lands.'
            : 'Queue one or more images to generate the initial grouped draft.'}
        </p>
      )}

      <BackstockPhotoActions
        canGenerateDraft={canGenerateDraft}
        generationBlockedMessage={generationBlockedMessage}
        generatingDraft={generatingDraft}
        hasGeneratedDraft={hasGeneratedDraft}
        needsDraftRegeneration={needsDraftRegeneration}
        onGenerateDraft={onGenerateDraft}
      />
    </SurfaceCard>
  )
}

function BackstockPhotoIntakeHeader({
  generationBlockedMessage,
  sourcePhotoCount,
}: {
  generationBlockedMessage: string | null
  sourcePhotoCount: number
}) {
  const queueLabel =
    sourcePhotoCount === 1 ? '1 frame queued' : `${sourcePhotoCount} frames queued`
  const support = generationBlockedMessage
    ? 'Stage shelf or storage photos from one location now. Live grouped draft generation will connect here after backend work lands.'
    : 'Stage several shelf or storage photos from one location, then generate a grouped first draft to review below.'

  return (
    <div className="bt-backstock-intake__header">
      <div>
        <p className="bt-backstock-intake__eyebrow">Photo-Assisted Draft</p>
        <h2 className="bt-backstock-card__title">Photo Staging</h2>
        <p className="bt-backstock-card__support">{support}</p>
      </div>
      <div className="bt-backstock-intake__summary">
        <p className="bt-backstock-intake__summary-value">{queueLabel}</p>
        <p className="bt-backstock-intake__summary-note">
          Manual entry stays available if you would rather count without photos.
        </p>
      </div>
    </div>
  )
}

function BackstockPhotoDropzone({
  generationBlockedMessage,
  onPhotoFilesSelected,
  sourcePhotoCount,
}: {
  generationBlockedMessage: string | null
  onPhotoFilesSelected: (files: FileList | null) => void
  sourcePhotoCount: number
}) {
  const support = generationBlockedMessage
    ? 'Add a few wide shots of sealed bottles in one backstock area. Grouped draft generation will connect here once backend uploads are ready.'
    : 'Add a few wide shots of sealed bottles in one backstock area. The draft groups likely products and bottle counts before review.'

  return (
    <label className="bt-backstock-intake__dropzone" htmlFor="backstock-source-photos">
      <input
        accept="image/*"
        aria-label="Choose Photos"
        className="bt-backstock-intake__input"
        id="backstock-source-photos"
        multiple
        onChange={(event) => onPhotoFilesSelected(event.currentTarget.files)}
        type="file"
      />
      <span className="bt-backstock-intake__drop-eyebrow">Choose Photos</span>
      <span className="bt-backstock-intake__drop-title">
        Stage shelf photos for the first draft
      </span>
      <span className="bt-backstock-intake__drop-support">{support}</span>
      <span className="bt-backstock-intake__drop-action">
        {sourcePhotoCount > 0 ? 'Add More Photos' : 'Choose Photos'}
      </span>
    </label>
  )
}

function BackstockPhotoWorkflow({
  generationBlockedMessage,
  startModeHasPhotos,
}: {
  generationBlockedMessage: string | null
  startModeHasPhotos: boolean
}) {
  const steps = [
    {
      copy: 'Add multiple shelf views before generating the draft.',
      title: startModeHasPhotos ? 'Queue looks active' : 'Queue photos',
    },
    {
      copy: generationBlockedMessage
        ? 'Connect grouped draft generation once backend uploads are ready.'
        : 'Build a first pass from the queued photo set.',
      title: generationBlockedMessage ? 'Generation pending' : 'Generate grouped draft',
    },
    {
      copy: 'Adjust product matches and full-bottle counts before the snapshot.',
      title: 'Review and submit',
    },
  ]

  return (
    <ol className="bt-backstock-intake__workflow">
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className="bt-backstock-intake__workflow-step">{index + 1}</span>
          <div>
            <p className="bt-backstock-intake__workflow-title">{step.title}</p>
            <p className="bt-backstock-intake__workflow-copy">{step.copy}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function BackstockPhotoTray({
  onRemoveSourcePhoto,
  sourcePhotos,
}: {
  onRemoveSourcePhoto: (sourcePhotoId: string) => void
  sourcePhotos: BackstockSourcePhoto[]
}) {
  return (
    <div aria-label="Selected source photos" className="bt-backstock-photo-tray">
      {sourcePhotos.map((sourcePhoto, index) => (
        <BackstockPhotoTrayCard
          index={index}
          key={sourcePhoto.id}
          onRemoveSourcePhoto={onRemoveSourcePhoto}
          sourcePhoto={sourcePhoto}
        />
      ))}
    </div>
  )
}

function BackstockPhotoTrayCard({
  index,
  onRemoveSourcePhoto,
  sourcePhoto,
}: {
  index: number
  onRemoveSourcePhoto: (sourcePhotoId: string) => void
  sourcePhoto: BackstockSourcePhoto
}) {
  return (
    <div className="bt-backstock-photo-card">
      <div className="bt-backstock-photo-card__preview">
        <div className="bt-backstock-photo-card__placeholder">
          <p className="bt-backstock-photo-card__placeholder-step">
            Frame {String(index + 1).padStart(2, '0')}
          </p>
          <p className="bt-backstock-photo-card__placeholder-note">
            {sourcePhoto.file ? 'Queued for draft generation' : 'Restored draft'}
          </p>
        </div>
        <button
          className="bt-backstock-photo-card__remove"
          onClick={() => onRemoveSourcePhoto(sourcePhoto.id)}
          type="button"
        >
          Remove
        </button>
      </div>
      <div className="bt-backstock-photo-card__body">
        <p className="bt-backstock-photo-card__name">{sourcePhoto.name}</p>
        <p className="bt-backstock-photo-card__meta">
          {formatBytes(sourcePhoto.sizeBytes)}
          {sourcePhoto.file === null ? ' • restored from this browser session' : ''}
        </p>
      </div>
    </div>
  )
}

function BackstockPhotoActions({
  canGenerateDraft,
  generationBlockedMessage,
  generatingDraft,
  hasGeneratedDraft,
  needsDraftRegeneration,
  onGenerateDraft,
}: {
  canGenerateDraft: boolean
  generationBlockedMessage: string | null
  generatingDraft: boolean
  hasGeneratedDraft: boolean
  needsDraftRegeneration: boolean
  onGenerateDraft: () => void
}) {
  return (
    <div className="bt-backstock-intake__actions">
      <div className="bt-backstock-intake__actions-copy">
        <p className="bt-backstock-intake__actions-title">
          {generationBlockedMessage
            ? 'Photo-generated drafts are pending backend support.'
            : hasGeneratedDraft
            ? 'The queued photo set already has a draft.'
            : 'Generate a grouped first pass when the queue looks right.'}
        </p>
        {generationBlockedMessage ? (
          <p aria-live="polite" className="bt-field__hint bt-field__hint--warning">
            {generationBlockedMessage}
          </p>
        ) : needsDraftRegeneration ? (
          <p aria-live="polite" className="bt-field__hint bt-field__hint--warning">
            Source photos changed. Regenerate the draft before submitting.
          </p>
        ) : (
          <p className="bt-field__hint">
            Photos are optional, but they are always part of the initial draft flow when
            you use them.
          </p>
        )}
      </div>
      <Button
        disabled={!canGenerateDraft || generatingDraft}
        onPress={onGenerateDraft}
        variant="secondary"
      >
        {generationBlockedMessage
          ? 'Generation Pending'
          : generatingDraft
          ? 'Generating Draft…'
          : hasGeneratedDraft
            ? 'Regenerate Draft'
            : 'Generate Draft'}
      </Button>
    </div>
  )
}
