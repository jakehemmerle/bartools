import {
  Anchor,
  Button,
  Group,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { StatePanel } from '../components/states/state-panel'
import { useFixtureSession } from '../lib/fixture-session'

export function OnboardingCreatePage() {
  const navigate = useNavigate()
  const { signInAs } = useFixtureSession()

  return (
    <Stack gap="lg" maw={560}>
      <Title order={2}>Create your bar</Title>
      <Text c="dimmed">
        Set your timezone and stock target so your team starts with the right baseline.
      </Text>
      <Group grow>
        <TextInput label="Bar name" placeholder="The Challenger" />
        <Select
          data={['America/Chicago', 'America/New_York', 'America/Los_Angeles']}
          defaultValue="America/Chicago"
          label="Timezone"
        />
      </Group>
      <TextInput
        defaultValue="1500"
        label="Default PAR"
        rightSection={<Text size="xs">ml</Text>}
      />
      <Group justify="space-between">
        <Anchor component={Link} to="/onboarding/join">
          Joining an existing bar?
        </Anchor>
        <Button
          color="ink"
          onClick={() => {
            signInAs('manager')
            navigate('/inventory')
          }}
          radius="sm"
        >
          Finish setup
        </Button>
      </Group>
    </Stack>
  )
}

export function OnboardingJoinPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signInAs } = useFixtureSession()
  const state = searchParams.get('state') ?? 'default'

  return (
    <Stack gap="lg" maw={560}>
      <Title order={2}>Join an existing bar</Title>
      <Text c="dimmed">
        Additional employees join through a manager-generated invite link.
      </Text>
      <TextInput
        defaultValue="https://bartools.app/join/invite-123"
        label="Invite link"
      />
      {state === 'failure' ? (
        <StatePanel
          description="The invite may be expired, invalid, or already used. Keep the failure state calm and actionable."
          title="Invite link could not be used"
          tone="danger"
        />
      ) : (
        <StatePanel
          description="Use the invite from your manager to connect this account to your bar."
          title="Ready to join"
        />
      )}
      <Group justify="space-between">
        <Radio.Group defaultValue="join" label="Onboarding path">
          <Group mt="xs">
            <Radio label="Join existing bar" value="join" />
            <Radio label="Create new bar" value="create" />
          </Group>
        </Radio.Group>
        <Button
          color="ink"
          onClick={() => {
            signInAs('staff')
            navigate('/inventory?persona=staff')
          }}
          radius="sm"
        >
          Join bar
        </Button>
      </Group>
    </Stack>
  )
}
