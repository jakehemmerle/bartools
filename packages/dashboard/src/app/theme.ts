import { createTheme } from '@mantine/core'

export const dashboardTheme = createTheme({
  primaryColor: 'slate',
  fontFamily:
    '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
  headings: {
    fontFamily:
      '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontWeight: '600',
  },
  colors: {
    slate: [
      '#edf3f5',
      '#dae4e9',
      '#b5c8d1',
      '#8ca8b5',
      '#64889b',
      '#496f84',
      '#3b5f72',
      '#314e5e',
      '#263f4d',
      '#1d313d',
    ],
    brass: [
      '#fbf5ee',
      '#f3e6d4',
      '#e5c7a0',
      '#d4a066',
      '#c48a4a',
      '#b5793d',
      '#9e6633',
      '#82542b',
      '#664123',
      '#4d311c',
    ],
    ink: [
      '#eef1f3',
      '#dce2e6',
      '#bcc7cf',
      '#98a8b3',
      '#748894',
      '#5f7481',
      '#4e6270',
      '#3d4f5b',
      '#2d3c46',
      '#1f2933',
    ],
  },
  defaultRadius: 'md',
  radius: {
    xs: '6px',
    sm: '8px',
    md: '12px',
    lg: '18px',
    xl: '24px',
  },
})
