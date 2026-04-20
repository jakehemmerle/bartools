import { useRef, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type PhotoFile,
} from 'react-native-vision-camera';

type CameraCaptureProps = {
  onPhotoTaken: (uri: string) => void;
};

function NoCameraDevice() {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>No Camera Found</Text>
      <Text style={styles.subtitle}>
        This device does not have an available camera.
      </Text>
    </View>
  );
}

export function CameraCapture({ onPhotoTaken }: CameraCaptureProps) {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const takePhoto = useCallback(async () => {
    if (!cameraRef.current) return;
    const photo: PhotoFile = await cameraRef.current.takePhoto();
    const uri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
    onPhotoTaken(uri);
  }, [onPhotoTaken]);

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Camera Permission</Text>
        <Text style={styles.subtitle}>
          Allow BarTools to access your camera to scan bottles.
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={requestPermission}
        >
          <Text style={styles.settingsButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) return <NoCameraDevice />;

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  settingsButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
});
