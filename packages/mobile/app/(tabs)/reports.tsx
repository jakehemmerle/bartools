import { useCallback, useEffect, useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { listReports } from '../../lib/api'
import { AppHeader } from '../../components/AppHeader'
import { EmptyState } from '../../components/EmptyState'
import { useTheme } from '../../theme/useTheme'
import { typography, spacing, radii } from '../../theme/tokens'
import type { ReportListItem } from '@bartools/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type DateSection = { title: string; data: ReportListItem[] }

function shortId(id: string): string {
  return `#RPT-${id.slice(-4).toUpperCase()}`
}

function formatTime(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function sectionTitle(iso?: string): string {
  if (!iso) return 'Unknown'
  const d = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000)

  const dateStr = d.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  if (diffDays === 0) return `Today, ${dateStr}`
  if (diffDays === 1) return `Yesterday, ${dateStr}`
  return `${diffDays} days ago, ${dateStr}`
}

function groupByDate(reports: ReportListItem[]): DateSection[] {
  const map = new Map<string, ReportListItem[]>()
  for (const r of reports) {
    const key = sectionTitle(r.startedAt)
    const list = map.get(key) ?? []
    list.push(r)
    map.set(key, list)
  }
  return Array.from(map, ([title, data]) => ({ title, data }))
}

// ---------------------------------------------------------------------------
// Status styling
// ---------------------------------------------------------------------------

type StatusStyle = {
  label: string
  color: string
  bg: string
  borderColor: string
  icon: 'progress-clock' | 'alert-circle-outline' | 'check-circle-outline' | 'clock-outline'
}

function useStatusStyle(status: string): StatusStyle {
  const theme = useTheme()
  switch (status) {
    case 'processing':
      return {
        label: 'PROCESSING',
        color: theme.primary,
        bg: `${theme.primaryContainer}33`,
        borderColor: `${theme.primary}33`,
        icon: 'progress-clock',
      }
    case 'unreviewed':
      return {
        label: 'UNREVIEWED',
        color: theme.tertiary,
        bg: `${theme.tertiaryContainer}33`,
        borderColor: `${theme.tertiary}33`,
        icon: 'alert-circle-outline',
      }
    case 'reviewed':
      return {
        label: 'REVIEWED',
        color: theme.onSurfaceVariant,
        bg: `${theme.outlineVariant}33`,
        borderColor: `${theme.outlineVariant}33`,
        icon: 'check-circle-outline',
      }
    default:
      return {
        label: 'CREATED',
        color: theme.onSurfaceVariant,
        bg: `${theme.outlineVariant}33`,
        borderColor: `${theme.outlineVariant}33`,
        icon: 'clock-outline',
      }
  }
}

// ---------------------------------------------------------------------------
// Report card
// ---------------------------------------------------------------------------

function ReportCard({ item }: { item: ReportListItem }) {
  const theme = useTheme()
  const router = useRouter()
  const ss = useStatusStyle(item.status)
  const isProcessing = item.status === 'processing'
  const isUnreviewed = item.status === 'unreviewed'
  const isReviewed = item.status === 'reviewed'

  const progress =
    isProcessing && item.photoCount > 0
      ? item.processedCount / item.photoCount
      : 0
  const progressPct = Math.round(progress * 100)

  const cardBg = isReviewed ? theme.surfaceContainerLow : theme.surfaceContainer
  const titleColor = isReviewed ? theme.onSurfaceVariant : theme.onSurface

  return (
    <Pressable
      onPress={() => {
        const params: { reportId: string; mode?: 'view' } = { reportId: item.id }
        if (isReviewed) params.mode = 'view'
        router.push({ pathname: '/review', params })
      }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? theme.surfaceContainerHigh : cardBg,
          borderColor: isReviewed ? `${theme.outlineVariant}1A` : 'transparent',
          borderWidth: isReviewed ? 1 : 0,
        },
      ]}
    >
      {/* Header row */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name={isReviewed ? 'archive-outline' : isUnreviewed ? 'glass-cocktail' : 'map-marker'}
              size={16}
              color={isReviewed ? theme.onSurfaceVariant : ss.color}
            />
            <Text style={[styles.locationName, { color: titleColor }]}>
              {item.locationName ?? 'All Locations'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: theme.onSurfaceVariant }]}>
              {formatTime(item.startedAt)}
            </Text>
            <Text style={[styles.metaDot, { color: theme.onSurfaceVariant }]}>{'\u00B7'}</Text>
            <Text style={[styles.metaText, { color: theme.onSurfaceVariant }]}>
              {shortId(item.id)}
            </Text>
            {item.userDisplayName ? (
              <>
                <Text style={[styles.metaDot, { color: theme.onSurfaceVariant }]}>{'\u00B7'}</Text>
                <Text style={[styles.metaText, { color: theme.onSurfaceVariant }]}>
                  by {item.userDisplayName}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: ss.bg, borderColor: ss.borderColor }]}>
          <Text style={[styles.statusText, { color: ss.color }]}>{ss.label}</Text>
        </View>
      </View>

      {/* Progress bar (processing only) */}
      {isProcessing ? (
        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: theme.surfaceContainerHighest }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: ss.color, width: `${progressPct}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: ss.color }]}>
            {progressPct}% Analysed
          </Text>
        </View>
      ) : null}

      {/* Review button (unreviewed only) */}
      {isUnreviewed ? (
        <View style={styles.actionRow}>
          <Pressable
            onPress={() =>
              router.push({ pathname: '/review', params: { reportId: item.id } })
            }
            style={({ pressed }) => [
              styles.reviewButton,
              {
                backgroundColor: pressed
                  ? theme.primary
                  : theme.surfaceContainerHighest,
              },
            ]}
          >
            <Text
              style={[
                styles.reviewButtonText,
                { color: theme.primary },
              ]}
            >
              Review Discrepancies
            </Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ReportsScreen() {
  const theme = useTheme()
  const [reports, setReports] = useState<ReportListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await listReports()
      setReports(res.reports)
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial + dependency-driven data load
    load()
  }, [load])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    load()
  }, [load])

  const pendingCount = reports.filter(
    (r) => r.status === 'unreviewed' || r.status === 'processing',
  ).length

  const sections = groupByDate(reports)

  if (loading) {
    return (
      <SafeAreaView
        edges={['top']}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <AppHeader />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (reports.length === 0) {
    return (
      <SafeAreaView
        edges={['top']}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <AppHeader />
        <EmptyState
          iconName="clipboard-text-clock-outline"
          title="No Reports Yet"
          description="Scan some bottles and submit a report to see your history here."
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <AppHeader />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          pendingCount > 0 ? (
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.surfaceContainerLow,
                  borderLeftColor: theme.primary,
                },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: theme.onSurfaceVariant }]}>
                Pending Review
              </Text>
              <Text style={[styles.summaryValue, { color: theme.primary }]}>
                {pendingCount} Active
              </Text>
            </View>
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeaderWrapper, { backgroundColor: theme.background }]}>
            <Text style={[styles.sectionHeader, { color: theme.onSurfaceVariant }]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => <ReportCard item={item} />}
        ListFooterComponent={
          <View style={styles.footer}>
            <MaterialCommunityIcons
              name="history"
              size={32}
              color={`${theme.onSurfaceVariant}4D`}
            />
            <Text style={[styles.footerText, { color: `${theme.onSurfaceVariant}4D` }]}>
              Older reports archived in cloud
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['5xl'],
  },

  // Summary card
  summaryCard: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderLeftWidth: 4,
    marginBottom: spacing['3xl'],
  },
  summaryLabel: {
    fontFamily: typography.labelFont,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.xs,
    opacity: 0.7,
  },
  summaryValue: {
    fontFamily: typography.bodyFont,
    fontSize: 22,
    fontWeight: '800',
  },

  // Section headers
  sectionHeaderWrapper: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm + 5,
    paddingBottom: spacing.lg - 5,
  },
  sectionHeader: {
    fontFamily: typography.labelFont,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },

  // Card
  card: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  locationName: {
    fontFamily: typography.bodyFont,
    fontSize: 17,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    fontFamily: typography.labelFont,
    fontSize: 11,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 11,
    opacity: 0.3,
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: typography.labelFont,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Progress bar
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  progressLabel: {
    fontFamily: typography.labelFont,
    fontSize: 10,
    fontWeight: '700',
  },

  // Review button
  actionRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
  },
  reviewButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
  },
  reviewButtonText: {
    fontFamily: typography.labelFont,
    fontSize: 12,
    fontWeight: '700',
  },

  // Footer
  footer: {
    paddingVertical: spacing['5xl'],
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    fontFamily: typography.labelFont,
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
})
