import {
  Button,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core'
import { Link } from 'react-router-dom'
import { PublicPageHeader } from '../components/layout/public-shell'
import { StatePanel } from '../components/states/state-panel'

export function LandingPage() {
  return (
    <Stack gap="xl">
      <PublicPageHeader
        description="Scan recent reports, understand where a count stands, and inspect bottle records before a review is finalized."
        eyebrow="Reports workbench"
        title="Track report progress and saved bottle records."
      />

      <Button color="slate" component={Link} radius="sm" to="/reports" w="fit-content">
        Open reports
      </Button>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <StatePanel
          description="See whether a report is created, processing, unreviewed, or already finalized."
          title="Check report state"
        />
        <StatePanel
          description="Compare inferred records, failed captures, and final saved values in one place."
          title="Inspect record outcomes"
          tone="warning"
        />
        <StatePanel
          description="Prepare bottle matches and fill levels before a review is submitted."
          title="Prepare review corrections"
        />
      </SimpleGrid>
      <Text c="dimmed" size="sm">
        Live report loading will connect here once venue and user context are available.
      </Text>
    </Stack>
  )
}
