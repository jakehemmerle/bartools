import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['.expo', 'node_modules', 'android', 'ios']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        __DEV__: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],
    },
  },
  // React Native animation/gesture patterns use useRef(...).current at render
  // time (Animated.Value, PanResponder) — this is standard RN practice.
  {
    files: ['components/FillLevelSlider.tsx', 'components/PourPacifier.tsx', 'app/(tabs)/index.tsx'],
    rules: {
      'react-hooks/refs': 'off',
    },
  },
])
