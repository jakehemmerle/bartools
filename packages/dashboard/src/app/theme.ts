import { createTheme } from '@mantine/core'

export const dashboardTheme = createTheme({
  primaryColor: 'olive',
  fontFamily:
    '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
  headings: {
    fontFamily:
      '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
    fontWeight: '600',
  },
  colors: {
    olive: [
      '#f4f5ee',
      '#e6e8d7',
      '#cdd2b1',
      '#b1ba88',
      '#99a463',
      '#899553',
      '#7d8a49',
      '#6b763c',
      '#5d6933',
      '#4d5928',
    ],
    brass: [
      '#f9f3e8',
      '#f1e3c9',
      '#e5c38d',
      '#daa454',
      '#d18a2d',
      '#cc7b15',
      '#b3670a',
      '#9f5904',
      '#8b4a00',
      '#753c00',
    ],
    ink: [
      '#eef2f1',
      '#dde3e1',
      '#bbc8c5',
      '#95aaa7',
      '#758f8a',
      '#637d78',
      '#576f6a',
      '#495c58',
      '#3d4c49',
      '#2f3b39',
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
