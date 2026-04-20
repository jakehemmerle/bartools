import { useState, useCallback, useMemo } from 'react'
import { View, Text, TextInput, ScrollView, FlatList, Pressable, Image, Modal, Alert, ActivityIndicator, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ITEM_CATEGORIES, type BottleSearchResult, type ItemCategory, type ReportBottleRecord } from '@bartools/types'
import { useReportStream } from '../lib/use-report-stream'
import { reviewReport, resolveImageUrl, isValidUuid } from '../lib/api'
import { DEFAULT_USER_ID } from '../lib/config'
import { PourPacifier } from '../components/PourPacifier'
import {
  canSubmitReview,
  isRecordMissingBottle,
  type RecordEdit,
} from '../lib/review-validation'
import { useTheme } from '../theme/useTheme'
import { RecordCard } from '../components/RecordCard'
import { BottleSearchModal } from '../components/BottleSearchModal'
import { FillLevelSlider } from '../components/FillLevelSlider'

const MANUAL_CATEGORY_CHOICES = [
  'whiskey',
  'bourbon',
  'vodka',
  'gin',
  'rum',
  'tequila',
  'liqueur',
  'wine',
  'beer',
  'other',
] as const satisfies readonly ItemCategory[]

export default function ReviewScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { reportId: rawReportId, mode } = useLocalSearchParams<{
    reportId: string
    mode?: string
  }>()
  const reportId = rawReportId && isValidUuid(rawReportId) ? rawReportId : null
  const isViewMode = mode === 'view'
  const { status, progress, records, error } = useReportStream(reportId)

  const [edits, setEdits] = useState<Record<string, RecordEdit>>({})
  const [searchTarget, setSearchTarget] = useState<string | null>(null)
  const [fillEditTarget, setFillEditTarget] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isReady = status === 'ready_for_review'
  const canSubmit = canSubmitReview(records, edits)

  const handleBottleSelect = useCallback((bottle: BottleSearchResult) => {
    if (!searchTarget) return
    setEdits((prev) => ({
      ...prev,
      [searchTarget]: {
        ...prev[searchTarget],
        bottleId: bottle.id,
        bottleName: bottle.name,
        bottle: undefined,
      },
    }))
    setSearchTarget(null)
  }, [searchTarget])

  const handleManualBottleChange = useCallback((
    recordId: string,
    patch: { name?: string; category?: ItemCategory; sizeMlText?: string },
  ) => {
    setEdits((prev) => {
      const current = prev[recordId]?.bottle ?? { name: '', category: 'other' as ItemCategory }
      const sizeMl =
        patch.sizeMlText !== undefined
          ? patch.sizeMlText.trim().length > 0
            ? Number.parseInt(patch.sizeMlText, 10)
            : undefined
          : current.sizeMl
      return {
        ...prev,
        [recordId]: {
          ...prev[recordId],
          bottleId: undefined,
          bottleName: undefined,
          bottle: {
            ...current,
            ...(patch.name !== undefined ? { name: patch.name } : {}),
            ...(patch.category !== undefined
              ? {
                  category: ITEM_CATEGORIES.includes(patch.category)
                    ? patch.category
                    : ('other' as ItemCategory),
                }
              : {}),
            ...(sizeMl !== undefined ? { sizeMl } : { sizeMl: undefined }),
          },
        },
      }
    })
  }, [])

  const handleFillChange = useCallback((recordId: string, fillPercent: number) => {
    setEdits((prev) => ({
      ...prev,
      [recordId]: { ...prev[recordId], fillPercent },
    }))
  }, [])

  const handleSubmitReview = useCallback(async () => {
    if (!reportId) return
    try {
      setSubmitting(true)
      const reviewRecords = records.map((r) => {
        const edit = edits[r.id]
        const bottleId = edit?.bottleId ?? r.bottleId
        return {
          id: r.id,
          ...(bottleId ? { bottleId } : { bottle: edit?.bottle }),
          fillPercent: edit?.fillPercent ?? r.fillPercent,
        }
      })
      await reviewReport(reportId, DEFAULT_USER_ID, reviewRecords)
      Alert.alert('Review Complete', 'Inventory has been updated.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ])
    } catch {
      Alert.alert('Review Failed', 'Could not submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [reportId, records, edits, router])

  // Fill level edit sheet for the selected record
  const fillRecord = useMemo(() => {
    if (!fillEditTarget) return null
    const rec = records.find((r) => r.id === fillEditTarget)
    if (!rec) return null
    const edit = edits[fillEditTarget]
    return { record: rec, fill: edit?.fillPercent ?? rec.fillPercent }
  }, [fillEditTarget, records, edits])

  const renderRecord = useCallback(
    ({ item }: { item: ReportBottleRecord }) => {
      const edit = edits[item.id]
      const missingBottle = isRecordMissingBottle(item, edit)
      const hasCatalogBottle = Boolean(edit?.bottleId ?? item.bottleId)
      const manualName = edit?.bottle?.name.trim()
      return (
        <View style={styles.cardWrapper}>
          <RecordCard
            record={item}
            editedFill={edit?.fillPercent}
            editedName={edit?.bottleName ?? (manualName ? edit?.bottle?.name : undefined)}
            onEdit={isViewMode ? undefined : () => setSearchTarget(item.id)}
            onPress={
              item.imageUrl
                ? () => setLightboxUrl(resolveImageUrl(item.imageUrl))
                : undefined
            }
            missingBottle={!isViewMode && missingBottle}
          />
          {isViewMode ? null : (
            <Pressable
              onPress={() => setFillEditTarget(fillEditTarget === item.id ? null : item.id)}
              style={styles.fillEditButton}
              accessibilityRole="button"
            >
              <Text style={[styles.fillEditText, { color: theme.primary }]}>
                Adjust fill
              </Text>
            </Pressable>
          )}
          {!isViewMode && fillEditTarget === item.id && fillRecord ? (
            <View style={styles.fillEditor}>
              <FillLevelSlider
                value={fillRecord.fill}
                onValueChange={(v) => handleFillChange(item.id, v)}
                orientation="horizontal"
                label="Adjust Fill Level"
              />
            </View>
          ) : null}
          {!isViewMode && !hasCatalogBottle ? (
            <View style={[styles.manualEditor, { backgroundColor: theme.surfaceContainer }]}>
              <Text style={[styles.manualLabel, { color: theme.primary }]}>
                Manual Bottle
              </Text>
              <TextInput
                style={[styles.manualInput, { color: theme.onSurface, borderBottomColor: theme.outline }]}
                placeholder="Bottle name"
                placeholderTextColor={`${theme.outline}CC`}
                value={edit?.bottle?.name ?? ''}
                onChangeText={(text) => handleManualBottleChange(item.id, { name: text })}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.manualCategoryContent}
              >
                {MANUAL_CATEGORY_CHOICES.map((category) => {
                  const active = (edit?.bottle?.category ?? 'other') === category
                  return (
                    <Pressable
                      key={category}
                      onPress={() => handleManualBottleChange(item.id, { category })}
                      style={[
                        styles.manualCategoryChip,
                        {
                          backgroundColor: active
                            ? theme.primary
                            : theme.surfaceContainerHigh,
                          borderColor: active ? theme.primary : theme.outlineVariant,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        style={[
                          styles.manualCategoryText,
                          { color: active ? theme.onPrimary : theme.onSurfaceVariant },
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  )
                })}
              </ScrollView>
              <TextInput
                style={[styles.manualInput, { color: theme.onSurface, borderBottomColor: theme.outline }]}
                placeholder="Size ml"
                placeholderTextColor={`${theme.outline}CC`}
                value={edit?.bottle?.sizeMl ? String(edit.bottle.sizeMl) : ''}
                onChangeText={(text) =>
                  handleManualBottleChange(item.id, {
                    sizeMlText: text.replace(/[^0-9]/g, ''),
                  })
                }
                keyboardType="number-pad"
              />
            </View>
          ) : null}
        </View>
      )
    },
    [edits, fillEditTarget, fillRecord, handleFillChange, handleManualBottleChange, isViewMode, theme],
  )

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>
          {isViewMode ? 'Report' : 'Review'}
        </Text>
      </View>

      {status === 'error' ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={[styles.statusText, { color: theme.error }]}>
            {error ?? 'Connection lost'}
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.linkText, { color: theme.primary }]}>Go back</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Records list — flex grows to fill the space above the pacifier footer. */}
      <View style={styles.listWrapper}>
        {records.length > 0 ? (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            renderItem={renderRecord}
            extraData={[edits, fillEditTarget]}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : null}
      </View>

      {/* Pacifier pinned to the bottom third while inference is still running. */}
      {!isReady && status !== 'error' ? (
        <View style={styles.pacifierFooter}>
          <PourPacifier />
          <Text style={[styles.pacifierCaption, { color: theme.onSurfaceVariant }]}>
            {progress && progress.photoCount > 0
              ? `Identifying ${Math.min(progress.processedCount + 1, progress.photoCount)} of ${progress.photoCount}...`
              : 'Connecting to analysis stream...'}
          </Text>
        </View>
      ) : null}

      {/* Bottom action */}
      {isReady && !isViewMode ? (
        <View style={[styles.bottomAction, { backgroundColor: theme.surfaceContainerLow }]}>
          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              {
                backgroundColor: theme.primary,
                opacity: !canSubmit
                  ? 0.4
                  : submitting
                    ? 0.6
                    : pressed
                      ? 0.9
                      : 1,
              },
            ]}
            onPress={handleSubmitReview}
            disabled={submitting || !canSubmit}
          >
            {submitting ? (
              <ActivityIndicator color={theme.onPrimary} size="small" />
            ) : (
              <MaterialCommunityIcons name="check-bold" size={20} color={theme.onPrimary} />
            )}
            <Text style={[styles.confirmText, { color: theme.onPrimary }]}>
              {submitting ? 'SUBMITTING...' : 'CONFIRM INVENTORY'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Bottle search modal */}
      <BottleSearchModal
        visible={searchTarget !== null}
        onDismiss={() => setSearchTarget(null)}
        onSelect={handleBottleSelect}
      />

      {/* Image lightbox — tap card to view, tap again to dismiss */}
      <Modal
        visible={lightboxUrl !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxUrl(null)}
      >
        <Pressable style={styles.lightboxOverlay} onPress={() => setLightboxUrl(null)}>
          {lightboxUrl ? (
            <Image
              source={{ uri: lightboxUrl }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          ) : null}
          <Pressable
            onPress={() => setLightboxUrl(null)}
            hitSlop={12}
            style={styles.lightboxClose}
            accessibilityRole="button"
            accessibilityLabel="Close photo"
          >
            <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: 'Newsreader',
    fontSize: 24,
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  progressSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 6,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  statusText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    textAlign: 'center',
  },
  linkText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 8,
    paddingBottom: 120,
  },
  pacifierFooter: {
    height: Dimensions.get('window').height / 3,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingBottom: 16,
    gap: 8,
  },
  pacifierCaption: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: {
    width: '100%',
    height: '100%',
  },
  lightboxClose: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'relative',
  },
  fillEditButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  fillEditText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fillEditor: {
    marginTop: 4,
  },
  manualEditor: {
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    gap: 10,
  },
  manualLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  manualInput: {
    fontFamily: 'Manrope',
    fontSize: 15,
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  manualCategoryContent: {
    gap: 8,
  },
  manualCategoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 4,
    borderWidth: 1,
  },
  manualCategoryText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 36,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 18,
    borderRadius: 12,
  },
  confirmText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
})
