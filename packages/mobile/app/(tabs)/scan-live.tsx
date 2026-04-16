import { StyleSheet, View } from 'react-native'
import { BottleSegOverlay } from '../../components/bottle-seg-overlay'

export default function ScanLiveScreen() {
  return (
    <View style={styles.flex}>
      <BottleSegOverlay />
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#000' },
})
