import type { Meta, StoryObj } from '@storybook/react-vite'
import { SurfaceCard } from './surface-card'

const meta = {
  title: 'Primitives/SurfaceCard',
  component: SurfaceCard,
  args: {
    tone: 'low',
  },
  render: (args) => (
    <SurfaceCard {...args} style={{ maxWidth: '480px', padding: '24px' }}>
      <div style={{ display: 'grid', gap: '8px' }}>
        <strong style={{ fontFamily: 'var(--font-label)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Report summary
        </strong>
        <span>12 photos processed</span>
        <span style={{ color: 'var(--color-text-muted)' }}>
          Uses the shared surface tokens without turning into a route-level story.
        </span>
      </div>
    </SurfaceCard>
  ),
} satisfies Meta<typeof SurfaceCard>

export default meta

type Story = StoryObj<typeof meta>

export const LowTone: Story = {}

export const CanvasTone: Story = {
  args: {
    tone: 'canvas',
  },
}

export const HighTone: Story = {
  args: {
    tone: 'high',
  },
}
