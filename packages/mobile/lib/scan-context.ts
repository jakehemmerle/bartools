import { createContext, useContext } from 'react'

type ScanContextValue = {
  photoUri: string | null
  setPhotoUri: (uri: string | null) => void
}

export const ScanContext = createContext<ScanContextValue>({
  photoUri: null,
  setPhotoUri: () => {
    if (__DEV__) console.warn('ScanContext provider missing: setPhotoUri call ignored')
  },
})

export function useScanContext() {
  return useContext(ScanContext)
}
