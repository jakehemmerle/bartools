import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/useTheme';
import type { Location } from '@bartools/types';

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
  const theme = useTheme();

  if (locations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: theme.textMuted }]}>Location</Text>
        <Text style={[styles.empty, { color: theme.textMuted }]}>No locations configured</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Location</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {locations.map((loc) => {
          const isSelected = selectedId === loc.id;
          return (
            <TouchableOpacity
              key={loc.id}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surfaceContainerHigh,
                  borderColor: isSelected ? theme.primary : theme.outlineVariant,
                },
              ]}
              onPress={() => onSelect(loc.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? theme.onPrimary : theme.onSurfaceVariant },
                ]}
              >
                {loc.name}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: {
    fontSize: 14,
  },
  chips: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
