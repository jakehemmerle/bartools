import { View, Text, Pressable, Image, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { ReportBottleRecord } from '@bartools/types'
import { resolveImageUrl } from '../lib/api'
import { useTheme } from '../theme/useTheme'
import { FillLevelBar } from './FillLevelBar'

interface RecordCardProps {
  record: ReportBottleRecord
  onEdit: () => void
  editedFill?: number
  editedName?: string
}

const STATUS_COLORS: Record<string, { bg: string; fg: string; icon: string }> = {
  inferred: { bg: '#22c55e22', fg: '#22c55e', icon: 'check-circle' },
  failed: { bg: '#ef444422', fg: '#ef4444', icon: 'alert-circle' },
  reviewed: { bg: '#3b82f622', fg: '#3b82f6', icon: 'check-decagram' },
  pending: { bg: '#a8a29e22', fg: '#a8a29e', icon: 'clock-outline' },
}

export function RecordCard({ record, onEdit, editedFill, editedName }: Readonly<RecordCardProps>) {
  const theme = useTheme()
  const fillPercent = editedFill ?? record.fillPercent
  const bottleName = editedName ?? record.bottleName
  const statusStyle = STATUS_COLORS[record.status] ?? STATUS_COLORS.pending

  return (
    <View style={[styles.card, { backgroundColor: theme.surfaceContainerHigh }]}>
      <View style={styles.row}>
        {/* Thumbnail */}
        <Image
          source={{ uri: resolveImageUrl(record.imageUrl) }}
          style={[styles.thumbnail, { backgroundColor: theme.surfaceContainer }]}
        />

        {/* Details */}
        <View style={styles.details}>
          <Text style={[styles.name, { color: theme.onSurface }]} numberOfLines={1}>
            {bottleName}
          </Text>
          {record.category ? (
            <View style={[styles.categoryBadge, { backgroundColor: theme.surfaceContainerLow }]}>
              <Text style={[styles.categoryText, { color: theme.onSurfaceVariant }]}>
                {record.category.toUpperCase()}
              </Text>
            </View>
          ) : null}
          {record.status === 'failed' && record.errorMessage ? (
            <Text style={[styles.errorText, { color: theme.error }]} numberOfLines={1}>
              {record.errorMessage}
            </Text>
          ) : null}
        </View>

        {/* Status + edit */}
        <View style={styles.actions}>
          <View style={[styles.statusDot, { backgroundColor: statusStyle.bg }]}>
            <MaterialCommunityIcons
              name={statusStyle.icon as 'check-circle'}
              size={18}
              color={statusStyle.fg}
            />
          </View>
          <Pressable
            onPress={onEdit}
            hitSlop={8}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Edit ${bottleName}`}
          >
            <MaterialCommunityIcons name="pencil-outline" size={18} color={theme.primary} />
          </Pressable>
        </View>
      </View>

      {/* Fill bar */}
      <View style={styles.fillRow}>
        <FillLevelBar fillPercent={fillPercent} />
        <Text style={[styles.fillText, { color: theme.onSurfaceVariant }]}>
          {fillPercent}%
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  details: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: 'bold',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  categoryText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 9,
    fontWeight: '500',
  },
  errorText: {
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  actions: {
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fillText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
})
