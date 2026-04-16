import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/providers'
import { appRouter } from './app/router'
import './features/reports/reports-workbench.css'

function App() {
  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  )
}

export default App
