import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button, greet } from '@bartools/ui';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{greet('bartools')}</Text>
      <Text style={styles.count}>Count: {count}</Text>
      <Button label="Increment" onPress={() => setCount((c) => c + 1)} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: '600' },
  count: { fontSize: 16 },
});
