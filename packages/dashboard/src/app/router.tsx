import { createBrowserRouter, Navigate, Outlet, type RouteObject } from 'react-router-dom'
import { PublicShell } from '../components/shell/public/public-shell'
import { WorkbenchShell } from '../components/shell/workbench/workbench-shell'
import { BackstockReportCreateRoute } from '../features/backstock/routes/backstock-report-create-route'
import { EntryRoute } from '../features/reports/routes/entry-route'
import { ReportDetailRoute } from '../features/reports/routes/report-detail-route'
import { ReportsRoute } from '../features/reports/routes/reports-route'
import { ReviewEntryRoute } from '../features/reports/routes/review-entry-route'
import { ReviewReportBlockedRoute } from '../features/reports/routes/review-report-blocked-route'
import { ReviewReportComparisonRoute } from '../features/reports/routes/review-report-comparison-route'
import { ReviewReportCreatedRoute } from '../features/reports/routes/review-report-created-route'
import { ReviewReportFailedRoute } from '../features/reports/routes/review-report-failed-route'
import { ReviewReportNotFoundRoute } from '../features/reports/routes/review-report-not-found-route'
import { ReviewReportProcessingRoute } from '../features/reports/routes/review-report-processing-route'
import { ReviewReportReviewedRoute } from '../features/reports/routes/review-report-reviewed-route'
import { ReviewReportUnreviewedRoute } from '../features/reports/routes/review-report-unreviewed-route'
import { ReviewReportsEmptyRoute } from '../features/reports/routes/review-reports-empty-route'
import { ReviewReportsListRoute } from '../features/reports/routes/review-reports-list-route'
import type { ReportsClient } from '../lib/reports/client'
import {
  createBackstockCreateLoader,
  createReportDetailLoader,
  createReportsListLoader,
} from '../lib/reports/route-loaders'
import { getDashboardVenueId } from '../lib/reports/runtime-config'

export function createAppRoutes(reportsClient: ReportsClient): RouteObject[] {
  const backstockVenueId = getDashboardVenueId()

  return [
    {
      path: '/',
      element: (
        <PublicShell>
          <EntryRoute />
        </PublicShell>
      ),
    },
    {
      path: '/__review/entry',
      element: (
        <PublicShell>
          <ReviewEntryRoute />
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
        {
          path: '/reports',
          loader: createReportsListLoader(reportsClient),
          element: <ReportsRoute />,
        },
        {
          path: '/reports/backstock/new',
          loader: createBackstockCreateLoader(reportsClient, backstockVenueId),
          element: <BackstockReportCreateRoute />,
        },
        {
          path: '/reports/:reportId',
          loader: createReportDetailLoader(reportsClient),
          element: <ReportDetailRoute />,
        },
        { path: '/__review/reports/list', element: <ReviewReportsListRoute /> },
        { path: '/__review/reports/empty', element: <ReviewReportsEmptyRoute /> },
        { path: '/__review/report/created', element: <ReviewReportCreatedRoute /> },
        { path: '/__review/report/processing', element: <ReviewReportProcessingRoute /> },
        { path: '/__review/report/unreviewed', element: <ReviewReportUnreviewedRoute /> },
        { path: '/__review/report/reviewed', element: <ReviewReportReviewedRoute /> },
        { path: '/__review/report/comparison', element: <ReviewReportComparisonRoute /> },
        { path: '/__review/report/failed', element: <ReviewReportFailedRoute /> },
        { path: '/__review/report/blocked', element: <ReviewReportBlockedRoute /> },
        { path: '/__review/report/not-found', element: <ReviewReportNotFoundRoute /> },
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
}

export function createAppRouter(reportsClient: ReportsClient) {
  return createBrowserRouter(createAppRoutes(reportsClient))
}
