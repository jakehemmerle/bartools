import { StyleSheet, Text, View } from 'react-native';

export default function CaptureScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Capture</Text>
      <Text style={styles.subtitle}>Take photos of bottles to scan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: { fontSize: 24, fontWeight: '600' },
  subtitle: { fontSize: 16, color: '#6b7280' },
});
