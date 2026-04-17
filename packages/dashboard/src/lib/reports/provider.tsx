/* eslint-disable react-refresh/only-export-components */
import type { PropsWithChildren } from 'react'
import { createContext, useContext, useState } from 'react'
import { createBackendReportsClient } from './backend-client'
import { createFixtureReportsClient, type ReportsClient } from './client'
import {
  getDashboardRuntimeConfig,
  type DashboardRuntimeConfig,
} from './runtime-config'

const ReportsClientContext = createContext<ReportsClient | null>(null)

export function createDefaultReportsClient(
  runtimeConfig: DashboardRuntimeConfig = getDashboardRuntimeConfig(),
): ReportsClient {
  return runtimeConfig.reportsMode === 'backend'
    ? createBackendReportsClient({ baseUrl: runtimeConfig.backendBaseUrl })
    : createFixtureReportsClient()
}

export function ReportsClientProvider({
  children,
  client,
}: PropsWithChildren<{ client?: ReportsClient }>) {
  const [resolvedClient] = useState<ReportsClient>(() => client ?? createDefaultReportsClient())

  return (
    <ReportsClientContext.Provider value={resolvedClient}>
      {children}
    </ReportsClientContext.Provider>
  )
}

export function useReportsClient() {
  const client = useContext(ReportsClientContext)

  if (!client) {
    throw new Error('ReportsClientProvider is required for reports pages.')
  }

  return client
}
