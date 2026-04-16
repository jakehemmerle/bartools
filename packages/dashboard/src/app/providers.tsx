import type { PropsWithChildren } from 'react'
import { FixtureSessionProvider } from '../lib/fixture-session'
import { ReportsClientProvider } from '../lib/reports/provider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <FixtureSessionProvider>
      <ReportsClientProvider>
        {children}
      </ReportsClientProvider>
    </FixtureSessionProvider>
  )
}
