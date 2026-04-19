import { useState, useCallback, useEffect, useRef } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useBatchQueue } from '../../lib/use-batch-queue'
import { createReport, uploadPhotos, submitReport, getLocations } from '../../lib/api'
import { DEFAULT_USER_ID, DEFAULT_VENUE_ID } from '../../lib/config'
import { CameraCapture } from '../../components/camera-capture'
import { BatchQueue } from '../../components/batch-queue'
import { AppHeader } from '../../components/AppHeader'
import { ReviewScanSheet } from '../../components/ReviewScanSheet'
import { useTheme } from '../../theme/useTheme'
import { typography, spacing, radii } from '../../theme/tokens'
import type { LocationListItem } from '@bartools/types'
import barBackground from '../../assets/bar-background.png'

type CaptureMode = 'queue' | 'camera'

/* ── Pulse dot animation ──────────────────────────── */
function PulseDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.pulseDot,
        { backgroundColor: color, opacity },
      ]}
    />
  )
}

export default function CaptureScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { photos, isEmpty, addPhoto, addPhotos, removePhoto, clear } =
    useBatchQueue()
  const [locations, setLocations] = useState<LocationListItem[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [locationsError, setLocationsError] = useState(false)
  const [mode, setMode] = useState<CaptureMode>('queue')
  const [showReview, setShowReview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef<boolean>(false)

  // Load locations from API. On failure, leave the list empty — no silent
  // mock fallback. The submit gate below disables capture when no location is
  // selected, so a bad /locations response becomes a visible failure.
  useEffect(() => {
    getLocations(DEFAULT_VENUE_ID)
      .then((res) => {
        setLocations(res.locations)
        setLocationsError(false)
        if (res.locations.length > 0) setSelectedLocation(res.locations[0].id)
      })
      .catch(() => {
        setLocations([])
        setLocationsError(true)
        setSelectedLocation(null)
      })
  }, [])

  const handlePhotoTaken = useCallback(
    (uri: string) => {
      addPhoto(uri)
      setMode('queue')
    },
    [addPhoto],
  )

  const pickFromLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    })
    if (!result.canceled) {
      addPhotos(result.assets.map((a) => a.uri))
    }
  }, [addPhotos])

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return
    if (!selectedLocation) {
      Alert.alert(
        'Pick a location',
        'Select a venue location before submitting your batch.',
      )
      return
    }
    try {
      submittingRef.current = true
      setSubmitting(true)
      const report = await createReport(
        DEFAULT_USER_ID,
        DEFAULT_VENUE_ID,
        selectedLocation,
      )
      await uploadPhotos(report.id, photos.map((p) => p.uri))
      await submitReport(report.id)
      setShowReview(false)
      clear()
      router.push({ pathname: '/review', params: { reportId: report.id } })
    } catch {
      Alert.alert(
        'Submission Failed',
        'Could not submit photos for analysis. Please try again.',
      )
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }, [photos, selectedLocation, clear, router])

  // Reticle border color: white at 40% opacity (black and white aesthetic)
  const reticleBorderColor = `${theme.onSurface}66` // 66 hex = ~40% opacity

  /* ── Camera mode ─────────────────────────────────── */
  if (mode === 'camera') {
    return (
      <View style={[styles.fullScreen, { backgroundColor: theme.background }]}>
        <CameraCapture onPhotoTaken={handlePhotoTaken} />
        <TouchableOpacity
          style={[
            styles.cancelButton,
            { backgroundColor: theme.surfaceContainerHigh },
          ]}
          onPress={() => setMode('queue')}
        >
          <Text style={[styles.cancelButtonText, { color: theme.primary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  /* ── Queue / Viewfinder mode ────────────────────── */
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Full-screen background — bundled local asset (no external URL).
           Image is square (512×512) so we stretch height to 120% and pin to
           top so the bottles fill the entire visible area on tall screens. */}
      <View style={styles.backgroundImage} pointerEvents="none">
        <Image
          source={barBackground}
          style={{ width: '100%', height: '120%' }}
          resizeMode="cover"
          accessible={false}
        />
      </View>
      {/* Heavy gray overlay to wash out color — simulates grayscale */}
      <View style={[styles.backgroundImage, { backgroundColor: '#1a1a1a', opacity: 0.8 }]} />
      {/* Top gradient darkening for header legibility */}
      <View style={[styles.bgGradientTop, { backgroundColor: theme.background }]} />

      <AppHeader />

      {/* Viewfinder --- full-screen hero area */}
      <View style={[styles.viewfinder, { backgroundColor: 'transparent' }]}>

        {/* Live Feed label — black and white */}
        <View style={styles.liveFeedRow}>
          <PulseDot color={theme.onSurface} />
          <Text style={[styles.liveFeedLabel, { color: theme.onSurface }]}>
            LIVE FEED
          </Text>
        </View>

        {/* Reticle */}
        <View style={styles.reticle}>
          <View style={[styles.cornerTL, { borderColor: reticleBorderColor }]} />
          <View style={[styles.cornerTR, { borderColor: reticleBorderColor }]} />
          <View style={[styles.cornerBL, { borderColor: reticleBorderColor }]} />
          <View style={[styles.cornerBR, { borderColor: reticleBorderColor }]} />
        </View>

        {/* Status text */}
        <Text style={[styles.scanStatus, { color: theme.onSurface }]}>
          Detecting high-proof spirits...
        </Text>

        {/* Batch queue overlay (when photos exist) */}
        {!isEmpty && (
          <View style={styles.batchOverlay}>
            <BatchQueue photos={photos} onRemove={removePhoto} onClear={clear} onDone={() => setShowReview(true)} />
          </View>
        )}
      </View>

      {/* Bottom controls — semi-transparent so bar background bleeds through */}
      <View style={[styles.bottomPanel, { backgroundColor: `${theme.surfaceContainerLow}CC` }]}>
        {/* Controls row: Gallery | Capture | Settings */}
        <View style={styles.controlsRow}>
          {/* Gallery preview thumbnail */}
          <Pressable
            style={[
              styles.galleryPreview,
              {
                backgroundColor: theme.surfaceContainer,
                borderColor: `${theme.outlineVariant}33`, // 20% opacity
              },
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Gallery preview"
            onPress={pickFromLibrary}
          >
            <MaterialCommunityIcons
              name="image-outline"
              size={22}
              color={theme.onSurfaceVariant}
            />
          </Pressable>

          {/* Capture Pour button — always opens camera */}
          <Pressable
            onPress={() => setMode('camera')}
            style={({ pressed }) => [
              styles.captureButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Capture pour"
          >
            <Text style={[styles.captureButtonText, { color: theme.onPrimary }]}>
              CAPTURE POUR
            </Text>
          </Pressable>

          {/* YOLO auto-capture — disabled until model is integrated */}
          <Pressable
            disabled
            style={[
              styles.controlButton,
              {
                backgroundColor: theme.surfaceContainerLowest,
                opacity: 0.35,
              },
            ]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Auto-capture (coming soon)"
          >
            <MaterialCommunityIcons
              name="video-outline"
              size={24}
              color={theme.onSurface}
            />
          </Pressable>
        </View>

        {/* Location badges below capture row */}
        {locationsError ? (
          <View style={styles.locationRow}>
            <Text style={[styles.locationErrorText, { color: theme.error }]}>
              Couldn't load locations — submissions disabled.
            </Text>
          </View>
        ) : (
          <View style={styles.locationRow}>
            {locations.map((loc) => {
              const isSelected = selectedLocation === loc.id
              return (
                <TouchableOpacity
                  key={loc.id}
                  style={[
                    styles.locationBadge,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.surfaceContainerHigh,
                      borderColor: isSelected
                        ? theme.primary
                        : theme.outlineVariant,
                    },
                  ]}
                  onPress={() => setSelectedLocation(loc.id)}
                >
                  <Text
                    style={[
                      styles.locationBadgeText,
                      {
                        color: isSelected
                          ? theme.onPrimary
                          : theme.onSurfaceVariant,
                      },
                    ]}
                  >
                    {loc.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </View>

      {/* Review scan results sheet */}
      <ReviewScanSheet
        visible={showReview}
        onDismiss={() => setShowReview(false)}
        photos={photos}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </SafeAreaView>
  )
}

/* ── Styles ──────────────────────────────────────────── */

const RETICLE_SIZE = 220
const CORNER_LEN = 28
const CORNER_WIDTH = 2

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreen: {
    flex: 1,
  },

  /* Full-screen background image (behind everything) */
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bgGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '25%',
    opacity: 0.6,
  },
  bgGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    opacity: 0.8,
  },

  /* Viewfinder --- edge-to-edge, fills remaining space */
  viewfinder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },

  /* Live Feed indicator */
  liveFeedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveFeedLabel: {
    fontFamily: typography.labelFont,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },

  /* Reticle */
  reticle: {
    width: RETICLE_SIZE,
    height: RETICLE_SIZE,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },

  /* Scan status text */
  scanStatus: {
    fontFamily: typography.labelFont,
    fontSize: 13,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },

  /* Batch queue overlay */
  batchOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
  },

  /* Bottom panel */
  bottomPanel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },

  /* Controls row: gallery | capture | settings */
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  /* Gallery preview thumbnail */
  galleryPreview: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Capture Pour button */
  captureButton: {
    flex: 1,
    height: 64,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonText: {
    fontFamily: typography.labelFont,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },

  /* Camera toggle button */
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Location badges */
  locationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  locationBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  locationBadgeText: {
    fontFamily: typography.labelFont,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  locationErrorText: {
    fontFamily: typography.labelFont,
    fontSize: 12,
    letterSpacing: 0.5,
  },

  /* Camera-mode cancel */
  cancelButton: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  cancelButtonText: {
    fontFamily: typography.labelFont,
    fontSize: 15,
    fontWeight: '600',
  },

})
