import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Text,
  Title,
} from '@mantine/core'
import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

export function PublicShell({ children }: PropsWithChildren) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(153, 164, 99, 0.16), transparent 32%), linear-gradient(180deg, #f6f3ea 0%, #eeebe3 100%)',
      }}
    >
      <Container size="lg" px="lg" py="lg">
        <Group justify="space-between" wrap="wrap" mb="xl">
          <Box>
            <Text c="ink.7" fw={700} size="sm" tt="uppercase">
              bartools
            </Text>
            <Text c="dimmed" size="sm">
              Bar inventory, minus the spreadsheet sprawl.
            </Text>
          </Box>
          <Group gap="sm">
            <Anchor component={Link} fw={600} to="/sign-in">
              Sign in
            </Anchor>
            <Button color="ink" component={Link} radius="sm" to="/sign-up">
              Start free
            </Button>
          </Group>
        </Group>
        <Paper
          px={{ base: 'lg', md: 'xl' }}
          py={{ base: 'lg', md: 'xl' }}
          radius="lg"
          shadow="sm"
          style={{
            background: 'rgba(255, 252, 247, 0.88)',
            border: '1px solid rgba(61, 76, 73, 0.08)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  )
}

export function PublicPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <Box mb="xl">
      <Text c="olive.8" fw={700} size="sm" tt="uppercase">
        {eyebrow}
      </Text>
      <Title order={1} mt="xs" maw={720}>
        {title}
      </Title>
      <Text c="dimmed" mt="md" maw={620} size="lg">
        {description}
      </Text>
    </Box>
  )
}
