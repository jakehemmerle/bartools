import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/components/primitives/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      resolve: {
        alias: {
          '@bartools/types': fileURLToPath(
            new URL('../../types/src/index.ts', import.meta.url),
          ),
        },
      },
    })
  },
}

export default config
