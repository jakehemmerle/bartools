import { View, Text, Pressable, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'

interface AppHeaderProps {
  onProfilePress?: () => void
}

export function AppHeader({ onProfilePress }: Readonly<AppHeaderProps>) {
  const theme = useTheme()
  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceContainerLow }]}>
      <Text style={[styles.logo, { color: theme.primary }]}>BARBACK</Text>
      <Pressable
        onPress={onProfilePress}
        hitSlop={8}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        <MaterialCommunityIcons name="account-circle" size={32} color={theme.onSurfaceVariant} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  logo: {
    fontFamily: 'Newsreader',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
})
