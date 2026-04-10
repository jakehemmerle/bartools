import type { PropsWithChildren, ReactNode } from 'react'
import { render } from '@testing-library/react'
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
} from 'react-router-dom'
import { AppProviders } from '../app/providers'
import { appRoutes } from '../app/router'

export function renderWithProviders(
  ui: ReactNode,
  { initialEntries = ['/'] }: { initialEntries?: string[] } = {},
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <AppProviders>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </AppProviders>
    )
  }

  return render(ui, { wrapper: Wrapper })
}

export function renderAppRoutes({
  initialEntries = ['/'],
}: {
  initialEntries?: string[]
} = {}) {
  const router = createMemoryRouter(appRoutes, { initialEntries })

  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}
