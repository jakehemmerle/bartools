import { Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '../theme/useTheme'

interface FilterChipProps {
  label: string
  active?: boolean
  onPress?: () => void
}

export function FilterChip({ label, active = false, onPress }: Readonly<FilterChipProps>) {
  const theme = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? theme.primary : theme.surfaceContainerHigh,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      hitSlop={4}
    >
      <Text
        style={[
          styles.label,
          { color: active ? theme.onPrimary : theme.onSurfaceVariant },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    minHeight: 36,
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
