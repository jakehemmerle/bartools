import { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { AgeGate } from '../components/AgeGate'
import { getAgeVerified } from '../lib/storage'

export default function RootLayout() {
  const [ageVerified, setAgeVerified] = useState<boolean | null>(null)

  useEffect(() => {
    getAgeVerified().then(setAgeVerified)
  }, [])

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {ageVerified === null ? (
          <View style={{ flex: 1, backgroundColor: '#131313' }} />
        ) : ageVerified ? (
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="review" options={{ headerShown: false, presentation: 'modal' }} />
          </Stack>
        ) : (
          <AgeGate onVerified={() => setAgeVerified(true)} />
        )}
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}
