import { useState } from 'react'
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'
import { AlertCard } from './AlertCard'
import { GradientButton } from './GradientButton'
import { MOCK_LOW_STOCK_ALERTS } from '../data/mockData'

export function AlertBanner() {
  const theme = useTheme()
  const [showModal, setShowModal] = useState(false)
  const alertCount = MOCK_LOW_STOCK_ALERTS.length

  if (alertCount === 0) return null

  return (
    <>
      <Pressable
        onPress={() => setShowModal(true)}
        style={[styles.banner, { backgroundColor: theme.primaryContainer }]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${alertCount} low stock alerts. Tap to view.`}
      >
        <MaterialCommunityIcons name="alert-outline" size={20} color={theme.onPrimary} />
        <Text style={[styles.bannerText, { color: theme.onPrimary }]}>
          {alertCount} Low Stock Alert{alertCount !== 1 ? 's' : ''}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={theme.onPrimary} />
      </Pressable>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setShowModal(false)}
        >
          <Pressable
            style={[styles.sheet, { backgroundColor: theme.surfaceContainerHigh }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: theme.outlineVariant }]} />
            </View>

            <ScrollView
              style={styles.alertScroll}
              contentContainerStyle={styles.alertScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Title row: title left, warning icon right */}
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: theme.text }]}>Low Stock Alerts</Text>
                <MaterialCommunityIcons name="alert" size={24} color={theme.error} />
              </View>

              {/* Alert list */}
              {MOCK_LOW_STOCK_ALERTS.map(alert => (
                <AlertCard
                  key={`${alert.bottle.id}-${alert.location.id}`}
                  bottleName={alert.bottle.name}
                  location={alert.location.name}
                  fillPercent={alert.fillPercent}
                  parThreshold={alert.parThreshold}
                />
              ))}

              {/* Actions */}
              <View style={styles.sheetActions}>
                <GradientButton label="Export Alerts" onPress={() => {}} />
                <GradientButton label="Dismiss" variant="text" onPress={() => setShowModal(false)} />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  bannerText: {
    flex: 1,
    fontFamily: 'SpaceGrotesk',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontFamily: 'Newsreader',
    fontSize: 24,
    fontWeight: '600',
  },
  alertScroll: {
    maxHeight: 600,
  },
  alertScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  sheetActions: {
    paddingTop: 16,
    gap: 12,
  },
})
