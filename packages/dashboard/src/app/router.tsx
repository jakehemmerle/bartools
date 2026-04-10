import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicShell } from '../components/layout/public-shell'
import { AuthenticatedShell } from '../components/layout/authenticated-shell'
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
import { SessionDetailPage, SessionsPage } from '../pages/sessions-page'
import { SettingsPage } from '../pages/settings-page'

export const appRouter = createBrowserRouter([
  {
    element: <PublicShell />,
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
    element: <AuthenticatedShell />,
    children: [
      { path: '/inventory', element: <InventoryPage /> },
      { path: '/low-stock', element: <LowStockPage /> },
      { path: '/sessions', element: <SessionsPage /> },
      { path: '/sessions/:sessionId', element: <SessionDetailPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate replace to="/" /> },
])
