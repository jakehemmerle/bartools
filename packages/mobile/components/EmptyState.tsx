import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'

interface EmptyStateProps {
  iconName?: string
  title: string
  description: string
}

export function EmptyState({ iconName, title, description }: Readonly<EmptyStateProps>) {
  const theme = useTheme()
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: theme.tertiaryContainer }]}>
        <MaterialCommunityIcons name={iconName ?? 'check-circle'} size={36} color={theme.tertiary} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.textMuted }]}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Newsreader',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
  },
  description: {
    fontFamily: 'Manrope',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
})
