import type { PropsWithChildren } from 'react'

export function WorkbenchCanvas({ children }: PropsWithChildren) {
  return <main className="bt-workbench-canvas">{children}</main>
}
