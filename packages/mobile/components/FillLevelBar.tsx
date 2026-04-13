import { View, StyleSheet } from 'react-native'
import { useTheme } from '../theme/useTheme'

interface FillLevelBarProps {
  fillPercent: number
  height?: number
}

export function FillLevelBar({ fillPercent, height = 6 }: Readonly<FillLevelBarProps>) {
  const theme = useTheme()

  const clampedFill = Math.max(0, Math.min(100, fillPercent))
  let fillColor: string
  if (clampedFill > 50) fillColor = theme.tertiary
  else if (clampedFill >= 20) fillColor = theme.primary
  else fillColor = theme.error

  return (
    <View style={[styles.track, { height, backgroundColor: theme.surfaceContainerHighest }]}>
      <View style={[styles.fill, { width: `${clampedFill}%`, backgroundColor: fillColor }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
})
