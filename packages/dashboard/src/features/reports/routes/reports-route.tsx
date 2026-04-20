import { startTransition, Suspense, useEffect } from 'react'
import { Await, useLoaderData, useRevalidator } from 'react-router-dom'
import { DelayedFallback } from '../../../components/primitives/delayed-fallback'
import { useReportsClient } from '../../../lib/reports/provider'
import { ReportsListScreen } from '../components/reports-list-screen'
import type {
  ReportsListLoadResult,
  ReportsListRouteData,
} from '../../../lib/reports/route-loaders'

const reportDiscoveryPollIntervalMs = 15_000

export function ReportsRoute() {
  const { loadResult } = useLoaderData() as ReportsListRouteData
  const client = useReportsClient()
  const revalidator = useRevalidator()
  const showBackstockAction = !client.readiness.backendEnabled

  useEffect(() => {
    if (!client.readiness.backendEnabled) {
      return
    }

    const pollTimer = globalThis.setInterval(() => {
      if (revalidator.state !== 'idle') {
        return
      }

      startTransition(() => {
        revalidator.revalidate()
      })
    }, reportDiscoveryPollIntervalMs)

    return () => {
      globalThis.clearInterval(pollTimer)
    }
  }, [client.readiness.backendEnabled, revalidator])

  return (
    <Suspense
      fallback={
        <DelayedFallback>
          <ReportsListScreen reports={null} showBackstockAction={showBackstockAction} />
        </DelayedFallback>
      }
    >
      <Await resolve={loadResult}>
        {(result: ReportsListLoadResult) => (
          <ResolvedReportsRoute
            loadResult={result}
            showBackstockAction={showBackstockAction}
          />
        )}
      </Await>
    </Suspense>
  )
}

function ResolvedReportsRoute({
  loadResult,
  showBackstockAction,
}: {
  loadResult: ReportsListLoadResult
  showBackstockAction: boolean
}) {
  const revalidator = useRevalidator()

  if (loadResult.status === 'error') {
    return (
      <ReportsListScreen
        errorMessage={loadResult.errorMessage}
        onRetry={() => {
          startTransition(() => {
            revalidator.revalidate()
          })
        }}
        reports={null}
        showBackstockAction={showBackstockAction}
      />
    )
  }

  return (
    <ReportsListScreen
      reports={loadResult.reports}
      showBackstockAction={showBackstockAction}
    />
  )
}
