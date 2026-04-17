import { startTransition, Suspense } from 'react'
import { Await, useLoaderData, useRevalidator } from 'react-router-dom'
import { DelayedFallback } from '../../../components/primitives/delayed-fallback'
import { ReportsListScreen } from '../components/reports-list-screen'
import type {
  ReportsListLoadResult,
  ReportsListRouteData,
} from '../../../lib/reports/route-loaders'

export function ReportsRoute() {
  const { loadResult } = useLoaderData() as ReportsListRouteData

  return (
    <Suspense
      fallback={
        <DelayedFallback>
          <ReportsListScreen reports={null} />
        </DelayedFallback>
      }
    >
      <Await resolve={loadResult}>
        {(result: ReportsListLoadResult) => <ResolvedReportsRoute loadResult={result} />}
      </Await>
    </Suspense>
  )
}

function ResolvedReportsRoute({
  loadResult,
}: {
  loadResult: ReportsListLoadResult
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
      />
    )
  }

  return <ReportsListScreen reports={loadResult.reports} />
}
