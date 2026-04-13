import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import type { ThemeTokens } from '../theme/tokens';
import type { QueuedPhoto } from '../lib/use-batch-queue';

type BatchQueueProps = {
  photos: QueuedPhoto[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onDone?: () => void;
};

function QueueThumbnail({
  photo,
  onRemove,
  theme,
}: {
  photo: QueuedPhoto;
  onRemove: (id: string) => void;
  theme: ThemeTokens;
}) {
  return (
    <View style={styles.thumbnailContainer}>
      <Image source={{ uri: photo.uri }} style={[styles.thumbnail, { backgroundColor: theme.surfaceContainerHighest }]} />
      <TouchableOpacity
        style={[styles.removeButton, { backgroundColor: theme.error }]}
        onPress={() => onRemove(photo.id)}
      >
        <MaterialCommunityIcons name="close-circle" size={18} color={theme.onError} />
      </TouchableOpacity>
    </View>
  );
}

const DONE_WIDTH = Math.round(Dimensions.get('window').width * 0.1);

export function BatchQueue({ photos, onRemove, onClear, onDone }: BatchQueueProps) {
  const theme = useTheme();

  if (photos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No photos queued</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.count, { color: theme.text }]}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={[styles.clearText, { color: theme.error }]}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <QueueThumbnail photo={item} onRemove={onRemove} theme={theme} />
        )}
        ListFooterComponent={
          onDone ? (
            <Pressable
              onPress={onDone}
              style={({ pressed }) => [
                styles.doneButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
              ]}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Done — review scanned bottles"
            >
              <MaterialCommunityIcons name="check-circle" size={24} color={theme.onPrimary} />
            </Pressable>
          ) : null
        }
        ListFooterComponentStyle={styles.doneFooter}
      />
    </View>
  );
}

const THUMB_SIZE = 72;

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  doneFooter: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  doneButton: {
    width: DONE_WIDTH,
    height: THUMB_SIZE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
