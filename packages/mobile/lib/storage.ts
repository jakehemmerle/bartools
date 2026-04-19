import AsyncStorage from '@react-native-async-storage/async-storage'

const AGE_VERIFIED_KEY = 'bartools:age_verified'

export async function getAgeVerified(): Promise<boolean> {
  const value = await AsyncStorage.getItem(AGE_VERIFIED_KEY)
  return value === 'true'
}

export async function setAgeVerified(): Promise<void> {
  await AsyncStorage.setItem(AGE_VERIFIED_KEY, 'true')
}
