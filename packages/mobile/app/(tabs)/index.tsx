import { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useBatchQueue } from '../../lib/use-batch-queue';
import { CameraCapture } from '../../components/camera-capture';
import { BatchQueue } from '../../components/batch-queue';
import { LocationSelector } from '../../components/location-selector';
import type { Location } from '../../types';

// Mock locations until backend is wired up (M2)
const MOCK_LOCATIONS: Location[] = [
  { id: 'loc-1', venueId: 'v-1', name: 'Main Bar', createdAt: '' },
  { id: 'loc-2', venueId: 'v-1', name: 'Pool Bar', createdAt: '' },
  { id: 'loc-3', venueId: 'v-1', name: 'Liquor Room', createdAt: '' },
];

type CaptureMode = 'queue' | 'camera';

export default function CaptureScreen() {
  const { photos, isEmpty, addPhoto, addPhotos, removePhoto, clear } =
    useBatchQueue();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [mode, setMode] = useState<CaptureMode>('queue');

  const handlePhotoTaken = useCallback(
    (uri: string) => {
      addPhoto(uri);
      setMode('queue');
    },
    [addPhoto],
  );

  const pickFromLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      addPhotos(result.assets.map((a) => a.uri));
    }
  }, [addPhotos]);

  const handleSubmit = useCallback(() => {
    // TODO (M4/M5): POST batch to backend, navigate to review screen
    console.log('Submit batch:', {
      photoCount: photos.length,
      locationId: selectedLocation,
    });
  }, [photos, selectedLocation]);

  if (mode === 'camera') {
    return (
      <View style={styles.fullScreen}>
        <CameraCapture onPhotoTaken={handlePhotoTaken} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setMode('queue')}
        >
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canSubmit = !isEmpty && selectedLocation !== null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LocationSelector
          locations={MOCK_LOCATIONS}
          selectedId={selectedLocation}
          onSelect={setSelectedLocation}
        />

        <BatchQueue photos={photos} onRemove={removePhoto} onClear={clear} />

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setMode('camera')}
          >
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={pickFromLibrary}
          >
            <Text style={styles.actionButtonText}>Photo Library</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text
            style={[
              styles.submitButtonText,
              !canSubmit && styles.submitButtonTextDisabled,
            ]}
          >
            Submit Batch{!isEmpty ? ` (${photos.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullScreen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 16,
    gap: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  submitButtonTextDisabled: {
    color: '#9ca3af',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
