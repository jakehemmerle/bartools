import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: {
    children: 'Start review',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const LinkStyle: Story = {
  args: {
    to: '/reports',
    variant: 'secondary',
    children: 'View reports',
  },
}
