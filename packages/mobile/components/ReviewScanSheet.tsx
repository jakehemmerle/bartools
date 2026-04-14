import { View, Text, Pressable, Modal, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'

type QueuedPhoto = { uri: string; id: string }

interface ReviewScanSheetProps {
  visible: boolean
  onDismiss: () => void
  photos: QueuedPhoto[]
  onSubmit: () => void
  submitting: boolean
}

function PhotoThumbnail({ uri }: { uri: string }) {
  const theme = useTheme()
  return (
    <Image
      source={{ uri }}
      style={[styles.thumbnail, { backgroundColor: theme.surfaceContainerHigh }]}
    />
  )
}

export function ReviewScanSheet({ visible, onDismiss, photos, onSubmit, submitting }: Readonly<ReviewScanSheetProps>) {
  const theme = useTheme()

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={[styles.sheet, { backgroundColor: `${theme.background}E6`, borderTopColor: `${theme.outlineVariant}33` }]} onPress={e => e.stopPropagation()}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: `${theme.outlineVariant}66` }]} />
          </View>

          <View style={styles.content}>
            {/* Title */}
            <Text style={[styles.title, { color: theme.onSurface }]}>Submit for Analysis</Text>

            {/* Summary */}
            <Text style={[styles.summaryText, { color: theme.onSurfaceVariant }]}>
              {photos.length} photo{photos.length !== 1 ? 's' : ''} ready for identification
            </Text>

            {/* Photo grid */}
            <FlatList
              data={photos}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoGrid}
              renderItem={({ item }) => <PhotoThumbnail uri={item.uri} />}
              style={styles.photoList}
            />

            {/* Submit button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: theme.primary, opacity: submitting ? 0.6 : pressed ? 0.9 : 1 },
              ]}
              onPress={onSubmit}
              disabled={submitting || photos.length === 0}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Submit for analysis"
            >
              {submitting ? (
                <ActivityIndicator color={theme.onPrimary} size="small" />
              ) : (
                <MaterialCommunityIcons name="flask-outline" size={20} color={theme.onPrimary} />
              )}
              <Text style={[styles.submitButtonText, { color: theme.onPrimary }]}>
                {submitting ? 'SUBMITTING...' : 'SUBMIT FOR ANALYSIS'}
              </Text>
            </Pressable>

            {/* Dismiss */}
            <Pressable onPress={onDismiss} style={styles.dismissButton} accessible accessibilityRole="button" accessibilityLabel="Dismiss">
              <Text style={[styles.dismissText, { color: theme.outline }]}>Dismiss</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, maxHeight: '85%' },
  handleContainer: { alignItems: 'center', paddingVertical: 16 },
  handle: { width: 48, height: 4, borderRadius: 2 },
  content: { paddingHorizontal: 24, paddingBottom: 48, gap: 12 },
  title: { fontFamily: 'Newsreader', fontSize: 24, fontWeight: '400' },
  summaryText: { fontFamily: 'Manrope', fontSize: 13 },
  photoList: { maxHeight: 80 },
  photoGrid: { gap: 8 },
  thumbnail: { width: 64, height: 64, borderRadius: 8 },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonText: { fontFamily: 'SpaceGrotesk', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 },
  dismissButton: { paddingVertical: 12, alignItems: 'center' },
  dismissText: { fontFamily: 'SpaceGrotesk', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 3 },
})
