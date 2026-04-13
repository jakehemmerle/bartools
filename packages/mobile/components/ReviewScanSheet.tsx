import { View, Text, Pressable, Modal, StyleSheet, ScrollView, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'
import type { ScanResult } from '../lib/scan-types'

interface ReviewScanSheetProps {
  visible: boolean
  onDismiss: () => void
  results: ScanResult[]
  onSync: () => void
}

function ResultCard({ result, onPress }: { result: ScanResult; onPress: () => void }) {
  const theme = useTheme()
  const isIdentified = result.status === 'identified' && result.bottle

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.resultCard, { backgroundColor: theme.surfaceContainer, borderColor: `${theme.outlineVariant}33`, opacity: pressed ? 0.8 : 1 }]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={isIdentified && result.bottle ? `Review ${result.bottle.brand}` : 'Add details for unidentified bottle'}
    >
      {/* Thumbnail */}
      <Image source={{ uri: result.photoUri }} style={styles.thumbnail} />

      {/* Details */}
      <View style={styles.resultDetails}>
        {isIdentified && result.bottle ? (
          <>
            <Text style={[styles.bottleBrand, { color: theme.onSurface }]}>
              {result.bottle.brand}
            </Text>
            <Text style={[styles.bottleProduct, { color: theme.onSurfaceVariant }]}>
              {result.bottle.product} - {result.bottle.category}
            </Text>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: theme.outline }]}>
                Fill: {result.bottle.fillLevel}%
              </Text>
              <Text style={[styles.metaLabel, { color: theme.outline }]}>
                Conf: {result.bottle.confidence}%
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.bottleBrand, { color: theme.error ?? '#ef4444' }]}>
              Unidentified
            </Text>
            <Text style={[styles.bottleProduct, { color: theme.onSurfaceVariant }]}>
              Needs manual review
            </Text>
          </>
        )}
      </View>

      {/* Status icon */}
      <View style={[styles.statusIcon, { backgroundColor: isIdentified ? '#22c55e22' : '#ef444422' }]}>
        <MaterialCommunityIcons
          name={isIdentified ? 'check-circle' : 'help-circle'}
          size={20}
          color={isIdentified ? '#22c55e' : '#ef4444'}
        />
      </View>
    </Pressable>
  )
}

export function ReviewScanSheet({ visible, onDismiss, results, onSync }: Readonly<ReviewScanSheetProps>) {
  const theme = useTheme()
  const router = useRouter()
  const identified = results.filter(r => r.status === 'identified').length
  const unidentified = results.length - identified

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
            <Text style={[styles.title, { color: theme.onSurface }]}>Review Scan Results</Text>

            {/* Summary */}
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryText, { color: theme.onSurfaceVariant }]}>
                {identified} identified, {unidentified} unidentified
              </Text>
            </View>

            {/* Results list */}
            <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
              {results.map(result => (
                <ResultCard
                  key={result.id}
                  result={result}
                  onPress={() => {
                    onDismiss()
                    if (result.status === 'identified') {
                      router.push({
                        pathname: '/inventory/confirm',
                        params: { photoUri: result.photoUri, identified: 'true' },
                      })
                    } else {
                      router.push({
                        pathname: '/inventory/add-manually',
                        params: { photoUri: result.photoUri },
                      })
                    }
                  }}
                />
              ))}
            </ScrollView>

            {/* Sync button */}
            <Pressable
              style={({ pressed }) => [styles.syncButton, { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 }]}
              onPress={onSync}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Sync to inventory"
            >
              <MaterialCommunityIcons name="cloud-upload" size={20} color={theme.onPrimary} />
              <Text style={[styles.syncButtonText, { color: theme.onPrimary }]}>SYNC TO INVENTORY</Text>
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
  summaryRow: { marginBottom: 4 },
  summaryText: { fontFamily: 'Manrope', fontSize: 13 },
  resultsList: { maxHeight: 320 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  thumbnail: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#333' },
  resultDetails: { flex: 1 },
  bottleBrand: { fontFamily: 'SpaceGrotesk', fontSize: 14, fontWeight: '700' },
  bottleProduct: { fontFamily: 'Manrope', fontSize: 11, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  metaLabel: { fontFamily: 'Manrope', fontSize: 10 },
  statusIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  syncButtonText: { fontFamily: 'SpaceGrotesk', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 },
  dismissButton: { paddingVertical: 12, alignItems: 'center' },
  dismissText: { fontFamily: 'SpaceGrotesk', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 3 },
})
