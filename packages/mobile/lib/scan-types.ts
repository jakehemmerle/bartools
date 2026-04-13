export type ScanResult = {
  id: string
  photoUri: string
  status: 'pending' | 'identified' | 'unidentified' | 'error'
  bottle?: {
    brand: string
    product: string
    category: string
    fillLevel: number // 0-100
    confidence: number // 0-100
  }
  error?: string
}
