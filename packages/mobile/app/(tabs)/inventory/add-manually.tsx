import { useState, useEffect } from 'react'
import { View, Text, TextInput, ScrollView, Pressable, Image, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../../../theme/useTheme'
import { FillLevelSlider } from '../../../components/FillLevelSlider'
import type { LocationListItem } from '@bartools/types'
import { getLocations } from '../../../lib/api'
import { DEFAULT_VENUE_ID } from '../../../lib/config'
import { MOCK_LOCATIONS } from '../../../data/mockData'

export default function AddManuallyScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { photoUri } = useLocalSearchParams<{ photoUri?: string }>()

  const [name, setName] = useState('')
  const [category, _setCategory] = useState('bourbon')
  const [sizeMl, _setSizeMl] = useState('750')
  const [fillLevel, setFillLevel] = useState(100)
  const [_locations, setLocations] = useState<LocationListItem[]>([])
  const [location, setLocation] = useState('')

  // Load locations from API with mock fallback
  useEffect(() => {
    getLocations(DEFAULT_VENUE_ID)
      .then((res) => {
        setLocations(res.locations)
        if (res.locations.length > 0) setLocation(res.locations[0].name)
      })
      .catch(() => {
        const fallback = MOCK_LOCATIONS.map((l) => ({ id: l.id, name: l.name }))
        setLocations(fallback)
        if (fallback.length > 0) setLocation(fallback[0].name)
      })
  }, [])

  const handleSubmit = () => {
    console.log('Add to inventory:', { name, category, sizeMl, fillLevel, location, photoUri })
    router.back()
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>BarBack</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page title */}
        <Text style={[styles.title, { color: theme.onSurface }]}>Add Manually</Text>
        <Text style={[styles.subtitle, { color: theme.outline }]}>Precise entry for the discerning inventory</Text>

        {/* Photo preview (if provided) */}
        {photoUri ? (
          <View style={styles.imageSection}>
            <View style={[styles.imageContainer, { backgroundColor: theme.surfaceContainerHigh }]}>
              <Image source={{ uri: photoUri }} style={styles.image} resizeMode="cover" />
              <View style={styles.imageOverlay} />
              <Text style={[styles.imageLabel, { color: `${theme.onSurface}66` }]}>Reference Archive</Text>
            </View>
          </View>
        ) : null}

        {/* Bottle name */}
        <View style={styles.fieldGroup}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.primary }]}>Bottle Name</Text>
            <TextInput
              style={[styles.input, { color: theme.onSurface, borderBottomColor: theme.outline }]}
              placeholder="e.g. Buffalo Trace Kentucky Straight"
              placeholderTextColor={theme.surfaceVariant}
              value={name}
              onChangeText={setName}
            />
            <Text style={[styles.hint, { color: theme.outline }]}>Full name as shown on label</Text>
          </View>
        </View>

        {/* Category + Size fields */}
        <View style={styles.fieldGroup}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.primary }]}>Category</Text>
            <View style={[styles.selectField, { borderBottomColor: theme.outline }]}>
              <Text style={[styles.selectText, { color: theme.onSurface }]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={theme.outline} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.primary }]}>Size</Text>
            <View style={[styles.selectField, { borderBottomColor: theme.outline }]}>
              <Text style={[styles.selectText, { color: theme.onSurface }]}>{sizeMl}ml</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color={theme.outline} />
            </View>
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
          <View style={[styles.selectField, { borderBottomColor: theme.outline }]}>
            <Text style={[styles.selectText, { color: theme.onSurface }]}>{location}</Text>
            <MaterialCommunityIcons name="chevron-down" size={16} color={theme.outline} />
          </View>
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [styles.submitButton, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitText, { color: theme.onPrimary }]}>Add to Inventory</Text>
          <MaterialCommunityIcons name="plus-circle" size={18} color={theme.onPrimary} />
        </Pressable>

        <Text style={[styles.quote, { color: theme.outline }]}>
          "Quality is not an act, it is a habit."
        </Text>
      </ScrollView>
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
  imageSection: { marginBottom: 48 },
  imageContainer: {
    aspectRatio: 16 / 9,
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(19,19,19,0.6)',
  },
  imageLabel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 3,
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
  input: {
    fontFamily: 'Newsreader',
    fontSize: 20,
    borderBottomWidth: 1,
    paddingVertical: 8,
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
  },
  fillSection: { marginBottom: 48 },
  locationField: { marginBottom: 48, maxWidth: 300 },
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
