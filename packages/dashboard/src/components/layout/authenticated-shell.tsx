import {
  AppShell,
  Badge,
  Box,
  Burger,
  Divider,
  Group,
  NavLink as MantineNavLink,
  Stack,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import type { PropsWithChildren } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useFixtureSession } from '../../lib/fixture-session'

const appLinks = [
  { to: '/inventory', label: 'Inventory' },
  { to: '/low-stock', label: 'Low Stock' },
  { to: '/sessions', label: 'Sessions' },
  { to: '/settings', label: 'Settings' },
]

export function AuthenticatedShell({ children }: PropsWithChildren) {
  const [opened, { toggle }] = useDisclosure(false)
  const location = useLocation()
  const { persona, signOut } = useFixtureSession()

  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{
        breakpoint: 'sm',
        width: 280,
        collapsed: { mobile: !opened },
      }}
      padding="lg"
    >
      <AppShell.Header
        style={{
          background: '#fffaf2',
          borderBottom: '1px solid rgba(61, 76, 73, 0.08)',
        }}
      >
        <Group h="100%" justify="space-between" px="lg">
          <Group gap="md">
            <Burger
              aria-label="Toggle dashboard navigation"
              hiddenFrom="sm"
              opened={opened}
              onClick={toggle}
              size="sm"
            />
            <Box>
              <Text c="ink.8" fw={700}>
                bartools dashboard
              </Text>
              <Text c="dimmed" size="sm">
                Keep service stocked without spreadsheet sprawl.
              </Text>
            </Box>
          </Group>
          <Group gap="sm">
            <Badge color="olive" radius="sm" variant="light">
              {persona === 'manager' ? 'Manager account' : 'Staff account'}
            </Badge>
            <Badge
              color="ink"
              onClick={signOut}
              radius="sm"
              style={{ cursor: 'pointer' }}
              variant="outline"
            >
              Sign out
            </Badge>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          background: '#f7f5ef',
          borderRight: '1px solid rgba(61, 76, 73, 0.08)',
        }}
      >
        <Stack gap="xs">
          <Box px="sm" py="xs">
            <Text c="ink.8" fw={700} size="sm">
              The Challenger
            </Text>
            <Text c="dimmed" size="sm">
              Austin, TX • America/Chicago
            </Text>
          </Box>
          <Divider />
          {appLinks.map((link) => {
            const active =
              link.to === '/sessions'
                ? location.pathname.startsWith('/sessions')
                : location.pathname.startsWith(link.to)

            return (
              <MantineNavLink
                active={active}
                component={Link}
                key={link.to}
                label={link.label}
                to={link.to}
              />
            )
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main
        style={{
          background:
            'linear-gradient(180deg, rgba(247, 245, 239, 0.88), rgba(255, 252, 247, 0.96))',
          minHeight: '100vh',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
