import { useLocation } from 'react-router-dom'
import { useReportsClient } from '../../../lib/reports/provider'
import { AppWordmark } from '../../primitives/app-wordmark'
import { Button } from '../../primitives/button'

export function WorkbenchTopBar() {
  const client = useReportsClient()
  const location = useLocation()
  const backTarget = location.pathname === '/reports' ? '/' : '/reports'
  const isDevMode = import.meta.env.DEV
  const modeLabel = client.readiness.backendEnabled ? 'Live' : 'Fixtures'

  return (
    <header className="bb-workbench-topbar">
      <Button aria-label="Go back" className="bb-workbench-topbar__back" to={backTarget} variant="ghost">
        <span aria-hidden="true">←</span>
      </Button>
      <AppWordmark centered />
      {isDevMode ? (
        <div className="bb-workbench-topbar__mode" aria-label={`Mode: ${modeLabel}`}>
          {modeLabel}
        </div>
      ) : (
        <div className="bb-workbench-topbar__spacer" aria-hidden="true" />
      )}
    </header>
  )
}
