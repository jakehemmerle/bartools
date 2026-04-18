import { startTransition, Suspense } from 'react'
import { Await, useLoaderData, useRevalidator } from 'react-router-dom'
import { Button } from '../../../components/primitives/button'
import { DelayedFallback } from '../../../components/primitives/delayed-fallback'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import type {
  BackstockCreateLoadResult,
  BackstockCreateRouteData,
} from '../../../lib/reports/route-loaders'
import { BackstockReportCreateScreen } from '../components/backstock-report-create-screen'
import { useBackstockReportCreateState } from './use-backstock-report-create-state'

export function BackstockReportCreateRoute() {
  const { loadResult } = useLoaderData() as BackstockCreateRouteData

  return (
    <Suspense
      fallback={
        <DelayedFallback>
          <BackstockRouteLoadingScreen />
        </DelayedFallback>
      }
    >
      <Await resolve={loadResult}>
        {(result: BackstockCreateLoadResult) => (
          <ResolvedBackstockReportCreateRoute loadResult={result} />
        )}
      </Await>
    </Suspense>
  )
}

function ResolvedBackstockReportCreateRoute({
  loadResult,
}: {
  loadResult: BackstockCreateLoadResult
}) {
  const backstockState = useBackstockReportCreateState()
  const revalidator = useRevalidator()

  if (loadResult.status === 'error') {
    return (
      <BackstockLocationsUnavailableScreen
        errorMessage={loadResult.errorMessage}
        onRetry={() => {
          startTransition(() => {
            revalidator.revalidate()
          })
        }}
      />
    )
  }

  return <BackstockReportCreateScreen {...backstockState} locationOptions={loadResult.locations} />
}

function BackstockRouteLoadingScreen() {
  return (
    <div className="bb-backstock-screen">
      <section className="bb-backstock-header">
        <p className="bb-backstock-header__eyebrow">Reports</p>
        <h1 className="bb-page-title">New Backstock Report</h1>
        <p className="bb-reports-header__support">
          Count sealed bottles in one backstock location. Start from photos or enter line
          items directly.
        </p>
      </section>

      <SurfaceCard className="bb-loading-panel" tone="low">
        <p className="bb-loading-panel__eyebrow">Backstock</p>
        <p className="bb-loading-panel__body">Loading available locations.</p>
      </SurfaceCard>
    </div>
  )
}

function BackstockLocationsUnavailableScreen({
  errorMessage,
  onRetry,
}: {
  errorMessage: string
  onRetry: () => void
}) {
  return (
    <section className="bb-centered-state">
      <div className="bb-centered-state__icon bb-centered-state__icon--blocked" aria-hidden="true">
        <span className="bb-centered-state__icon-core" />
        <span className="bb-centered-state__icon-dot" />
        <span className="bb-centered-state__icon-slash" />
      </div>
      <h1 className="bb-centered-state__title">Backstock Locations Unavailable</h1>
      <p className="bb-centered-state__body">{errorMessage}</p>
      <div className="bb-centered-state__actions">
        <Button onPress={onRetry} variant="secondary">
          Retry
        </Button>
        <Button to="/reports" variant="ghost">
          Back to Reports
        </Button>
      </div>
    </section>
  )
}
