/* eslint-disable react-refresh/only-export-components */
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
  type RouteObject,
} from 'react-router-dom'
import { PublicShell } from '../components/layout/public-shell'
import { AuthenticatedShell } from '../components/layout/authenticated-shell'
import {
  resolvePersonaOverride,
  useFixtureSession,
} from '../lib/fixture-session'
import {
  LandingPage,
  PasswordResetPage,
  SignInPage,
  SignUpPage,
} from '../pages/auth-pages'
import { InventoryPage } from '../pages/inventory-page'
import { LowStockPage } from '../pages/low-stock-page'
import {
  OnboardingCreatePage,
  OnboardingJoinPage,
} from '../pages/onboarding-pages'
import { ReportDetailPage, ReportsPage } from '../pages/reports-page'
import { SettingsPage } from '../pages/settings-page'

export const appRoutes: RouteObject[] = [
  {
    element: <PublicRouteGate />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/sign-up', element: <SignUpPage /> },
      { path: '/reset-password', element: <PasswordResetPage /> },
      { path: '/onboarding/create', element: <OnboardingCreatePage /> },
      { path: '/onboarding/join', element: <OnboardingJoinPage /> },
    ],
  },
  {
    element: <AuthenticatedRouteGate />,
    children: [
      { path: '/inventory', element: <InventoryPage /> },
      { path: '/low-stock', element: <LowStockPage /> },
      { path: '/reports', element: <ReportsPage /> },
      { path: '/reports/:reportId', element: <ReportDetailPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate replace to="/" /> },
]

export const appRouter = createBrowserRouter(appRoutes)

function PublicRouteGate() {
  const { persona } = useFixtureSession()
  const location = useLocation()
  const effectivePersona = resolvePersonaOverride(location.search, persona)
  const isAuthEntryRoute =
    location.pathname === '/sign-in' ||
    location.pathname === '/sign-up' ||
    location.pathname === '/reset-password'

  if (effectivePersona !== 'signed_out' && isAuthEntryRoute) {
    return <Navigate replace to="/inventory" />
  }

  return (
    <PublicShell>
      <Outlet />
    </PublicShell>
  )
}

function AuthenticatedRouteGate() {
  const { persona } = useFixtureSession()
  const location = useLocation()
  const effectivePersona = resolvePersonaOverride(location.search, persona)

  if (effectivePersona === 'signed_out') {
    return <Navigate replace to="/sign-in" />
  }

  return (
    <AuthenticatedShell>
      <Outlet />
    </AuthenticatedShell>
  )
}
