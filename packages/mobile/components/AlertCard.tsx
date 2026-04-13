import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../theme/useTheme'
import { FillLevelBar } from './FillLevelBar'

interface AlertCardProps {
  bottleName: string
  location: string
  fillPercent: number
  parThreshold: number
}

export function AlertCard({ bottleName, location, fillPercent, parThreshold }: Readonly<AlertCardProps>) {
  const theme = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceBright }]}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{bottleName}</Text>
          <Text style={[styles.location, { color: theme.onSurfaceVariant }]}>{location}</Text>
        </View>
        <View style={styles.levels}>
          <Text style={[styles.fill, { color: theme.error }]}>
            {fillPercent}% Left
          </Text>
          <Text style={[styles.par, { color: theme.outline }]}>PAR: {parThreshold}%</Text>
        </View>
      </View>
      <FillLevelBar fillPercent={fillPercent} height={4} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '600',
  },
  location: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  levels: {
    alignItems: 'flex-end',
    gap: 2,
  },
  fill: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 14,
    fontWeight: '700',
  },
  par: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
})
