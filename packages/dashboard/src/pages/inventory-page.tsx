import { useMemo, useState } from 'react'
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
import {
  buildInventoryExportCsv,
  createExportFilename,
  downloadCsvFile,
} from '../lib/export/csv'
import {
  filterInventoryRows,
  sortInventoryRows,
  type InventoryFilter,
  type InventorySort,
} from '../lib/inventory-view'

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
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<InventoryFilter>('all')
  const [sort, setSort] = useState<InventorySort>('name')
  const displayedRows = useMemo(
    () => sortInventoryRows(filterInventoryRows(scenario.rows, query, filter), sort),
    [filter, query, scenario.rows, sort],
  )
  const handleExport = () => {
    downloadCsvFile(
      createExportFilename('inventory', scenario.barSettings.timezone),
      buildInventoryExportCsv(displayedRows, scenario.barSettings.timezone),
    )
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <Stack gap={2}>
          <Title order={1}>Inventory</Title>
          <Text c="dimmed">
            Latest confirmed inventory by product. Rows may come from different
            reports and different dates.
          </Text>
        </Stack>
        <Button color="slate" onClick={handleExport} radius="sm" variant="light">
          Export CSV
        </Button>
      </Group>

      <Paper p="md" radius="md" withBorder>
        <Group align="end" grow>
          <TextInput
            onChange={(event) => setQuery(event.currentTarget.value)}
            label="Search by product name"
            placeholder="Search inventory"
            value={query}
          />
          <Select
            data={[
              { label: 'All products', value: 'all' },
              { label: 'Below par only', value: 'below-par' },
            ]}
            label="Filter"
            onChange={(value) => setFilter((value as InventoryFilter | null) ?? 'all')}
            value={filter}
          />
          <Select
            data={[
              { label: 'Product name', value: 'name' },
              { label: 'On-hand quantity', value: 'quantity' },
              { label: 'As of date', value: 'as-of' },
            ]}
            label="Sort"
            onChange={(value) => setSort((value as InventorySort | null) ?? 'name')}
            value={sort}
          />
        </Group>
      </Paper>

      <StatePanel
        description="This table is a latest-confirmed aggregate, not a live stock feed or single-report snapshot. Use the row-level as-of dates to judge freshness."
        title="Mixed recency is expected"
        tone={searchParams.get('scenario') === 'stale' ? 'warning' : 'neutral'}
      />

      {scenario.rows.length === 0 ? (
        <StatePanel
          description="There is no inventory to show yet. Once the first count is confirmed, it will appear here."
          title="No inventory yet"
        />
      ) : displayedRows.length === 0 ? (
        <StatePanel
          description="No products match the current search and filter combination."
          title="No matching products"
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
                <Table.Th>Report</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {displayedRows.map((row) => (
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
                      <Badge color="slate" radius="sm" variant="light">
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
                    {row.latestReportId ? (
                      <Text
                        c="slate.7"
                        component={Link}
                        fw={600}
                        style={{ textDecoration: 'none' }}
                        to={`/reports/${row.latestReportId}`}
                      >
                        {row.latestReportId}
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
