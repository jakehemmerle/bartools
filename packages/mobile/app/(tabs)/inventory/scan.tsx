import { useCallback } from 'react'
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { CameraCapture } from '../../../components/camera-capture'
import { useTheme } from '../../../theme/useTheme'
import { useScanContext } from '../../../lib/scan-context'

export default function InventoryScanScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { setPhotoUri } = useScanContext()

  const handlePhotoTaken = useCallback((uri: string) => {
    setPhotoUri(uri)
    router.replace({
      pathname: '/inventory/confirm',
      params: { identified: 'true' },
    })
  }, [router, setPhotoUri])

  const pickFromLibrary = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Media library access is needed to select photos.')
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      })
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri)
        router.replace({
          pathname: '/inventory/confirm',
          params: { identified: 'true' },
        })
      }
    } catch {
      Alert.alert('Error', 'Could not open photo library. Please try again.')
    }
  }, [router, setPhotoUri])

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Camera viewfinder */}
      <CameraCapture onPhotoTaken={handlePhotoTaken} />

      {/* Header overlay */}
      <SafeAreaView edges={['top']} style={styles.headerOverlay}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>BarTools</Text>
        </View>
      </SafeAreaView>

      {/* Bottom controls overlay */}
      <SafeAreaView edges={['bottom']} style={styles.bottomOverlay}>
        <View style={styles.bottomControls}>
          {/* Photo library button */}
          <Pressable
            onPress={pickFromLibrary}
            style={[styles.sideButton, { backgroundColor: `${theme.surfaceContainerHigh}99` }]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Choose from photo library"
          >
            <MaterialCommunityIcons name="image-outline" size={24} color={theme.primary} />
          </Pressable>

          {/* Cancel button */}
          <Pressable
            onPress={() => router.back()}
            style={[styles.cancelButton, { backgroundColor: `${theme.surfaceContainerHigh}CC` }]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Cancel scan"
          >
            <Text style={[styles.cancelText, { color: theme.primary }]}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
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
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  cancelText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 14,
    fontWeight: '600',
  },
})
