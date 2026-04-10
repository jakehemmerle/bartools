import type { ReactNode } from 'react'
import { Box, Button, Group, Paper, Text, Title } from '@mantine/core'

const toneStyles = {
  neutral: {
    background: '#fffdf8',
    borderColor: 'rgba(61, 76, 73, 0.1)',
  },
  warning: {
    background: '#fff7eb',
    borderColor: 'rgba(204, 123, 21, 0.2)',
  },
  danger: {
    background: '#fff1ee',
    borderColor: 'rgba(171, 79, 50, 0.2)',
  },
} as const

type Tone = keyof typeof toneStyles

export function StatePanel({
  title,
  description,
  tone = 'neutral',
  action,
}: {
  title: string
  description: string
  tone?: Tone
  action?: ReactNode
}) {
  return (
    <Paper
      p="lg"
      radius="md"
      style={{
        background: toneStyles[tone].background,
        border: `1px solid ${toneStyles[tone].borderColor}`,
      }}
    >
      <Title order={3} size="h4">
        {title}
      </Title>
      <Text c="dimmed" mt="xs">
        {description}
      </Text>
      {action ? <Box mt="md">{action}</Box> : null}
    </Paper>
  )
}

export function StateAction({
  label,
}: {
  label: string
}) {
  return (
    <Group>
      <Button color="ink" radius="sm" variant="light">
        {label}
      </Button>
    </Group>
  )
}
