import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, TextInput, Pressable, Modal, FlatList, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { BottleSearchResult } from '@bartools/types'
import { searchBottles } from '../lib/api'
import { useTheme } from '../theme/useTheme'

interface BottleSearchModalProps {
  visible: boolean
  onDismiss: () => void
  onSelect: (bottle: BottleSearchResult) => void
}

export function BottleSearchModal({ visible, onDismiss, onSelect }: Readonly<BottleSearchModalProps>) {
  const theme = useTheme()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BottleSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = q.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      return
    }

    requestIdRef.current += 1
    const requestId = requestIdRef.current

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await searchBottles(trimmed)
        if (requestIdRef.current === requestId) {
          setResults(res.bottles)
        }
      } catch {
        if (requestIdRef.current === requestId) {
          setResults([])
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false)
        }
      }
    }, 300)
  }, [])

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- debounced search triggered by query/visible changes
      doSearch(query)
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, visible, doSearch])

  // Reset on close
  useEffect(() => {
    if (!visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset modal state when it closes
      setQuery('')
      setResults([])
    }
  }, [visible])

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.surfaceContainerHigh }]} onPress={e => e.stopPropagation()}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: `${theme.outlineVariant}66` }]} />
          </View>

          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.onSurface }]}>Search Bottles</Text>

            {/* Search input */}
            <View style={[styles.searchRow, { borderBottomColor: theme.outline }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={theme.outline} />
              <TextInput
                style={[styles.searchInput, { color: theme.onSurface }]}
                placeholder="Type to search..."
                placeholderTextColor={theme.outline}
                value={query}
                onChangeText={(text) => {
                  setQuery(text)
                  doSearch(text)
                }}
                autoFocus
              />
            </View>

            {/* Results */}
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              style={styles.resultsList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.resultRow,
                    { backgroundColor: pressed ? theme.surfaceContainer : 'transparent' },
                  ]}
                  onPress={() => onSelect(item)}
                >
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, { color: theme.onSurface }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.resultMeta, { color: theme.outline }]}>
                      {item.category}{item.volumeMl ? ` · ${item.volumeMl}ml` : ''}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={theme.outline} />
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.outline }]}>
                  {loading ? 'Searching...' : query ? 'No matches found' : 'Start typing to search'}
                </Text>
              }
            />

            {/* Dismiss */}
            <Pressable onPress={onDismiss} style={styles.dismissButton}>
              <Text style={[styles.dismissText, { color: theme.outline }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  handleContainer: { alignItems: 'center', paddingVertical: 12 },
  handle: { width: 48, height: 4, borderRadius: 2 },
  content: { paddingHorizontal: 24, paddingBottom: 36, gap: 12 },
  title: { fontFamily: 'Newsreader', fontSize: 22, fontWeight: '400' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope',
    fontSize: 16,
    paddingVertical: 4,
  },
  resultsList: { maxHeight: 300 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  resultInfo: { flex: 1 },
  resultName: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '600' },
  resultMeta: { fontFamily: 'SpaceGrotesk', fontSize: 11, marginTop: 2 },
  emptyText: { fontFamily: 'Manrope', fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  dismissButton: { paddingVertical: 12, alignItems: 'center' },
  dismissText: { fontFamily: 'SpaceGrotesk', fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 3 },
})
