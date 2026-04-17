import type { PropsWithChildren, ReactNode } from 'react'
import { render } from '@testing-library/react'
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
} from 'react-router-dom'
import { AppProviders } from '../app/providers'
import { appRoutes } from '../app/router'
import type { ReportsClient } from '../lib/reports/client'

export function renderWithProviders(
  ui: ReactNode,
  {
    initialEntries = ['/'],
    reportsClient,
  }: { initialEntries?: string[]; reportsClient?: ReportsClient } = {},
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <AppProviders reportsClient={reportsClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </AppProviders>
    )
  }

  return render(ui, { wrapper: Wrapper })
}

export function renderAppRoutes({
  initialEntries = ['/'],
  reportsClient,
}: {
  initialEntries?: string[]
  reportsClient?: ReportsClient
} = {}) {
  const router = createMemoryRouter(appRoutes, { initialEntries })

  return render(
    <AppProviders reportsClient={reportsClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}
