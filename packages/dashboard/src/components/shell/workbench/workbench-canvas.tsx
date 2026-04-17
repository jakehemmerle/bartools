import type { PropsWithChildren } from 'react'

export function WorkbenchCanvas({ children }: PropsWithChildren) {
  return <main className="bb-workbench-canvas">{children}</main>
}
