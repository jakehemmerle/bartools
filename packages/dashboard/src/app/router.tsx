import { createBrowserRouter, Navigate, Outlet, type RouteObject } from 'react-router-dom'
import { PublicShell } from '../components/layout/public-shell'
import { WorkbenchShell } from '../components/layout/authenticated-shell'
import { LandingPage } from '../pages/auth-pages'
import { ReportDetailPage, ReportsPage } from '../pages/reports-page'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <PublicShell>
        <LandingPage />
      </PublicShell>
    ),
  },
  {
    element: (
      <WorkbenchShell>
        <Outlet />
      </WorkbenchShell>
    ),
    children: [
      { path: '/reports', element: <ReportsPage /> },
      { path: '/reports/:reportId', element: <ReportDetailPage /> },
    ],
  },
  { path: '/inventory', element: <Navigate replace to="/reports" /> },
  { path: '/low-stock', element: <Navigate replace to="/reports" /> },
  { path: '/settings', element: <Navigate replace to="/reports" /> },
  { path: '/sign-in', element: <Navigate replace to="/reports" /> },
  { path: '/sign-up', element: <Navigate replace to="/reports" /> },
  { path: '/reset-password', element: <Navigate replace to="/reports" /> },
  { path: '/onboarding/create', element: <Navigate replace to="/reports" /> },
  { path: '/onboarding/join', element: <Navigate replace to="/reports" /> },
  { path: '*', element: <Navigate replace to="/reports" /> },
]

export const appRouter = createBrowserRouter(appRoutes)
