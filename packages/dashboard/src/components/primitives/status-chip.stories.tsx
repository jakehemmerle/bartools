import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusChip } from './status-chip'

const meta = {
  title: 'Primitives/StatusChip',
  component: StatusChip,
  args: {
    status: 'processing',
  },
} satisfies Meta<typeof StatusChip>

export default meta

type Story = StoryObj<typeof meta>

export const ReportStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <StatusChip status="created" />
      <StatusChip status="processing" />
      <StatusChip status="unreviewed" />
      <StatusChip status="reviewed" />
    </div>
  ),
}

export const RecordStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      <StatusChip status="pending" />
      <StatusChip status="inferred" />
      <StatusChip status="failed" />
      <StatusChip status="reviewed" />
    </div>
  ),
}
