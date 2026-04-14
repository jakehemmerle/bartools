import { useState } from 'react'
import { View, Text, TextInput, Image, ScrollView, Pressable, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../../../theme/useTheme'
import { FillLevelSlider } from '../../../components/FillLevelSlider'
import { useScanContext } from '../../../lib/scan-context'

// Mock VLM result
const MOCK_RESULT = {
  brand: 'Old Forester',
  product: '1920 Prohibition Style',
  category: 'Kentucky Straight Bourbon',
  confidence: 98.4,
  vlmLabel: 'Small Batch Rye',
}

export default function ConfirmScanScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { identified } = useLocalSearchParams<{ identified?: string }>()
  const { photoUri, setPhotoUri } = useScanContext()

  const isIdentified = identified !== 'false'

  const [brand, setBrand] = useState(isIdentified ? MOCK_RESULT.brand : '')
  const [product, setProduct] = useState(isIdentified ? MOCK_RESULT.product : '')
  const [category, _setCategory] = useState(isIdentified ? MOCK_RESULT.category : '')
  const [fillLevel, setFillLevel] = useState(75)
  const [inventoryType, setInventoryType] = useState<'active' | 'backstock'>('active')

  const [scanId] = useState(() => `#BB-${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}-RX`)
  const [capturedAt] = useState(() => new Date().toLocaleTimeString('en-US', { hour12: false, timeZoneName: 'short' }))

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>BarBack</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status header */}
        <View style={styles.statusSection}>
          <View style={[
            styles.statusIcon,
            {
              backgroundColor: isIdentified ? `${theme.tertiary}1A` : `${theme.outlineVariant}1A`,
              borderColor: isIdentified ? `${theme.tertiary}33` : `${theme.outlineVariant}33`,
            },
          ]}>
            <MaterialCommunityIcons
              name={isIdentified ? 'check-circle' : 'alert-circle-outline'}
              size={24}
              color={isIdentified ? theme.tertiary : theme.outlineVariant}
            />
          </View>
          <Text style={[styles.statusTitle, { color: theme.onSurface }]}>
            {isIdentified ? 'Bottle Identified' : 'Bottle Not Identified'}
          </Text>
          <Text style={[styles.statusSubtitle, { color: theme.onSurfaceVariant }]}>
            {isIdentified
              ? `Scanning engine accuracy: ${MOCK_RESULT.confidence}%`
              : 'Unable to match — add details manually'}
          </Text>
        </View>

        {/* Image preview + fill slider row */}
        <View style={styles.imageRow}>
          <View style={[styles.imageContainer, { backgroundColor: theme.surfaceContainer }]}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: theme.surfaceContainerHigh }]}>
                <MaterialCommunityIcons name="bottle-wine" size={48} color={theme.outlineVariant} />
              </View>
            )}
            {/* Gradient overlay at bottom */}
            <View style={styles.imageGradient} />

            {/* VLM Match badge or unidentified overlay */}
            {isIdentified ? (
              <View style={[styles.vlmBadge, { backgroundColor: `${theme.surfaceContainerHigh}CC`, borderLeftColor: theme.tertiary }]}>
                <Text style={[styles.vlmLabel, { color: theme.tertiary }]}>VLM Match</Text>
                <Text style={[styles.vlmValue, { color: theme.primary }]}>{MOCK_RESULT.vlmLabel}</Text>
              </View>
            ) : (
              <View style={styles.unidentifiedOverlay}>
                <MaterialCommunityIcons name="help" size={48} color={theme.outlineVariant} />
              </View>
            )}
          </View>

          {/* Vertical fill slider */}
          <FillLevelSlider
            value={fillLevel}
            onValueChange={setFillLevel}
            orientation="vertical"
            label="Fill Level"
          />
        </View>

        {isIdentified ? (
          <>
            {/* Form fields */}
            <View style={styles.formSection}>
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.outline }]}>Distillery / Brand</Text>
                <TextInput
                  style={[styles.fieldInput, { color: theme.onSurface, borderBottomColor: theme.outlineVariant }]}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Brand name"
                  placeholderTextColor={theme.surfaceVariant}
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.outline }]}>Expression / Product</Text>
                <TextInput
                  style={[styles.fieldInput, { color: theme.onSurface, borderBottomColor: theme.outlineVariant }]}
                  value={product}
                  onChangeText={setProduct}
                  placeholder="Product name"
                  placeholderTextColor={theme.surfaceVariant}
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.outline }]}>Category</Text>
                <View style={[styles.categoryRow, { borderBottomColor: theme.outlineVariant }]}>
                  <Text style={[styles.categoryText, { color: theme.onSurface }]}>{category}</Text>
                  <MaterialCommunityIcons name="pencil" size={14} color={theme.outline} />
                </View>
              </View>
            </View>

            {/* Toggle: Active Inventory / Backstock */}
            <View style={[styles.toggle, { backgroundColor: theme.surfaceContainerLow }]}>
              <Pressable
                style={[styles.toggleOption, inventoryType === 'active' && { backgroundColor: theme.surfaceContainerHigh }]}
                onPress={() => setInventoryType('active')}
              >
                <Text style={[styles.toggleText, { color: inventoryType === 'active' ? theme.primary : theme.onSurfaceVariant }]}>
                  Active Inventory
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleOption, inventoryType === 'backstock' && { backgroundColor: theme.surfaceContainerHigh }]}
                onPress={() => setInventoryType('backstock')}
              >
                <Text style={[styles.toggleText, { color: inventoryType === 'backstock' ? theme.primary : theme.onSurfaceVariant }]}>
                  Backstock
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primaryAction, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
            onPress={() => {
              if (isIdentified) {
                Alert.alert(
                  'Confirmation Saved',
                  'Bottle details have been confirmed. Submit via the review flow to add to inventory.',
                  [{ text: 'OK', onPress: () => {
                    setPhotoUri(null)
                    router.replace('/(tabs)/inventory')
                  }}],
                )
              } else {
                router.replace({ pathname: '/inventory/add-manually' })
              }
            }}
          >
            <MaterialCommunityIcons name="plus-circle" size={20} color={theme.onPrimary} />
            <Text style={[styles.primaryActionText, { color: theme.onPrimary }]}>
              {isIdentified ? 'Confirm & Add to Shelf' : 'Add Details Manually'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryAction, { borderColor: theme.outlineVariant }]}
            onPress={() => router.replace('/inventory/scan')}
          >
            <Text style={[styles.secondaryActionText, { color: theme.primary }]}>Retake Photo</Text>
          </Pressable>
        </View>

        {/* Technical metadata */}
        <View style={[styles.metadata, { borderTopColor: `${theme.outlineVariant}1A` }]}>
          <View>
            <Text style={[styles.metaLabel, { color: theme.outline }]}>Captured At</Text>
            <Text style={[styles.metaValue, { color: theme.onSurfaceVariant }]}>{capturedAt}</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={[styles.metaLabel, { color: theme.outline }]}>Scan ID</Text>
            <Text style={[styles.metaValue, { color: theme.onSurfaceVariant }]}>{scanId}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerTitle: {
    fontFamily: 'Newsreader',
    fontSize: 24,
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 48 },

  // Status
  statusSection: { alignItems: 'center', gap: 8, marginBottom: 32 },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontFamily: 'Newsreader',
    fontSize: 30,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  statusSubtitle: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Image + slider row
  imageRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  imageContainer: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(19,19,19,0.6)',
  },
  vlmBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderLeftWidth: 2,
  },
  vlmLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  vlmValue: {
    fontFamily: 'Newsreader',
    fontSize: 18,
    fontStyle: 'italic',
  },
  unidentifiedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  // Form
  formSection: { gap: 16, marginBottom: 24 },
  field: {},
  fieldLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 4,
  },
  fieldInput: {
    fontFamily: 'Newsreader',
    fontSize: 20,
    fontStyle: 'italic',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  categoryText: {
    fontFamily: 'Newsreader',
    fontSize: 20,
    fontStyle: 'italic',
  },

  // Toggle
  toggle: {
    flexDirection: 'row',
    borderRadius: 4,
    padding: 4,
    marginBottom: 32,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  toggleText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Actions
  actions: { gap: 16, marginBottom: 24 },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 4,
  },
  primaryActionText: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryAction: {
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },

  // Metadata
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    borderTopWidth: 1,
  },
  metaLabel: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  metaValue: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    marginTop: 4,
  },
  metaRight: { alignItems: 'flex-end' },
})
