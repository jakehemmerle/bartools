import { Button } from '../../../components/primitives/button'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import { formatBytes } from './backstock-report-formatting'
import type { BackstockSourcePhoto } from '../lib/backstock-draft'

type BackstockPhotoIntakeProps = {
  canGenerateDraft: boolean
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
  hasGeneratedDraft,
  generatingDraft,
  needsDraftRegeneration,
  onGenerateDraft,
  onPhotoFilesSelected,
  onRemoveSourcePhoto,
  sourcePhotos,
}: BackstockPhotoIntakeProps) {
  return (
    <SurfaceCard className="bb-backstock-card bb-backstock-intake" tone="base">
      <BackstockPhotoIntakeHeader sourcePhotoCount={sourcePhotos.length} />

      <div className="bb-backstock-intake__stage">
        <BackstockPhotoDropzone
          onPhotoFilesSelected={onPhotoFilesSelected}
          sourcePhotoCount={sourcePhotos.length}
        />
        <BackstockPhotoWorkflow startModeHasPhotos={sourcePhotos.length > 0} />
      </div>

      {sourcePhotos.length > 0 ? (
        <BackstockPhotoTray
          onRemoveSourcePhoto={onRemoveSourcePhoto}
          sourcePhotos={sourcePhotos}
        />
      ) : (
        <p className="bb-field__hint">
          Queue one or more images to generate the initial grouped draft.
        </p>
      )}

      <BackstockPhotoActions
        canGenerateDraft={canGenerateDraft}
        generatingDraft={generatingDraft}
        hasGeneratedDraft={hasGeneratedDraft}
        needsDraftRegeneration={needsDraftRegeneration}
        onGenerateDraft={onGenerateDraft}
      />
    </SurfaceCard>
  )
}

function BackstockPhotoIntakeHeader({
  sourcePhotoCount,
}: {
  sourcePhotoCount: number
}) {
  const queueLabel =
    sourcePhotoCount === 1 ? '1 frame queued' : `${sourcePhotoCount} frames queued`

  return (
    <div className="bb-backstock-intake__header">
      <div>
        <p className="bb-backstock-intake__eyebrow">Photo-Assisted Draft</p>
        <h2 className="bb-backstock-card__title">Photo Staging</h2>
        <p className="bb-backstock-card__support">
          Stage several shelf or storage photos from one location, then generate a
          grouped first draft to review below.
        </p>
      </div>
      <div className="bb-backstock-intake__summary">
        <p className="bb-backstock-intake__summary-value">{queueLabel}</p>
        <p className="bb-backstock-intake__summary-note">
          Manual entry stays available if you would rather count without photos.
        </p>
      </div>
    </div>
  )
}

function BackstockPhotoDropzone({
  onPhotoFilesSelected,
  sourcePhotoCount,
}: {
  onPhotoFilesSelected: (files: FileList | null) => void
  sourcePhotoCount: number
}) {
  return (
    <label className="bb-backstock-intake__dropzone" htmlFor="backstock-source-photos">
      <input
        accept="image/*"
        aria-label="Choose Photos"
        className="bb-backstock-intake__input"
        id="backstock-source-photos"
        multiple
        onChange={(event) => onPhotoFilesSelected(event.currentTarget.files)}
        type="file"
      />
      <span className="bb-backstock-intake__drop-eyebrow">Choose Photos</span>
      <span className="bb-backstock-intake__drop-title">
        Stage shelf photos for the first draft
      </span>
      <span className="bb-backstock-intake__drop-support">
        Add a few wide shots of sealed bottles in one backstock area. The draft
        groups likely products and bottle counts before review.
      </span>
      <span className="bb-backstock-intake__drop-action">
        {sourcePhotoCount > 0 ? 'Add More Photos' : 'Choose Photos'}
      </span>
    </label>
  )
}

function BackstockPhotoWorkflow({
  startModeHasPhotos,
}: {
  startModeHasPhotos: boolean
}) {
  const steps = [
    'Add multiple shelf views before generating the draft.',
    'Build a first pass from the queued photo set.',
    'Adjust product matches and full-bottle counts before the snapshot.',
  ]

  return (
    <ol className="bb-backstock-intake__workflow">
      {steps.map((step, index) => (
        <li key={step}>
          <span className="bb-backstock-intake__workflow-step">{index + 1}</span>
          <div>
            <p className="bb-backstock-intake__workflow-title">
              {index === 0
                ? startModeHasPhotos
                  ? 'Queue looks active'
                  : 'Queue photos'
                : index === 1
                  ? 'Generate grouped draft'
                  : 'Review and submit'}
            </p>
            <p className="bb-backstock-intake__workflow-copy">{step}</p>
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
    <div aria-label="Selected source photos" className="bb-backstock-photo-tray">
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
    <div className="bb-backstock-photo-card">
      <div className="bb-backstock-photo-card__preview">
        <div className="bb-backstock-photo-card__placeholder">
          <p className="bb-backstock-photo-card__placeholder-step">
            Frame {String(index + 1).padStart(2, '0')}
          </p>
          <p className="bb-backstock-photo-card__placeholder-note">
            {sourcePhoto.file ? 'Queued for draft generation' : 'Restored draft'}
          </p>
        </div>
        <button
          className="bb-backstock-photo-card__remove"
          onClick={() => onRemoveSourcePhoto(sourcePhoto.id)}
          type="button"
        >
          Remove
        </button>
      </div>
      <div className="bb-backstock-photo-card__body">
        <p className="bb-backstock-photo-card__name">{sourcePhoto.name}</p>
        <p className="bb-backstock-photo-card__meta">
          {formatBytes(sourcePhoto.sizeBytes)}
          {sourcePhoto.file === null ? ' • restored from this browser session' : ''}
        </p>
      </div>
    </div>
  )
}

function BackstockPhotoActions({
  canGenerateDraft,
  generatingDraft,
  hasGeneratedDraft,
  needsDraftRegeneration,
  onGenerateDraft,
}: {
  canGenerateDraft: boolean
  generatingDraft: boolean
  hasGeneratedDraft: boolean
  needsDraftRegeneration: boolean
  onGenerateDraft: () => void
}) {
  return (
    <div className="bb-backstock-intake__actions">
      <div className="bb-backstock-intake__actions-copy">
        <p className="bb-backstock-intake__actions-title">
          {hasGeneratedDraft
            ? 'The queued photo set already has a draft.'
            : 'Generate a grouped first pass when the queue looks right.'}
        </p>
        {needsDraftRegeneration ? (
          <p aria-live="polite" className="bb-field__hint bb-field__hint--warning">
            Source photos changed. Regenerate the draft before submitting.
          </p>
        ) : (
          <p className="bb-field__hint">
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
        {generatingDraft
          ? 'Generating Draft…'
          : hasGeneratedDraft
            ? 'Regenerate Draft'
            : 'Generate Draft'}
      </Button>
    </div>
  )
}
