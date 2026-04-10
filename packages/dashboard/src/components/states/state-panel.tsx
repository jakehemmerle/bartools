import type { ReactNode } from 'react'
import { Box, Button, Group, Paper, Text, Title } from '@mantine/core'

const toneStyles = {
  neutral: {
    background: '#fbfaf7',
    borderColor: 'rgba(49, 78, 94, 0.12)',
  },
  warning: {
    background: '#f8f0e5',
    borderColor: 'rgba(181, 121, 61, 0.24)',
  },
  danger: {
    background: '#f7ece8',
    borderColor: 'rgba(159, 75, 67, 0.22)',
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
      <Button color="slate" radius="sm" variant="light">
        {label}
      </Button>
    </Group>
  )
}
