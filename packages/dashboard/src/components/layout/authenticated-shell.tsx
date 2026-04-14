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

const appLinks = [
  { to: '/reports', label: 'Reports' },
]

export function WorkbenchShell({ children }: PropsWithChildren) {
  const [opened, { toggle }] = useDisclosure(false)
  const location = useLocation()

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
          background: '#fbfaf7',
          borderBottom: '1px solid rgba(49, 78, 94, 0.08)',
        }}
      >
        <Group h="100%" justify="space-between" px="lg">
          <Group gap="md">
            <Burger
              aria-label="Toggle workbench navigation"
              hiddenFrom="sm"
              opened={opened}
              onClick={toggle}
              size="sm"
            />
            <Box>
              <Text c="ink.8" fw={700}>
                bartools
              </Text>
              <Text c="dimmed" size="sm">
                Reports workbench
              </Text>
            </Box>
          </Group>
          <Group gap="sm">
            <Badge color="brass" radius="sm" variant="light">
              Review progress and saved records
            </Badge>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          background: '#f6f4ef',
          borderRight: '1px solid rgba(49, 78, 94, 0.08)',
        }}
      >
        <Stack gap="xs">
          <Box px="sm" py="xs">
            <Text c="ink.8" fw={700} size="sm">
              Operator surface
            </Text>
            <Text c="dimmed" size="sm">
              Reports-first until venue context is connected
            </Text>
          </Box>
          <Divider />
          {appLinks.map((link) => {
            const active =
              link.to === '/reports'
                ? location.pathname.startsWith('/reports')
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
            'linear-gradient(180deg, rgba(246, 244, 239, 0.92), rgba(255, 255, 255, 0.98))',
          minHeight: '100vh',
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  )
}
