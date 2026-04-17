import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppWordmark } from './app-wordmark'

const meta = {
  title: 'Primitives/AppWordmark',
  component: AppWordmark,
} satisfies Meta<typeof AppWordmark>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Centered: Story = {
  args: {
    centered: true,
  },
}
