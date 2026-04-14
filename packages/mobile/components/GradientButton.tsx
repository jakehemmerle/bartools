import { View, Text, Pressable, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { useTheme } from '../theme/useTheme'

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

interface GradientButtonProps {
  label: string
  onPress?: () => void
  disabled?: boolean
  variant?: 'primary' | 'text'
  iconName?: IconName
}

export function GradientButton({ label, onPress, disabled = false, variant = 'primary', iconName }: Readonly<GradientButtonProps>) {
  const theme = useTheme()

  if (variant === 'text') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.textBtn, { opacity: pressed ? 0.6 : 1 }]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {iconName ? <MaterialCommunityIcons name={iconName} size={18} color={theme.textMuted} /> : null}
        <Text style={[styles.textLabel, { color: theme.textMuted }]}>{label}</Text>
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primary,
        {
          backgroundColor: pressed ? theme.primaryContainer : theme.primary,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {iconName ? <MaterialCommunityIcons name={iconName} size={18} color={theme.onPrimary} /> : null}
      <Text style={[styles.primaryLabel, { color: theme.onPrimary }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  primary: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    gap: 8,
  },
  primaryLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  textBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    gap: 8,
  },
  textLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
})
