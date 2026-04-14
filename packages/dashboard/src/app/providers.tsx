import type { PropsWithChildren } from 'react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { FixtureSessionProvider } from '../lib/fixture-session'
import { ReportsClientProvider } from '../lib/reports/provider'
import { dashboardTheme } from './theme'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <FixtureSessionProvider>
      <ReportsClientProvider>
        <MantineProvider defaultColorScheme="light" theme={dashboardTheme}>
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
      </ReportsClientProvider>
    </FixtureSessionProvider>
  )
}
