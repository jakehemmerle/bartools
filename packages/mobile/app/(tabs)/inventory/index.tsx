import { useState, useMemo } from 'react'
import { View, Text, TextInput, ScrollView, FlatList, Pressable, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '../../../theme/useTheme'
import { AppHeader } from '../../../components/AppHeader'
import { FilterChip } from '../../../components/FilterChip'
import { BottleCard } from '../../../components/BottleCard'
import { AlertBanner } from '../../../components/AlertBanner'
import { AddToInventorySheet } from '../../../components/AddToInventorySheet'
import { MOCK_BOTTLES, MOCK_INVENTORY, INVENTORY_FILTERS } from '../../../data/mockData'
import type { Bottle } from '../../../types'

type BottleWithFill = Bottle & { fillPercent: number }

type SectionItem =
  | { type: 'header'; category: string }
  | { type: 'bottle'; data: BottleWithFill }

export default function InventoryScreen() {
  const theme = useTheme()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('All Bottles')
  const [showAddSheet, setShowAddSheet] = useState(false)

  const bottlesWithFill = useMemo<BottleWithFill[]>(() => {
    return MOCK_BOTTLES.map((bottle) => {
      const inv = MOCK_INVENTORY.find((i) => i.bottleId === bottle.id)
      return { ...bottle, fillPercent: inv ? inv.fillLevelTenths * 10 : 0 }
    })
  }, [])

  const filteredBottles = useMemo(() => {
    let result = bottlesWithFill

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (b) =>
          b.brand.toLowerCase().includes(q) ||
          b.product.toLowerCase().includes(q),
      )
    }

    // Filter by category
    if (activeFilter !== 'All Bottles') {
      const cat = activeFilter.toLowerCase()
      result = result.filter((b) => b.category === cat)
    }

    return result
  }, [bottlesWithFill, searchQuery, activeFilter])

  const sectionData = useMemo<SectionItem[]>(() => {
    // Group by category
    const groups = new Map<string, BottleWithFill[]>()
    for (const bottle of filteredBottles) {
      const cat = bottle.category
      if (!groups.has(cat)) groups.set(cat, [])
      groups.get(cat)!.push(bottle)
    }

    const items: SectionItem[] = []
    for (const [category, bottles] of groups) {
      items.push({ type: 'header', category })
      for (const bottle of bottles) {
        items.push({ type: 'bottle', data: bottle })
      }
    }
    return items
  }, [filteredBottles])

  const totalCount = filteredBottles.length

  const renderItem = ({ item }: { item: SectionItem }) => {
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
          brand={data.brand}
          product={data.product}
          subcategory={data.subcategory}
          sizeMl={data.sizeMl}
          fillPercent={data.fillPercent}
        />
      </View>
    )
  }

  const keyExtractor = (item: SectionItem, index: number) => {
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
          {INVENTORY_FILTERS.map((filter) => (
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
      {sectionData.length > 0 ? (
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
  },
  emptyText: {
    fontFamily: 'Manrope',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
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
