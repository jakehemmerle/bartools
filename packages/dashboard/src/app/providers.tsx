import type { PropsWithChildren } from 'react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { dashboardTheme } from './theme'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <MantineProvider defaultColorScheme="light" theme={dashboardTheme}>
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  )
}
