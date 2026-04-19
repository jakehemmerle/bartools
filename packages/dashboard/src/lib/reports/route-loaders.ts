import type { LoaderFunctionArgs } from 'react-router-dom'
import type { LocationListItem, ReportDetail, ReportListItem } from '@bartools/types'
import type { ReportsClient } from './client'
import { dashboardFixtureVenueId } from './runtime-config'

export type ReportsListRouteData = {
  loadResult: Promise<ReportsListLoadResult>
}

export type ReportDetailRouteData = {
  loadResult: Promise<ReportDetailLoadResult>
}

export type BackstockCreateRouteData = {
  loadResult: Promise<BackstockCreateLoadResult>
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

export type BackstockCreateLoadResult =
  | {
      locations: LocationListItem[]
      status: 'loaded'
    }
  | {
      errorMessage: string
      status: 'error'
    }

const reportsLoadErrorMessage = 'Reports could not be loaded right now. Try again in a moment.'
const backstockLocationsLoadErrorMessage =
  'Backstock locations could not be loaded right now. Try again in a moment.'

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

export function createBackstockCreateLoader(
  client: ReportsClient,
  venueId: string | undefined,
) {
  return function backstockCreateLoader(): BackstockCreateRouteData {
    return {
      loadResult: client
        .listVenueLocations(venueId ?? dashboardFixtureVenueId)
        .then(
          (locations): BackstockCreateLoadResult => ({
            locations,
            status: 'loaded',
          }),
        )
        .catch(
          (): BackstockCreateLoadResult => ({
            errorMessage: backstockLocationsLoadErrorMessage,
            status: 'error',
          }),
        ),
    }
  }
}
