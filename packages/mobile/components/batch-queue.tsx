import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import type { QueuedPhoto } from '../lib/use-batch-queue';

type BatchQueueProps = {
  photos: QueuedPhoto[];
  onRemove: (id: string) => void;
  onClear: () => void;
};

function QueueThumbnail({
  photo,
  onRemove,
}: {
  photo: QueuedPhoto;
  onRemove: (id: string) => void;
}) {
  return (
    <View style={styles.thumbnailContainer}>
      <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(photo.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

export function BatchQueue({ photos, onRemove, onClear }: BatchQueueProps) {
  if (photos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No photos queued</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.count}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <QueueThumbnail photo={item} onRemove={onRemove} />
        )}
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
    color: '#374151',
  },
  clearText: {
    fontSize: 14,
    color: '#ef4444',
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
    backgroundColor: '#e5e7eb',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
