import {
  Badge,
  Card,
  Group,
  Image,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { Link, useParams } from 'react-router-dom'
import { StatePanel } from '../components/states/state-panel'
import { sessionsScenario } from '../lib/fixtures/scenarios'

export function SessionsPage() {
  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={1}>Sessions</Title>
        <Text c="dimmed">
          Review completed inventory sessions and inspect the final saved bottle
          records later.
        </Text>
      </Stack>
      <Paper p="md" radius="md" withBorder>
        <ScrollArea>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Session</Table.Th>
                <Table.Th>Completed</Table.Th>
                <Table.Th>User</Table.Th>
                <Table.Th>Bottle count</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sessionsScenario.sessions.map((session) => (
                <Table.Tr key={session.id}>
                  <Table.Td>
                    <Text
                      c="ink.7"
                      component={Link}
                      fw={600}
                      style={{ textDecoration: 'none' }}
                      to={`/sessions/${session.id}`}
                    >
                      {session.id}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {session.completedAt
                      ? new Date(session.completedAt).toLocaleString()
                      : 'In progress'}
                  </Table.Td>
                  <Table.Td>{session.userDisplayName ?? 'Unknown user'}</Table.Td>
                  <Table.Td>{session.bottleCount}</Table.Td>
                  <Table.Td>
                    <Badge
                      color={session.status === 'failed' ? 'brass' : 'olive'}
                      radius="sm"
                      variant="light"
                    >
                      {session.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Stack>
  )
}

export function SessionDetailPage() {
  const { sessionId = 'session-1001' } = useParams()
  const detail =
    sessionsScenario.details[sessionId] ?? sessionsScenario.details['session-1001']

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={1}>Session {detail.id}</Title>
        <Text c="dimmed">
          Review the photos, bottle details, and any updates made before the count was saved.
        </Text>
      </Stack>

      <Paper p="md" radius="md" withBorder>
        <Group gap="xl" wrap="wrap">
          <Text>
            Completed:
            {' '}
            {detail.completedAt
              ? new Date(detail.completedAt).toLocaleString()
              : 'Not completed'}
          </Text>
          <Text>User: {detail.userDisplayName ?? 'Unknown user'}</Text>
          <Badge color="olive" radius="sm" variant="light">
            {detail.status}
          </Badge>
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {detail.bottleRecords.map((record) => (
          <Card key={record.id} padding="lg" radius="md" withBorder>
            {record.imageUrl ? (
              <Image
                alt={record.bottleName}
                h={180}
                mb="md"
                radius="sm"
                src={record.imageUrl}
              />
            ) : (
              <StatePanel
                description="The rest of the session stays usable even when a photo is missing or expired."
                title="Image unavailable"
              />
            )}

            <Stack gap="xs" mt={record.imageUrl ? 0 : 'md'}>
              <Title order={3} size="h4">
                {record.bottleName}
              </Title>
              <Text c="dimmed">
                {record.category ?? 'Uncategorized'}
                {' • '}
                {record.fillPercent}
                % full
              </Text>

              {record.corrected && record.originalModelOutput && record.correctedValues ? (
                <Paper bg="#fff7eb" p="sm" radius="sm" withBorder>
                  <Text fw={600} mb={4} size="sm">
                    Corrected values
                  </Text>
                  <Text size="sm">
                    Model:
                    {' '}
                    {record.originalModelOutput.bottleName ?? 'Unknown'}
                    {' / '}
                    {record.originalModelOutput.fillPercent ?? 'n/a'}
                    %
                  </Text>
                  <Text size="sm">
                    Saved:
                    {' '}
                    {record.correctedValues.bottleName ?? 'Unknown'}
                    {' / '}
                    {record.correctedValues.fillPercent ?? 'n/a'}
                    %
                  </Text>
                </Paper>
              ) : null}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {sessionId !== 'session-missing-media' ? (
        <Text c="dimmed" size="sm">
          Review the missing-media fallback at
          {' '}
          <Text
            component={Link}
            fw={600}
            inherit
            style={{ textDecoration: 'none' }}
            to="/sessions/session-missing-media"
          >
            /sessions/session-missing-media
          </Text>
          .
        </Text>
      ) : null}
    </Stack>
  )
}
