import { startTransition, Suspense } from 'react'
import { Await, useLoaderData, useRevalidator } from 'react-router-dom'
import { Button } from '../../../components/primitives/button'
import { DelayedFallback } from '../../../components/primitives/delayed-fallback'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import type {
  BackstockCreateLoadResult,
  BackstockCreateRouteData,
} from '../../../lib/reports/route-loaders'
import { useReportsClient } from '../../../lib/reports/provider'
import { BackstockReportCreateScreen } from '../components/backstock-report-create-screen'
import { useBackstockReportCreateState } from './use-backstock-report-create-state'

export function BackstockReportCreateRoute() {
  const { loadResult } = useLoaderData() as BackstockCreateRouteData
  const client = useReportsClient()

  return (
    <Suspense
      fallback={
        <DelayedFallback>
          <BackstockRouteLoadingScreen photoStartDisabled={client.readiness.backendEnabled} />
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

function BackstockRouteLoadingScreen({
  photoStartDisabled,
}: {
  photoStartDisabled: boolean
}) {
  return (
    <div className="bt-backstock-screen">
      <section className="bt-backstock-header">
        <p className="bt-backstock-header__eyebrow">Reports</p>
        <h1 className="bt-page-title">New Backstock Report</h1>
        <p className="bt-reports-header__support">
          {photoStartDisabled
            ? 'Count sealed bottles in one backstock location. Enter line items directly for now.'
            : 'Count sealed bottles in one backstock location. Start from photos or enter line items directly.'}
        </p>
      </section>

      <SurfaceCard className="bt-loading-panel" tone="low">
        <p className="bt-loading-panel__eyebrow">Backstock</p>
        <p className="bt-loading-panel__body">Loading available locations.</p>
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
    <section className="bt-centered-state">
      <div className="bt-centered-state__icon bt-centered-state__icon--blocked" aria-hidden="true">
        <span className="bt-centered-state__icon-core" />
        <span className="bt-centered-state__icon-dot" />
        <span className="bt-centered-state__icon-slash" />
      </div>
      <h1 className="bt-centered-state__title">Backstock Locations Unavailable</h1>
      <p className="bt-centered-state__body">{errorMessage}</p>
      <div className="bt-centered-state__actions">
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
