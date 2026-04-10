import {
  Badge,
  Button,
  Group,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { Link, useSearchParams } from 'react-router-dom'
import { StatePanel } from '../components/states/state-panel'
import { inventoryScenarios } from '../lib/fixtures/scenarios'

function getInventoryScenario(name: string | null) {
  switch (name) {
    case 'empty':
      return inventoryScenarios.empty
    case 'stale':
      return inventoryScenarios.stale
    case 'staff':
      return inventoryScenarios.staff
    default:
      return inventoryScenarios.default
  }
}

export function InventoryPage() {
  const [searchParams] = useSearchParams()
  const scenario = getInventoryScenario(searchParams.get('scenario'))

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <Stack gap={2}>
          <Title order={1}>Inventory</Title>
          <Text c="dimmed">
            Latest confirmed inventory by product. Rows may come from different
            confirmed sessions and different dates.
          </Text>
        </Stack>
        <Button color="ink" radius="sm" variant="light">
          Export CSV
        </Button>
      </Group>

      <Paper p="md" radius="md" withBorder>
        <Group align="end" grow>
          <TextInput
            defaultValue=""
            label="Search by product name"
            placeholder="Search inventory"
          />
          <Select
            data={[
              { label: 'All products', value: 'all' },
              { label: 'Below par only', value: 'below-par' },
            ]}
            defaultValue="all"
            label="Filter"
          />
          <Select
            data={[
              { label: 'Product name', value: 'name' },
              { label: 'On-hand quantity', value: 'quantity' },
              { label: 'As of date', value: 'as-of' },
            ]}
            defaultValue="name"
            label="Sort"
          />
        </Group>
      </Paper>

      <StatePanel
        description="This table is a latest-confirmed aggregate, not a live stock feed or single-session snapshot. Use the row-level as-of dates to judge freshness."
        title="Mixed recency is expected"
        tone={searchParams.get('scenario') === 'stale' ? 'warning' : 'neutral'}
      />

      {scenario.rows.length === 0 ? (
        <StatePanel
          description="There is no inventory to show yet. Once the first count is confirmed, it will appear here."
          title="No inventory yet"
        />
      ) : (
        <ScrollArea>
          <Table highlightOnHover striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Product</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>On hand</Table.Th>
                <Table.Th>PAR</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>As of</Table.Th>
                <Table.Th>Session</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {scenario.rows.map((row) => (
                <Table.Tr key={row.productId}>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text fw={600}>{row.productName}</Text>
                      <Text c="dimmed" size="sm">
                        UPC {row.upc}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>{row.category ?? 'Uncategorized'}</Table.Td>
                  <Table.Td>{row.displayQuantityLabel ?? row.onHandComparableAmount}</Table.Td>
                  <Table.Td>
                    {row.parComparableAmount}
                    {' '}
                    {row.comparableUnit === 'ml' ? 'ml' : 'bottles'}
                  </Table.Td>
                  <Table.Td>
                    {row.belowPar ? (
                      <Badge color="brass" radius="sm" variant="light">
                        Below par
                      </Badge>
                    ) : (
                      <Badge color="olive" radius="sm" variant="light">
                        In range
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text>{new Date(row.asOf).toLocaleDateString()}</Text>
                      {isStale(row.asOf) ? (
                        <Text c="brass.8" size="sm">
                          Stale
                        </Text>
                      ) : null}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    {row.latestSessionId ? (
                      <Text
                        c="ink.7"
                        component={Link}
                        fw={600}
                        style={{ textDecoration: 'none' }}
                        to={`/sessions/${row.latestSessionId}`}
                      >
                        {row.latestSessionId}
                      </Text>
                    ) : (
                      <Text c="dimmed">None</Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}
    </Stack>
  )
}

function isStale(asOf: string) {
  const ageMs = Date.now() - new Date(asOf).getTime()
  return ageMs > 14 * 24 * 60 * 60 * 1000
}
