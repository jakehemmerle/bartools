import {
  Badge,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useSearchParams } from 'react-router-dom'
import { StatePanel } from '../components/states/state-panel'
import { settingsScenarios } from '../lib/fixtures/scenarios'

export function SettingsPage() {
  const [searchParams] = useSearchParams()
  const scenario =
    searchParams.get('scenario') === 'restricted'
      ? settingsScenarios.restricted
      : settingsScenarios.manager
  const canManage = scenario.user.canManageBar

  return (
    <Stack gap="lg">
      <Stack gap={2}>
        <Title order={1}>Settings</Title>
        <Text c="dimmed">
          Bar configuration, PAR management, and lightweight team access.
        </Text>
      </Stack>

      {!canManage ? (
        <StatePanel
          description="Non-managers can review context but cannot change bar-wide settings, PAR overrides, or invite access."
          title="Manager permission required"
        />
      ) : null}

      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>Bar settings</Title>
            <Badge color={canManage ? 'olive' : 'ink'} radius="sm" variant="light">
              {canManage ? 'Manager view' : 'Restricted view'}
            </Badge>
          </Group>
          <Group grow align="end">
            <TextInput
              defaultValue={scenario.barSettings.timezone}
              disabled={!canManage}
              label="Timezone"
            />
            <TextInput
              defaultValue={String(
                scenario.barSettings.defaultParComparableAmount,
              )}
              disabled={!canManage}
              label="Default PAR"
              rightSection={
                <Text size="xs">{scenario.barSettings.defaultParComparableUnit}</Text>
              }
            />
            <Button color="ink" disabled={!canManage} radius="sm">
              Save settings
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          <Title order={3}>Product PAR overrides</Title>
          <ScrollArea>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Product</Table.Th>
                  <Table.Th>UPC</Table.Th>
                  <Table.Th>Override</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {scenario.overrides.map((override) => (
                  <Table.Tr key={override.productId}>
                    <Table.Td>{override.productName}</Table.Td>
                    <Table.Td>{override.upc}</Table.Td>
                    <Table.Td>
                      {override.parComparableAmount}
                      {' '}
                      {override.parComparableUnit}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Stack>
      </Paper>

      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>Team access</Title>
            <Button color="ink" disabled={!canManage} radius="sm" variant="light">
              Generate invite link
            </Button>
          </Group>

          {scenario.inviteLink ? (
            <StatePanel
              description={scenario.inviteLink.url}
              title="Latest invite link"
            />
          ) : null}

          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Member</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Access</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {scenario.members.map((member) => (
                <Table.Tr key={member.userId}>
                  <Table.Td>{member.displayName ?? 'Unnamed user'}</Table.Td>
                  <Table.Td>{member.email}</Table.Td>
                  <Table.Td>
                    {member.canManageBar ? 'Manager' : 'Staff'}
                  </Table.Td>
                  <Table.Td>
                    <Button
                      color="olive"
                      disabled={!canManage || member.canManageBar}
                      radius="sm"
                      size="xs"
                      variant="light"
                    >
                      Grant manager
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  )
}
