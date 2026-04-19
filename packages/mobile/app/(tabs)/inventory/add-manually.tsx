import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../../../theme/useTheme'
import { FillLevelSlider } from '../../../components/FillLevelSlider'
import { BottleSearchModal } from '../../../components/BottleSearchModal'
import type { BottleSearchResult, LocationListItem } from '@bartools/types'
import { ApiError, addInventoryItem, getLocations } from '../../../lib/api'
import { validateAddInventoryForm } from '../../../lib/add-inventory-validation'
import { DEFAULT_VENUE_ID } from '../../../lib/config'

type LocationsState =
  | { status: 'loading' }
  | { status: 'ready'; locations: LocationListItem[] }
  | { status: 'error' }

type SelectedBottle = Pick<BottleSearchResult, 'id' | 'name' | 'category' | 'volumeMl'>

export default function AddManuallyScreen() {
  const theme = useTheme()
  const router = useRouter()

  const [selectedBottle, setSelectedBottle] = useState<SelectedBottle | null>(null)
  const [fillLevel, setFillLevel] = useState(100)
  const [locationsState, setLocationsState] = useState<LocationsState>({ status: 'loading' })
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [showBottleSearch, setShowBottleSearch] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const loadLocations = useCallback(() => {
    setLocationsState({ status: 'loading' })
    getLocations(DEFAULT_VENUE_ID)
      .then((res) => {
        setLocationsState({ status: 'ready', locations: res.locations })
        if (res.locations.length > 0 && !selectedLocationId) {
          setSelectedLocationId(res.locations[0]!.id)
        }
      })
      .catch(() => setLocationsState({ status: 'error' }))
  // Only run once on mount — selectedLocationId intentionally not in deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    loadLocations()
  }, [loadLocations])

  const handleSelectBottle = useCallback((bottle: BottleSearchResult) => {
    setSelectedBottle({
      id: bottle.id,
      name: bottle.name,
      category: bottle.category,
      volumeMl: bottle.volumeMl,
    })
    setShowBottleSearch(false)
  }, [])

  const locationsReady = locationsState.status === 'ready'
  const submitDisabled =
    submitting || !locationsReady || !selectedLocationId || !selectedBottle

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitError(null)
    const validationErrors = validateAddInventoryForm({
      bottleId: selectedBottle?.id,
      locationId: selectedLocationId ?? undefined,
      fillPercent: fillLevel,
    })
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    setSubmitting(true)
    try {
      await addInventoryItem({
        locationId: selectedLocationId!,
        bottleId: selectedBottle!.id,
        fillPercent: fillLevel,
      })
      router.back()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? `Couldn't add bottle (${err.status})`
          : "Couldn't add bottle. Please try again."
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }, [submitting, selectedBottle, selectedLocationId, fillLevel, router])

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>BarTools</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page title */}
        <Text style={[styles.title, { color: theme.onSurface }]}>Add Manually</Text>
        <Text style={[styles.subtitle, { color: theme.outline }]}>Precise entry for the discerning inventory</Text>

        {/* Bottle picker */}
        <View style={styles.fieldGroup}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.primary }]}>Bottle</Text>
            <Pressable
              onPress={() => setShowBottleSearch(true)}
              style={[styles.selectField, { borderBottomColor: theme.outline }]}
              accessibilityRole="button"
              accessibilityLabel="Select bottle"
            >
              <Text
                style={[
                  styles.selectText,
                  { color: selectedBottle ? theme.onSurface : `${theme.outline}CC` },
                ]}
                numberOfLines={1}
              >
                {selectedBottle ? selectedBottle.name : 'Tap to select bottle'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={theme.outline} />
            </Pressable>
            {selectedBottle ? (
              <Text style={[styles.hint, { color: theme.outline }]}>
                {selectedBottle.category}
                {selectedBottle.volumeMl ? ` · ${selectedBottle.volumeMl}ml` : ''}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Fill Level */}
        <View style={styles.fillSection}>
          <FillLevelSlider
            value={fillLevel}
            onValueChange={setFillLevel}
            orientation="horizontal"
            label="Current Fill Level"
          />
        </View>

        {/* Storage Location */}
        <View style={[styles.field, styles.locationField]}>
          <Text style={[styles.label, { color: theme.primary }]}>Storage Location</Text>
          {locationsState.status === 'loading' ? (
            <ActivityIndicator color={theme.outline} style={styles.locationLoader} />
          ) : locationsState.status === 'error' ? (
            <View style={styles.locationErrorRow}>
              <Text style={[styles.errorText, { color: theme.error }]}>Couldn't load locations.</Text>
              <Pressable onPress={loadLocations} accessibilityRole="button">
                <Text style={[styles.retryText, { color: theme.primary }]}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.locationRow}>
              {locationsState.locations.map((loc) => {
                const active = selectedLocationId === loc.id
                return (
                  <Pressable
                    key={loc.id}
                    onPress={() => setSelectedLocationId(loc.id)}
                    style={[
                      styles.locationChip,
                      {
                        backgroundColor: active ? theme.primary : theme.surfaceContainerHigh,
                        borderColor: active ? theme.primary : theme.outlineVariant,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      style={[
                        styles.locationChipText,
                        { color: active ? theme.onPrimary : theme.onSurfaceVariant },
                      ]}
                    >
                      {loc.name}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          )}
        </View>

        {/* Inline errors */}
        {errors.length > 0 ? (
          <View style={styles.errorBlock}>
            {errors.map((err) => (
              <Text key={err} style={[styles.errorText, { color: theme.error }]}>
                {err}
              </Text>
            ))}
          </View>
        ) : null}

        {submitError ? (
          <View style={styles.errorBlock}>
            <Text style={[styles.errorText, { color: theme.error }]}>{submitError}</Text>
          </View>
        ) : null}

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: theme.primary,
              opacity: submitDisabled ? 0.4 : pressed ? 0.9 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={submitDisabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: submitDisabled }}
        >
          {submitting ? (
            <ActivityIndicator color={theme.onPrimary} />
          ) : (
            <>
              <Text style={[styles.submitText, { color: theme.onPrimary }]}>Add to Inventory</Text>
              <MaterialCommunityIcons name="plus-circle" size={18} color={theme.onPrimary} />
            </>
          )}
        </Pressable>

        <Text style={[styles.quote, { color: theme.outline }]}>
          "Quality is not an act, it is a habit."
        </Text>
      </ScrollView>

      <BottleSearchModal
        visible={showBottleSearch}
        onDismiss={() => setShowBottleSearch(false)}
        onSelect={handleSelectBottle}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 48 },
  title: {
    fontFamily: 'Newsreader',
    fontSize: 48,
    fontWeight: '300',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 32,
  },
  fieldGroup: { gap: 32, marginBottom: 48 },
  field: {},
  label: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  hint: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 9,
    fontStyle: 'italic',
    marginTop: 4,
  },
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  selectText: {
    fontFamily: 'Manrope',
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  fillSection: { marginBottom: 48 },
  locationField: { marginBottom: 32 },
  locationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  locationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  locationChipText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  locationLoader: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  locationErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  errorBlock: {
    marginBottom: 16,
    gap: 4,
  },
  errorText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
  },
  retryText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    marginBottom: 16,
  },
  submitText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  quote: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
})
