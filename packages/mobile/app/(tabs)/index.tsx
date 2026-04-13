import { useState, useCallback, useEffect, useRef } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useBatchQueue } from '../../lib/use-batch-queue'
import { CameraCapture } from '../../components/camera-capture'
import { BatchQueue } from '../../components/batch-queue'
import { AppHeader } from '../../components/AppHeader'
import { ReviewScanSheet } from '../../components/ReviewScanSheet'
import { useTheme } from '../../theme/useTheme'
import { typography, spacing, radii } from '../../theme/tokens'
import { MOCK_LOCATIONS } from '../../data/mockData'
import type { Location } from '../../types'
import type { ScanResult } from '../../lib/scan-types'

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
  const { photos, isEmpty, addPhoto, addPhotos, removePhoto, clear } =
    useBatchQueue()
  const [selectedLocation, setSelectedLocation] = useState<string | null>(
    MOCK_LOCATIONS[0]?.id ?? null,
  )
  const [mode, setMode] = useState<CaptureMode>('queue')
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [showReview, setShowReview] = useState(false)

  const handlePhotoTaken = useCallback(
    (uri: string) => {
      addPhoto(uri)
      // Create a scan result — mock VLM identification
      // Randomly decide if identified (80% chance) or not (20%)
      const isIdentified = Math.random() > 0.2
      const mockBottles = [
        { brand: 'Buffalo Trace', product: 'Kentucky Straight', category: 'Bourbon', fillLevel: 75, confidence: 98 },
        { brand: 'Macallan', product: '12 Year', category: 'Scotch', fillLevel: 60, confidence: 94 },
        { brand: 'Hendrick\'s', product: 'Gin', category: 'Gin', fillLevel: 85, confidence: 89 },
        { brand: 'Old Forester', product: '1920', category: 'Bourbon', fillLevel: 45, confidence: 96 },
      ]
      const randomBottle = mockBottles[Math.floor(Math.random() * mockBottles.length)]

      const result: ScanResult = {
        id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        photoUri: uri,
        status: isIdentified ? 'identified' : 'unidentified',
        bottle: isIdentified ? randomBottle : undefined,
      }
      setScanResults(prev => [...prev, result])
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
      const uris = result.assets.map((a) => a.uri)
      addPhotos(uris)
      // Create scan results for each
      const mockBottles = [
        { brand: 'Buffalo Trace', product: 'Kentucky Straight', category: 'Bourbon', fillLevel: 75, confidence: 98 },
        { brand: 'Macallan', product: '12 Year', category: 'Scotch', fillLevel: 60, confidence: 94 },
      ]
      const newResults: ScanResult[] = uris.map((uri, i) => ({
        id: `scan-${Date.now()}-${i}`,
        photoUri: uri,
        status: Math.random() > 0.2 ? 'identified' as const : 'unidentified' as const,
        bottle: Math.random() > 0.2 ? mockBottles[i % mockBottles.length] : undefined,
      }))
      setScanResults(prev => [...prev, ...newResults])
    }
  }, [addPhotos])

  const handleSync = useCallback(() => {
    // Attempt to POST to backend
    const backendUrl = 'http://localhost:3000' // Backend URL
    fetch(`${backendUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId: selectedLocation,
        scans: scanResults.map(r => ({
          photoUri: r.photoUri,
          status: r.status,
          bottle: r.bottle,
        })),
      }),
    })
      .then(res => {
        if (res.ok) {
          Alert.alert('Success', 'Scan results synced to inventory successfully.', [
            { text: 'OK', onPress: () => {
              setShowReview(false)
              setScanResults([])
              clear()
            }}
          ])
        } else {
          throw new Error(`Server returned ${res.status}`)
        }
      })
      .catch(() => {
        Alert.alert(
          'Sync Failed',
          'Something went wrong while syncing to the backend. Please try again.',
          [{ text: 'OK' }]
        )
      })
  }, [scanResults, selectedLocation, clear])

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
      {/* Full-screen background bar shelf image (grayscale) */}
      <Image
        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjGEQ110Ek0D6kpMsgxKlQ9yfiwwLdcLtoUBeAETwjXCN12T29I8JzMuIwRIILOK0bwOKiz_C3-milsCUzvAxY4_soaQYvbsJlqa41gj7tHC7AtU1reN_KLF9bv9E0sZhJzXEaYY0s9g8m2xfVRpI3qVOEtvy-F578LUdZcPAWBHXbnqOY8qNULqC4pNsZdQOQ9PNyCyudIG_UDBeTdza_z7GnKqWfAz4eNJhJq1WEfFAGYqgoq6E0RdH0vGv4BrnoD07mtZk6PZgV' }}
        style={[styles.backgroundImage, { opacity: 0.35 }]}
        resizeMode="cover"
        accessible={false}
      />
      {/* Heavy gray overlay to wash out color — simulates grayscale */}
      <View style={[styles.backgroundImage, { backgroundColor: '#1a1a1a', opacity: 0.7 }]} />
      {/* Top gradient darkening */}
      <View style={[styles.bgGradientTop, { backgroundColor: theme.background }]} />
      {/* Bottom gradient darkening */}
      <View style={[styles.bgGradientBottom, { backgroundColor: theme.background }]} />

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

      {/* Bottom controls */}
      <View style={[styles.bottomPanel, { backgroundColor: theme.surfaceContainerLow }]}>
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
        <View style={styles.locationRow}>
          {MOCK_LOCATIONS.map((loc) => {
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
      </View>

      {/* Review scan results sheet */}
      <ReviewScanSheet
        visible={showReview}
        onDismiss={() => setShowReview(false)}
        results={scanResults}
        onSync={handleSync}
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
