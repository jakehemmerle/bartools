import { View, Text, Pressable, Switch, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { useTheme } from '../theme/useTheme'

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

interface SettingsRowProps {
  type: 'header' | 'nav' | 'toggle' | 'link'
  label: string
  description?: string
  value?: boolean
  detail?: string
  iconName?: IconName
  onPress?: () => void
  onToggle?: (value: boolean) => void
  background?: string
}

export function SettingsRow({ type, label, description, value, detail, iconName, onPress, onToggle, background }: Readonly<SettingsRowProps>) {
  const theme = useTheme()

  if (type === 'header') {
    return (
      <View style={styles.headerRow}>
        <Text style={[styles.headerLabel, { color: theme.primary }]}>{label}</Text>
      </View>
    )
  }

  if (type === 'toggle') {
    return (
      <View style={[styles.row, { backgroundColor: background ?? theme.surfaceContainer }]}>
        {iconName ? (
          <MaterialCommunityIcons name={iconName} size={22} color={theme.outline} />
        ) : null}
        <View style={styles.rowContent}>
          <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
          {description ? (
            <Text style={[styles.description, { color: theme.outline }]}>{description}</Text>
          ) : null}
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: theme.surfaceContainerHighest, true: theme.tertiary }}
          thumbColor={theme.onSurface}
        />
      </View>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: background ?? theme.surfaceContainerLow, opacity: pressed ? 0.8 : 1 },
      ]}
      accessible
      accessibilityRole={type === 'link' ? 'link' : 'button'}
      accessibilityLabel={label}
    >
      {iconName ? (
        <MaterialCommunityIcons name={iconName} size={22} color={theme.outline} />
      ) : null}
      <View style={styles.rowContent}>
        <Text style={[styles.label, { color: type === 'link' ? theme.primary : theme.text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, { color: theme.outline }]}>{description}</Text>
        ) : null}
      </View>
      {detail ? (
        <Text style={[styles.detail, { color: theme.textMuted }]}>{detail}</Text>
      ) : null}
      {type === 'nav' ? (
        <MaterialCommunityIcons name="chevron-right" size={22} color={theme.outline} />
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  headerRow: {
    paddingTop: 24,
    paddingBottom: 0,
    marginBottom: 24,
  },
  headerLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase' as const,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 52,
    gap: 16,
    borderRadius: 0,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  description: {
    fontFamily: 'Manrope',
    fontSize: 14,
    lineHeight: 20,
  },
  detail: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    fontWeight: '500',
  },
})
