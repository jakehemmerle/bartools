import { useLocation } from 'react-router-dom'
import { AppWordmark } from '../../primitives/app-wordmark'
import { Button } from '../../primitives/button'

export function WorkbenchTopBar() {
  const location = useLocation()
  const backTarget = location.pathname === '/reports' ? '/' : '/reports'

  return (
    <header className="bb-workbench-topbar">
      <Button aria-label="Go back" className="bb-workbench-topbar__back" to={backTarget} variant="ghost">
        <span aria-hidden="true">←</span>
      </Button>
      <AppWordmark centered />
      <div className="bb-workbench-topbar__spacer" aria-hidden="true" />
    </header>
  )
}
