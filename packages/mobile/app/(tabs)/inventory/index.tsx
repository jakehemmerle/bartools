import { useState, useMemo, useCallback } from 'react'
import { View, Text, TextInput, ScrollView, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../../../theme/useTheme'
import { AppHeader } from '../../../components/AppHeader'
import { FilterChip } from '../../../components/FilterChip'
import { BottleCard } from '../../../components/BottleCard'
import { AlertBanner } from '../../../components/AlertBanner'
import { AddToInventorySheet } from '../../../components/AddToInventorySheet'
import { getVenueInventory } from '../../../lib/api'
import { DEFAULT_VENUE_ID } from '../../../lib/config'
import {
  deriveCategories,
  filterInventory,
  groupByCategory,
  type InventorySectionItem,
} from '../../../lib/inventory-view'
import type { InventoryListItem } from '@bartools/types'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; items: InventoryListItem[] }
  | { status: 'error' }

export default function InventoryScreen() {
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('All Bottles')
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })

  const fetchInventory = useCallback(() => {
    setLoadState({ status: 'loading' })
    getVenueInventory(DEFAULT_VENUE_ID)
      .then((res) => setLoadState({ status: 'ready', items: res.items }))
      .catch(() => setLoadState({ status: 'error' }))
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchInventory()
    }, [fetchInventory]),
  )

  const items = loadState.status === 'ready' ? loadState.items : []

  const categories = useMemo(() => deriveCategories(items), [items])

  const filtered = useMemo(
    () => filterInventory(items, searchQuery, activeFilter),
    [items, searchQuery, activeFilter],
  )

  const sectionData = useMemo<InventorySectionItem[]>(
    () => groupByCategory(filtered),
    [filtered],
  )

  const totalCount = filtered.length

  const renderItem = ({ item }: { item: InventorySectionItem }) => {
    if (item.type === 'header') {
      return (
        <Text style={[styles.categoryHeader, { color: theme.textMuted }]}>
          {item.category.toUpperCase()}
        </Text>
      )
    }

    const { data } = item
    return (
      <View style={styles.cardWrapper}>
        <BottleCard
          name={data.name}
          subcategory={data.subcategory}
          sizeMl={data.sizeMl}
          fillPercent={data.fillPercent}
        />
      </View>
    )
  }

  const keyExtractor = (item: InventorySectionItem) => {
    if (item.type === 'header') return `header-${item.category}`
    return item.data.id
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
      <AppHeader />

      {/* Fixed header — search, chips, title */}
      <View>
        {/* Search — underline style */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <MaterialCommunityIcons name="magnify" size={20} color={theme.outline} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text, borderBottomColor: theme.outline }]}
              placeholder="Hunt for a specific bottle..."
              placeholderTextColor={`${theme.outline}80`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text style={[styles.searchSubtext, { color: theme.outline }]}>Search the collection</Text>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          style={styles.filtersRow}
        >
          {categories.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              active={activeFilter === filter}
              onPress={() => setActiveFilter(filter)}
            />
          ))}
        </ScrollView>

        {/* Section title */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          The Cellar ({totalCount} Spirit{totalCount !== 1 ? 's' : ''})
        </Text>
      </View>

      {/* Bottle list */}
      {loadState.status === 'loading' ? (
        <View style={styles.emptyState}>
          <ActivityIndicator color={theme.outline} />
        </View>
      ) : loadState.status === 'error' ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Couldn't load inventory.
          </Text>
          <Pressable onPress={fetchInventory} style={styles.retryButton} accessibilityRole="button">
            <Text style={[styles.retryText, { color: theme.primary }]}>Try again</Text>
          </Pressable>
        </View>
      ) : sectionData.length > 0 ? (
        <FlatList
          data={sectionData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<AlertBanner />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Your cellar is dry. Time to go shopping and stock up on the essentials.
          </Text>
        </View>
      )}

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowAddSheet(true)}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Add bottle"
      >
        <MaterialCommunityIcons name="plus" size={28} color={theme.onPrimary} />
      </Pressable>

      <AddToInventorySheet visible={showAddSheet} onDismiss={() => setShowAddSheet(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 0,
    bottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingLeft: 28,
    fontFamily: 'Manrope',
    fontSize: 15,
  },
  searchSubtext: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'right',
    marginTop: 4,
  },
  filtersRow: {
    flexGrow: 0,
    marginTop: 12,
    marginBottom: 4,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    minHeight: 36,
  },
  sectionTitle: {
    fontFamily: 'Newsreader',
    fontSize: 26,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  categoryHeader: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cardWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: {
    fontFamily: 'Manrope',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryText: {
    fontFamily: 'SpaceGrotesk',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
})
