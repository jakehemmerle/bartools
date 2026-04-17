import type { LoaderFunctionArgs } from 'react-router-dom'
import type { ReportDetail, ReportListItem } from '@bartools/types'
import type { ReportsClient } from './client'

export type ReportsListRouteData = {
  loadResult: Promise<ReportsListLoadResult>
}

export type ReportDetailRouteData = {
  loadResult: Promise<ReportDetailLoadResult>
}

export type ReportsListLoadResult =
  | {
      status: 'loaded'
      reports: ReportListItem[]
    }
  | {
      errorMessage: string
      status: 'error'
    }

export type ReportDetailLoadResult =
  | {
      detail: ReportDetail | null
      status: 'loaded'
    }
  | {
      status: 'error'
    }

const reportsLoadErrorMessage = 'Reports could not be loaded right now. Try again in a moment.'

export function createReportsListLoader(client: ReportsClient) {
  return function reportsListLoader(): ReportsListRouteData {
    return {
      loadResult: client
        .listReports()
        .then(
          (reports): ReportsListLoadResult => ({
            reports,
            status: 'loaded',
          }),
        )
        .catch(
          (): ReportsListLoadResult => ({
            errorMessage: reportsLoadErrorMessage,
            status: 'error',
          }),
        ),
    }
  }
}

export function createReportDetailLoader(client: ReportsClient) {
  return function reportDetailLoader({
    params,
  }: LoaderFunctionArgs): ReportDetailRouteData {
    const reportId = params.reportId ?? ''

    return {
      loadResult: client
        .getReport(reportId)
        .then(
          (detail): ReportDetailLoadResult => ({
            detail,
            status: 'loaded',
          }),
        )
        .catch(
          (): ReportDetailLoadResult => ({
            status: 'error',
          }),
        ),
    }
  }
}
