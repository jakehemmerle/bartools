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
  Title,
} from '@mantine/core'
import { useSearchParams } from 'react-router-dom'
import { StatePanel } from '../components/states/state-panel'
import { inventoryScenarios } from '../lib/fixtures/scenarios'
import {
  buildLowStockExportCsv,
  createExportFilename,
  downloadCsvFile,
} from '../lib/export/csv'
import { sortLowStockRows, type LowStockSort } from '../lib/inventory-view'

export function LowStockPage() {
  const [searchParams] = useSearchParams()
  const source =
    searchParams.get('scenario') === 'empty'
      ? inventoryScenarios.empty
      : inventoryScenarios.default
  const [sort, setSort] = useState<LowStockSort>('urgency')
  const rows = useMemo(
    () => sortLowStockRows(source.rows.filter((row) => row.belowPar), sort),
    [sort, source.rows],
  )
  const handleExport = () => {
    downloadCsvFile(
      createExportFilename('low-stock', source.barSettings.timezone),
      buildLowStockExportCsv(rows, source.barSettings.timezone),
    )
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <Stack gap={2}>
          <Title order={1}>Low Stock</Title>
          <Text c="dimmed">
            Products that have fallen below the stock targets set for the bar.
          </Text>
        </Stack>
        <Button color="ink" onClick={handleExport} radius="sm" variant="light">
          Export CSV
        </Button>
      </Group>

      <Paper p="md" radius="md" withBorder>
        <Group justify="flex-end">
          <Select
            data={[
              { label: 'Biggest gap first', value: 'urgency' },
              { label: 'Newest counts first', value: 'as-of' },
              { label: 'Product name', value: 'name' },
            ]}
            label="Sort"
            onChange={(value) => setSort((value as LowStockSort | null) ?? 'urgency')}
            value={sort}
            w={240}
          />
        </Group>
      </Paper>

      {rows.length === 0 ? (
        <StatePanel
          description="Nothing is below par in the displayed latest-confirmed dataset."
          title="No products need attention"
        />
      ) : (
        <>
          <StatePanel
            description="Low-stock status is operationally useful, but it still inherits the recency of the underlying confirmed product rows."
            title="Latest-confirmed queue"
            tone="warning"
          />
          <Paper p="md" radius="md" withBorder>
            <ScrollArea>
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Product</Table.Th>
                    <Table.Th>On hand</Table.Th>
                    <Table.Th>PAR</Table.Th>
                    <Table.Th>Reason</Table.Th>
                    <Table.Th>As of</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.map((row) => (
                    <Table.Tr key={row.productId}>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text fw={600}>{row.productName}</Text>
                          <Text c="dimmed" size="sm">
                            {row.category}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>{row.displayQuantityLabel}</Table.Td>
                      <Table.Td>
                        {row.parComparableAmount}
                        {' '}
                        {row.comparableUnit === 'ml' ? 'ml' : 'bottles'}
                      </Table.Td>
                      <Table.Td>
                        <Badge color="brass" radius="sm" variant="light">
                          {row.belowParReason ?? 'Below stock target'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{new Date(row.asOf).toLocaleDateString()}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </>
      )}
    </Stack>
  )
}
