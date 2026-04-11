import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { Location } from '../types';

type LocationSelectorProps = {
  locations: Location[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function LocationSelector({
  locations,
  selectedId,
  onSelect,
}: LocationSelectorProps) {
  if (locations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.empty}>No locations configured</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Location</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {locations.map((loc) => (
          <TouchableOpacity
            key={loc.id}
            style={[
              styles.chip,
              selectedId === loc.id && styles.chipSelected,
            ]}
            onPress={() => onSelect(loc.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedId === loc.id && styles.chipTextSelected,
              ]}
            >
              {loc.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: {
    fontSize: 14,
    color: '#9ca3af',
  },
  chips: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
});
