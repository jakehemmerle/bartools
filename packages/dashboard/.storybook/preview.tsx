import type { Preview } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import '../src/index.css'
import '../src/features/reports/reports-workbench.css'

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div
          style={{
            minHeight: '100vh',
            width: '100%',
            background: 'var(--color-bg-app)',
            padding: '32px',
          }}
        >
          <div style={{ margin: '0 auto', maxWidth: '720px' }}>
            <Story />
          </div>
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'centered',
    options: {
      storySort: {
        order: ['Primitives'],
      },
    },
  },
}

export default preview
