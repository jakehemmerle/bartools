/* eslint-disable react-refresh/only-export-components */
import type { PropsWithChildren } from 'react'
import { createContext, useContext, useState } from 'react'
import { createFixtureReportsClient, type ReportsClient } from './client'

const ReportsClientContext = createContext<ReportsClient | null>(null)

export function ReportsClientProvider({
  children,
  client,
}: PropsWithChildren<{ client?: ReportsClient }>) {
  const [resolvedClient] = useState<ReportsClient>(() => client ?? createFixtureReportsClient())

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
