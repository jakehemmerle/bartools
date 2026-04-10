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
          'radial-gradient(circle at top left, rgba(49, 78, 94, 0.14), transparent 34%), linear-gradient(180deg, #f3f1ec 0%, #ebe8e1 100%)',
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
            <Button color="slate" component={Link} radius="sm" to="/sign-up">
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
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(49, 78, 94, 0.1)',
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
      <Text c="brass.7" fw={700} size="sm" tt="uppercase">
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
