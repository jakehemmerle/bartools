import type { PropsWithChildren } from 'react'
import { WorkbenchCanvas } from './workbench-canvas'
import { WorkbenchTopBar } from './workbench-top-bar'

export function WorkbenchShell({ children }: PropsWithChildren) {
  return (
    <div className="bb-workbench-shell">
      <WorkbenchTopBar />
      <WorkbenchCanvas>{children}</WorkbenchCanvas>
    </div>
  )
}
