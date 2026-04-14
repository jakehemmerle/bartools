import { useState } from 'react'
import { Stack } from 'expo-router'
import { ScanContext } from '../../../lib/scan-context'

export default function InventoryLayout() {
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  return (
    <ScanContext.Provider value={{ photoUri, setPhotoUri }}>
      <Stack screenOptions={{ headerShown: false }} />
    </ScanContext.Provider>
  )
}
