import { View, Text, Pressable, Modal, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'

interface AddToInventorySheetProps {
  visible: boolean
  onDismiss: () => void
}

export function AddToInventorySheet({ visible, onDismiss }: Readonly<AddToInventorySheetProps>) {
  const theme = useTheme()
  const router = useRouter()

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
            <Text style={[styles.title, { color: theme.onSurface }]}>Add to Cellar</Text>

            {/* Scan New Bottle — primary action */}
            <Pressable
              style={({ pressed }) => [styles.scanButton, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
              onPress={() => { onDismiss(); router.push('/inventory/scan') }}
              accessible accessibilityRole="button" accessibilityLabel="Scan new bottle"
            >
              <View style={[styles.iconCircle, { backgroundColor: `${theme.onPrimary}1A` }]}>
                <MaterialCommunityIcons name="camera" size={28} color={theme.onPrimary} />
              </View>
              <View>
                <Text style={[styles.buttonTitle, { color: theme.onPrimary }]}>Scan New Bottle</Text>
                <Text style={[styles.buttonSubtitle, { color: theme.onPrimary, opacity: 0.7 }]}>Use camera for instant identification</Text>
              </View>
            </Pressable>

            {/* Add Manually — disabled/coming soon */}
            <View style={[styles.manualButton, { backgroundColor: theme.surfaceContainer, opacity: 0.8 }]}>
              <View style={[styles.iconCircle, { backgroundColor: theme.surfaceContainerHigh }]}>
                <MaterialCommunityIcons name="note-edit-outline" size={28} color={`${theme.outline}80`} />
              </View>
              <View style={styles.manualTextContainer}>
                <View style={styles.manualTitleRow}>
                  <Text style={[styles.buttonTitle, { color: `${theme.outline}80` }]}>Add Manually</Text>
                  <View style={[styles.comingSoonBadge, { borderColor: `${theme.outline}33` }]}>
                    <Text style={[styles.comingSoonText, { color: `${theme.outline}80` }]}>Coming Soon</Text>
                  </View>
                </View>
                <Text style={[styles.buttonSubtitle, { color: `${theme.outline}66` }]}>Enter bottle details by hand</Text>
              </View>
            </View>

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
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1 },
  handleContainer: { alignItems: 'center', paddingVertical: 16 },
  handle: { width: 48, height: 4, borderRadius: 2 },
  content: { paddingHorizontal: 24, paddingBottom: 48, gap: 16 },
  title: { fontFamily: 'Newsreader', fontSize: 24, fontWeight: '400', marginBottom: 8 },
  scanButton: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 12 },
  manualButton: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 12 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  buttonTitle: { fontFamily: 'SpaceGrotesk', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  buttonSubtitle: { fontFamily: 'Manrope', fontSize: 11, marginTop: 2 },
  manualTextContainer: { flex: 1 },
  manualTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  comingSoonBadge: { borderWidth: 1, borderRadius: 2, paddingHorizontal: 8, paddingVertical: 2 },
  comingSoonText: { fontFamily: 'SpaceGrotesk', fontSize: 9, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 2, fontStyle: 'italic' },
  dismissButton: { paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  dismissText: { fontFamily: 'SpaceGrotesk', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 3 },
})
