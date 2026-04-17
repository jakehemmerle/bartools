import type { PropsWithChildren } from 'react'
import { ReportsClientProvider } from '../lib/reports/provider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ReportsClientProvider>{children}</ReportsClientProvider>
  )
}
