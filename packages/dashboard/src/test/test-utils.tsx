import type { PropsWithChildren, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProviders } from '../app/providers'

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
