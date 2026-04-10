import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { Link, useNavigate } from 'react-router-dom'
import { PublicPageHeader } from '../components/layout/public-shell'
import { StatePanel } from '../components/states/state-panel'
import { useFixtureSession } from '../lib/fixture-session'

export function LandingPage() {
  return (
    <Stack gap="xl">
      <PublicPageHeader
        description="See what you have on hand, spot what needs restocking, and look back at recent counts without living in a spreadsheet."
        eyebrow="For bars that count often"
        title="A calmer back office for bar inventory."
      />

      <Group gap="sm">
        <Button color="ink" component={Link} radius="sm" to="/sign-up">
          Create an account
        </Button>
        <Button
          color="olive"
          component={Link}
          radius="sm"
          to="/sign-in"
          variant="light"
        >
          Sign in
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <StatePanel
          description="Open the dashboard and get a clear read on what is in stock right now."
          title="Inspect stock quickly"
        />
        <StatePanel
          description="See which products need attention before service turns into a scramble."
          title="See what needs attention"
          tone="warning"
        />
        <StatePanel
          description="Look back at recent counts, photos, and updates in one place."
          title="Audit a count later"
        />
      </SimpleGrid>
    </Stack>
  )
}

function AuthFormShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Stack gap="lg" maw={460}>
      <BoxHeading description={description} title={title} />
      {children}
      {footer}
    </Stack>
  )
}

function BoxHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Stack gap="xs">
      <Title order={2}>{title}</Title>
      <Text c="dimmed">{description}</Text>
    </Stack>
  )
}

export function SignInPage() {
  const navigate = useNavigate()
  const { signInAs } = useFixtureSession()

  return (
    <AuthFormShell
      description="Sign in to check stock, review recent counts, and keep the bar moving."
      footer={
        <Text c="dimmed" size="sm">
          Need access?
          {' '}
          <Anchor component={Link} to="/sign-up">
            Create an account
          </Anchor>
        </Text>
      }
      title="Sign in"
    >
      <TextInput label="Email" placeholder="avery@thechallenger.example" />
      <PasswordInput label="Password" placeholder="Enter your password" />
      <Group justify="space-between">
        <Anchor component={Link} size="sm" to="/reset-password">
          Forgot password?
        </Anchor>
        <Button
          color="ink"
          onClick={() => {
            signInAs('manager')
            navigate('/inventory')
          }}
          radius="sm"
        >
          Sign in
        </Button>
      </Group>
    </AuthFormShell>
  )
}

export function SignUpPage() {
  const navigate = useNavigate()

  return (
    <AuthFormShell
      description="Create your account, set up your bar, or join the one your team already uses."
      footer={
        <Text c="dimmed" size="sm">
          Already have an account?
          {' '}
          <Anchor component={Link} to="/sign-in">
            Sign in
          </Anchor>
        </Text>
      }
      title="Create your account"
    >
      <TextInput label="Work email" placeholder="avery@thechallenger.example" />
      <PasswordInput label="Password" placeholder="Choose a password" />
      <Button
        color="ink"
        onClick={() => navigate('/onboarding/create')}
        radius="sm"
      >
        Continue to setup
      </Button>
    </AuthFormShell>
  )
}

export function PasswordResetPage() {
  return (
    <AuthFormShell
      description="We will email you a secure link so you can get back into your account."
      title="Reset your password"
    >
      <TextInput label="Email" placeholder="avery@thechallenger.example" />
      <Button color="ink" radius="sm">
        Email reset link
      </Button>
      <Text c="dimmed" size="sm">
        Use the email address tied to your bartools account.
      </Text>
    </AuthFormShell>
  )
}
