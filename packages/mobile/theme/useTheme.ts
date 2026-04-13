import { useColorScheme } from 'react-native'
import { lightTokens, darkTokens, type ThemeTokens } from './tokens'

export function useTheme(): ThemeTokens {
  const scheme = useColorScheme()
  return scheme === 'dark' ? darkTokens : lightTokens
}
