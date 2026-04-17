import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/providers'
import { createAppRouter } from './app/router'
import { createDefaultReportsClient } from './lib/reports/provider'
import './features/reports/reports-workbench.css'

function App() {
  const [reportsClient] = useState(() => createDefaultReportsClient())
  const [router] = useState(() => createAppRouter(reportsClient))

  return (
    <AppProviders reportsClient={reportsClient}>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

export default App
