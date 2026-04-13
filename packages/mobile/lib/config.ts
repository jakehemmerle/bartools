import Constants from 'expo-constants'

const devBackendUrl = Constants.expoConfig?.extra?.backendUrl ?? 'http://localhost:3000'

export const API_BASE_URL: string = __DEV__ ? devBackendUrl : 'https://api.bartools.wtf'

// Hardcoded until auth is implemented
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'
export const DEFAULT_VENUE_ID = '00000000-0000-0000-0000-000000000001'
