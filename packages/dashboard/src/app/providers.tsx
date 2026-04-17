import type { PropsWithChildren } from 'react'
import type { ReportsClient } from '../lib/reports/client'
import { ReportsClientProvider } from '../lib/reports/provider'

export function AppProviders({
  children,
  reportsClient,
}: PropsWithChildren<{ reportsClient?: ReportsClient }>) {
  return (
    <ReportsClientProvider client={reportsClient}>{children}</ReportsClientProvider>
  )
}
