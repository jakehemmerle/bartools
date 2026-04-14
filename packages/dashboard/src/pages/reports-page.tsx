import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { BottleSearchResult, ReportDetail, ReportListItem } from '@bartools/types'
import {
  Badge,
  Button,
  Group,
  Image,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { Link, useParams } from 'react-router-dom'
import { StatePanel } from '../components/states/state-panel'
import { useReportsClient } from '../lib/reports/provider'
import {
  createReportReviewDraft,
  type ReportReviewRecordDraft,
} from '../lib/reports/review-draft'
import {
  applyReportStreamEvent,
  createReportProgress,
  createReportStreamViewState,
} from '../lib/reports/stream'
import { sortReportsNewestFirst } from '../lib/reports-view'

type RecordSearchState = {
  query: string
  results: BottleSearchResult[]
}

export function ReportsPage() {
  const client = useReportsClient()
  const [reports, setReports] = useState<ReportListItem[] | null>(null)

  useEffect(() => {
    let cancelled = false

    void client.listReports().then((nextReports) => {
      if (!cancelled) {
        setReports(nextReports)
      }
    })

    return () => {
      cancelled = true
    }
  }, [client])

  const sortedReports = useMemo(
    () => sortReportsNewestFirst(reports ?? []),
    [reports],
  )

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={1}>Reports</Title>
        <Text c="dimmed">
          Review recent report runs, inspect record outcomes, and prepare final corrections.
        </Text>
      </Stack>

      <StatePanel
        description={client.readiness.message}
        title="Live backend integration is waiting on signed-in venue context"
        tone="warning"
      />

      {!reports ? (
        <StatePanel
          description="Recent reports will appear here as soon as the workbench loads them."
          title="Loading reports"
        />
      ) : sortedReports.length === 0 ? (
        <StatePanel
          description="No reports are available yet."
          title="No reports yet"
        />
      ) : (
        <Paper p="md" radius="md" withBorder>
          <ScrollArea>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Report</Table.Th>
                  <Table.Th>Started</Table.Th>
                  <Table.Th>Completed</Table.Th>
                  <Table.Th>Operator</Table.Th>
                  <Table.Th>Bottles</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedReports.map((report) => (
                  <Table.Tr key={report.id}>
                    <Table.Td>
                      <Text
                        c="slate.7"
                        component={Link}
                        fw={600}
                        style={{ textDecoration: 'none' }}
                        to={`/reports/${report.id}`}
                      >
                        {report.id}
                      </Text>
                    </Table.Td>
                    <Table.Td>{formatReportTimestamp(report.startedAt) ?? 'Not started'}</Table.Td>
                    <Table.Td>
                      {formatReportTimestamp(report.completedAt) ?? 'Not finished'}
                    </Table.Td>
                    <Table.Td>{report.userDisplayName ?? 'Unknown operator'}</Table.Td>
                    <Table.Td>{report.bottleCount}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={getReportBadgeColor(report.status)}
                        radius="sm"
                        variant="light"
                      >
                        {formatReportStatus(report.status)}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      )}
    </Stack>
  )
}

export function ReportDetailPage() {
  const client = useReportsClient()
  const { reportId = '' } = useParams()
  const [detailState, setDetailState] = useState<{
    reportId: string
    detail: ReportDetail | null
  } | null>(null)
  const [reviewDraft, setReviewDraft] = useState<ReportReviewRecordDraft[]>([])
  const [searchState, setSearchState] = useState<Record<string, RecordSearchState>>({})

  useEffect(() => {
    let cancelled = false
    let unsubscribe: () => void = () => undefined

    void client.getReport(reportId).then((nextDetail) => {
      if (cancelled) {
        return
      }

      setDetailState({ reportId, detail: nextDetail })
      setReviewDraft(nextDetail ? createReportReviewDraft(nextDetail) : [])

      if (nextDetail) {
        unsubscribe = client.streamReport(reportId, (event) => {
          setDetailState((currentState) => {
            if (!currentState?.detail) {
              return currentState
            }

            return {
              reportId: currentState.reportId,
              detail: applyReportStreamEvent(
                createReportStreamViewState(currentState.detail),
                event,
              ).detail,
            }
          })
        })
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [client, reportId])

  if (!detailState || detailState.reportId !== reportId) {
    return (
      <StatePanel
        description="The selected report is loading now."
        title="Loading report"
      />
    )
  }

  const detail = detailState.detail

  if (!detail) {
    return (
      <StatePanel
        description="Choose a report from the list to inspect its records."
        title="Report not found"
      />
    )
  }

  const progress = createReportProgress(detail)
  const draftComplete =
    reviewDraft.length > 0 && reviewDraft.every((draft) => Boolean(draft.bottleId))

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={1}>Report {detail.id}</Title>
        <Text c="dimmed">
          Inspect inferred, failed, and corrected records before the final review is submitted.
        </Text>
      </Stack>

      <StatePanel
        description={client.readiness.message}
        title="Live review submission is waiting on signed-in venue context"
        tone="warning"
      />

      <Paper p="md" radius="md" withBorder>
        <Group gap="xl" wrap="wrap">
          <Text>Started: {formatReportTimestamp(detail.startedAt) ?? 'Not started'}</Text>
          <Text>Completed: {formatReportTimestamp(detail.completedAt) ?? 'Not finished'}</Text>
          <Text>Operator: {detail.userDisplayName ?? 'Unknown operator'}</Text>
          <Text>
            Progress: {progress.processedCount}/{progress.photoCount}
          </Text>
          <Badge color={getReportBadgeColor(detail.status)} radius="sm" variant="light">
            {formatReportStatus(detail.status)}
          </Badge>
        </Group>
      </Paper>

      <Stack gap="md">
        {detail.bottleRecords.map((record) => {
          const currentDraft = reviewDraft.find((draft) => draft.id === record.id)
          const currentSearch = searchState[record.id] ?? { query: '', results: [] }

          return (
            <Paper key={record.id} p="md" radius="md" withBorder>
              <Stack gap="md">
                <Group align="flex-start" gap="md" wrap="nowrap">
                  {record.imageUrl ? (
                    <Image
                      alt={record.bottleName}
                      flex={0}
                      h={120}
                      radius="sm"
                      src={record.imageUrl}
                      w={120}
                    />
                  ) : (
                    <Paper
                      bg="var(--mantine-color-gray-0)"
                      p="md"
                      radius="sm"
                      style={{ width: 120, minHeight: 120 }}
                      withBorder
                    >
                      <Stack gap={4} justify="center" h="100%">
                        <Text fw={600} size="sm">
                          Image unavailable
                        </Text>
                        <Text c="dimmed" size="xs">
                          The saved record is still available to review.
                        </Text>
                      </Stack>
                    </Paper>
                  )}

                  <Stack flex={1} gap="xs">
                    <Group justify="space-between" wrap="wrap">
                      <Title order={3} size="h4">
                        {record.bottleName}
                      </Title>
                      <Group gap="xs">
                        <Badge color={getRecordBadgeColor(record.status)} radius="sm" variant="light">
                          {formatReportStatus(record.status)}
                        </Badge>
                        <Badge color="slate" radius="sm" variant="light">
                          {record.fillPercent}% full
                        </Badge>
                      </Group>
                    </Group>

                    <Text c="dimmed" size="sm">
                      {record.category ?? 'Uncategorized'}
                      {record.upc ? ` • UPC ${record.upc}` : ''}
                      {record.volumeMl ? ` • ${record.volumeMl} ml` : ''}
                    </Text>

                    {record.errorMessage ? (
                      <Paper bg="#f7ece8" p="sm" radius="sm" withBorder>
                        <Text fw={600} size="sm">
                          Failed record
                        </Text>
                        <Text c="dimmed" size="sm">
                          {record.errorCode ? `${record.errorCode}: ` : ''}
                          {record.errorMessage}
                        </Text>
                      </Paper>
                    ) : null}

                    {record.originalModelOutput ? (
                      <Paper bg="#f6f4ef" p="sm" radius="sm" withBorder>
                        <Text fw={600} size="sm">
                          Original model output
                        </Text>
                        <Text c="dimmed" size="sm">
                          {formatModelOutput(record.originalModelOutput)}
                        </Text>
                      </Paper>
                    ) : null}

                    {record.corrected && record.correctedValues ? (
                      <Paper bg="#f8f0e5" p="sm" radius="sm" withBorder>
                        <Text fw={600} size="sm">
                          Final corrected values
                        </Text>
                        <Text c="dimmed" size="sm">
                          {formatModelOutput(record.correctedValues)}
                        </Text>
                      </Paper>
                    ) : null}
                  </Stack>
                </Group>

                {detail.status === 'unreviewed' && currentDraft ? (
                  <Paper bg="#fbfaf7" p="sm" radius="sm" withBorder>
                    <Stack gap="sm">
                      <Text fw={600} size="sm">
                        Review draft
                      </Text>
                      <Group align="flex-end" grow>
                        <TextInput
                          label="Find bottle"
                          onChange={(event) =>
                            setSearchState((current) => ({
                              ...current,
                              [record.id]: {
                                ...currentSearch,
                                query: event.currentTarget.value,
                              },
                            }))
                          }
                          placeholder="Search name or UPC"
                          value={currentSearch.query}
                        />
                        <Button
                          color="slate"
                          onClick={() => void handleBottleSearch(record.id, currentSearch.query, client, setSearchState)}
                          radius="sm"
                          variant="light"
                        >
                          Find bottle
                        </Button>
                      </Group>
                      <Group align="flex-end" grow>
                        <Select
                          data={currentSearch.results.map((result) => ({
                            value: result.id,
                            label: `${result.name}${result.volumeMl ? ` • ${result.volumeMl} ml` : ''}`,
                          }))}
                          label="Matched bottle"
                          onChange={(value) =>
                            setReviewDraft((current) =>
                              current.map((draft) =>
                                draft.id === record.id ? { ...draft, bottleId: value } : draft,
                              ),
                            )
                          }
                          placeholder="Choose a bottle"
                          searchable
                          value={currentDraft.bottleId}
                        />
                        <Select
                          data={Array.from({ length: 11 }, (_, value) => ({
                            value: String(value),
                            label: `${value}/10 full`,
                          }))}
                          label="Fill level"
                          onChange={(value) =>
                            setReviewDraft((current) =>
                              current.map((draft) =>
                                draft.id === record.id
                                  ? { ...draft, fillTenths: Number(value ?? draft.fillTenths) }
                                  : draft,
                              ),
                            )
                          }
                          value={String(currentDraft.fillTenths)}
                        />
                      </Group>
                    </Stack>
                  </Paper>
                ) : null}
              </Stack>
            </Paper>
          )
        })}
      </Stack>

      {detail.status === 'unreviewed' ? (
        <Paper p="md" radius="md" withBorder>
          <Stack gap="sm">
            <Title order={3} size="h4">
              Final review
            </Title>
            <Text c="dimmed" size="sm">
              Pick a bottle match and fill level for every record. Submission unlocks once this
              workbench is connected to signed-in venue context.
            </Text>
            {draftComplete ? (
              <Text c="dimmed" size="sm">
                Every record has a draft decision. The final payload is ready, but submit stays
                locked until user context is available.
              </Text>
            ) : (
              <Text c="dimmed" size="sm">
                A decision is still missing for at least one record.
              </Text>
            )}
            <Button color="slate" disabled radius="sm" w="fit-content">
              Submit review
            </Button>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  )
}

async function handleBottleSearch(
  recordId: string,
  query: string,
  client: ReturnType<typeof useReportsClient>,
  setSearchState: Dispatch<SetStateAction<Record<string, RecordSearchState>>>,
) {
  const results = await client.searchBottles(query)

  setSearchState((current) => ({
    ...current,
    [recordId]: {
      query,
      results,
    },
  }))
}

function formatReportTimestamp(value: string | undefined) {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatModelOutput(output: {
  bottleName?: string
  category?: string
  upc?: string
  volumeMl?: number
  fillPercent?: number
}) {
  return [
    output.bottleName ?? 'Unknown bottle',
    output.category,
    output.upc ? `UPC ${output.upc}` : undefined,
    output.volumeMl ? `${output.volumeMl} ml` : undefined,
    output.fillPercent !== undefined ? `${output.fillPercent}% full` : undefined,
  ]
    .filter(Boolean)
    .join(' • ')
}

function getReportBadgeColor(status: string) {
  switch (status) {
    case 'created':
      return 'gray'
    case 'processing':
      return 'slate'
    case 'unreviewed':
      return 'brass'
    case 'reviewed':
      return 'ink'
    default:
      return 'gray'
  }
}

function getRecordBadgeColor(status: string) {
  switch (status) {
    case 'pending':
      return 'gray'
    case 'failed':
      return 'red'
    case 'reviewed':
      return 'ink'
    default:
      return 'slate'
  }
}

function formatReportStatus(status: string) {
  return status.replace('_', ' ')
}
