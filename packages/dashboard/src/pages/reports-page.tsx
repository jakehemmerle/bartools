import { useMemo } from 'react'
import {
  Badge,
  Group,
  Image,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { StatePanel } from '../components/states/state-panel'
import { inventoryScenarios, reportsScenario } from '../lib/fixtures/scenarios'
import { sortReportsNewestFirst } from '../lib/reports-view'

const barTimezone = inventoryScenarios.default.barSettings.timezone

export function ReportsPage() {
  const [searchParams] = useSearchParams()
  const reports = useMemo(
    () =>
      sortReportsNewestFirst(
        searchParams.get('scenario') === 'empty' ? [] : reportsScenario.reports,
      ),
    [searchParams],
  )

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={1}>Reports</Title>
        <Text c="dimmed">
          Review recent inventory counts and inspect what was saved.
        </Text>
      </Stack>

      {reports.length === 0 ? (
        <StatePanel
          description="No inventory reports have been completed yet. Once counts are confirmed, they will appear here."
          title="No completed reports yet"
        />
      ) : (
        <Paper p="md" radius="md" withBorder>
          <ScrollArea>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Report</Table.Th>
                  <Table.Th>Completed</Table.Th>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Bottle count</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {reports.map((report) => (
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
                    <Table.Td>
                      {formatReportTimestamp(
                        report.completedAt ?? report.startedAt,
                        barTimezone,
                      ) ?? 'In progress'}
                    </Table.Td>
                    <Table.Td>{report.userDisplayName ?? 'Unknown user'}</Table.Td>
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
  const { reportId = 'report-1001' } = useParams()
  const detail = reportsScenario.details[reportId]

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={1}>Report {detail.id}</Title>
        <Text c="dimmed">
          Review the saved bottle records from this count and compare any corrected fields when they are available.
        </Text>
      </Stack>

      <Paper p="md" radius="md" withBorder>
        <Group gap="xl" wrap="wrap">
          <Text>
            Completed:
            {' '}
            {formatReportTimestamp(detail.completedAt, barTimezone) ?? 'Not completed'}
          </Text>
          <Text>User: {detail.userDisplayName ?? 'Unknown user'}</Text>
          <Text>Records: {detail.bottleRecords.length}</Text>
          <Badge color={getReportBadgeColor(detail.status)} radius="sm" variant="light">
            {formatReportStatus(detail.status)}
          </Badge>
        </Group>
      </Paper>

      <Stack gap="md">
        {detail.bottleRecords.map((record) => (
          <Paper key={record.id} p="md" radius="md" withBorder>
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
                      The rest of the saved record is still usable.
                    </Text>
                  </Stack>
                </Paper>
              )}

              <Stack flex={1} gap="xs">
                <Group justify="space-between" wrap="wrap">
                  <Title order={3} size="h4">
                    {record.bottleName}
                  </Title>
                  <Badge color="slate" radius="sm" variant="light">
                    {record.fillPercent}% full
                  </Badge>
                </Group>

                <Text c="dimmed" size="sm">
                  {record.category ?? 'Uncategorized'}
                  {record.upc ? ` • UPC ${record.upc}` : ''}
                  {record.volumeMl ? ` • ${record.volumeMl} ml` : ''}
                </Text>

                {record.corrected && record.originalModelOutput && record.correctedValues ? (
                  <Paper bg="#f8f0e5" p="sm" radius="sm" withBorder>
                    <Stack gap={6}>
                      <Text fw={600} size="sm">
                        Corrected values
                      </Text>
                      <Group grow align="flex-start">
                        <Stack gap={2}>
                          <Text c="dimmed" size="xs">
                            Model
                          </Text>
                          <Text size="sm">
                            {record.originalModelOutput.bottleName ?? 'Unknown'}
                            {' • '}
                            {record.originalModelOutput.fillPercent ?? 'n/a'}%
                          </Text>
                        </Stack>
                        <Stack gap={2}>
                          <Text c="dimmed" size="xs">
                            Saved
                          </Text>
                          <Text size="sm">
                            {record.correctedValues.bottleName ?? 'Unknown'}
                            {' • '}
                            {record.correctedValues.fillPercent ?? 'n/a'}%
                          </Text>
                        </Stack>
                      </Group>
                    </Stack>
                  </Paper>
                ) : null}
              </Stack>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Stack>
  )
}

function formatReportTimestamp(value: string | undefined, timezone: string) {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getReportBadgeColor(status: string) {
  switch (status) {
    case 'unreviewed':
      return 'brass'
    case 'processing':
      return 'slate'
    default:
      return 'slate'
  }
}

function formatReportStatus(status: string) {
  return status.replace('_', ' ')
}
