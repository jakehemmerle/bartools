export const lightTokens = {
  // Light mode inverts the dark-first design. Use these approximations:
  background: '#FAFAF9',
  surfaceDim: '#FAFAF9',
  surface: '#FAFAF9',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F5F5F4',
  surfaceContainer: '#EFEDEC',
  surfaceContainerHigh: '#E8E6E5',
  surfaceContainerHighest: '#E3E1E0',
  surfaceBright: '#FAFAF9',
  surfaceVariant: '#E8E6E5',
  primary: '#8B501D',
  primaryContainer: '#FFDCC5',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#301400',
  secondary: '#474747',
  secondaryContainer: '#C8C6C6',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#1B1C1C',
  tertiary: '#006E15',
  tertiaryContainer: '#72FF70',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#002203',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',
  onErrorContainer: '#410002',
  onBackground: '#1C1B1B',
  onSurface: '#1C1B1B',
  onSurfaceVariant: '#524439',
  outline: '#847469',
  outlineVariant: '#D8C3B4',
  inverseSurface: '#313030',
  inverseOnSurface: '#F5F0EF',
  inversePrimary: '#FFB782',
  surfaceTint: '#8B501D',
  text: '#1C1B1B',
  textMuted: '#524439',
  border: '#D8C3B4',
} as const

export const darkTokens = {
  background: '#131313',
  surfaceDim: '#131313',
  surface: '#131313',
  surfaceContainerLowest: '#0E0E0E',
  surfaceContainerLow: '#1C1B1B',
  surfaceContainer: '#20201F',
  surfaceContainerHigh: '#2A2A2A',
  surfaceContainerHighest: '#353535',
  surfaceBright: '#393939',
  surfaceVariant: '#353535',
  primary: '#FFB782',
  primaryContainer: '#C7804A',
  onPrimary: '#4F2500',
  onPrimaryContainer: '#452000',
  secondary: '#C8C6C6',
  secondaryContainer: '#474747',
  onSecondary: '#303030',
  onSecondaryContainer: '#B6B5B4',
  tertiary: '#00E639',
  tertiaryContainer: '#00A827',
  onTertiary: '#003907',
  onTertiaryContainer: '#003205',
  error: '#FFB4AB',
  errorContainer: '#93000A',
  onError: '#690005',
  onErrorContainer: '#FFDAD6',
  onBackground: '#E5E2E1',
  onSurface: '#E5E2E1',
  onSurfaceVariant: '#D8C3B4',
  outline: '#A08D80',
  outlineVariant: '#524439',
  inverseSurface: '#E5E2E1',
  inverseOnSurface: '#313030',
  inversePrimary: '#8B501D',
  surfaceTint: '#FFB782',
  text: '#E5E2E1',
  textMuted: '#A08D80',
  border: '#524439',
} as const

export type ThemeTokens = { [K in keyof typeof darkTokens]: string }

// Typography tokens
export const typography = {
  displayFont: 'Newsreader',     // For display and headlines - serif, editorial
  bodyFont: 'Manrope',           // For body and titles - clean sans-serif
  labelFont: 'SpaceGrotesk',     // For labels, measurements, metadata - technical
} as const

// Spacing scale (density-independent pixels)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const

// Border radius tokens
export const radii = {
  none: 0,
  sm: 2,       // 0.125rem - default for buttons/inputs (precision tool feel)
  md: 4,       // 0.25rem - standard
  lg: 8,       // 0.5rem
  xl: 12,      // 0.75rem - large containers only
  full: 9999,  // pill shapes for chips
} as const
