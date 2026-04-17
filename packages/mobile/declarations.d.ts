// Type declarations for packages without bundled types

declare module 'react-native-sse' {
  export default class EventSource {
    constructor(url: string, options?: { headers?: Record<string, string> })
    addEventListener(event: string, callback: (event: MessageEvent) => void): void
    removeEventListener(event: string, callback: (event: MessageEvent) => void): void
    close(): void
  }
}

// React Native extends FormData to accept file-like objects with {uri, type, name}
interface FormDataFileValue {
  uri: string
  type: string
  name: string
}

interface FormData {
  append(name: string, value: FormDataFileValue): void
}
