import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './select'

const meta = {
  title: 'Primitives/Select',
  component: Select,
  args: {
    label: 'Location',
    defaultValue: 'main',
  },
  render: (args) => (
    <div style={{ minWidth: '280px' }}>
      <Select {...args}>
        <option value="main">Main Bar</option>
        <option value="backstock">Backstock</option>
        <option value="service">Service Well</option>
      </Select>
    </div>
  ),
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const HiddenLabel: Story = {
  args: {
    hideLabel: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
