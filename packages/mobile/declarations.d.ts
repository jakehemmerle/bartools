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

// Metro resolves image/font requires to a numeric asset registry ID.
declare module '*.png' {
  const src: number
  export default src
}
declare module '*.jpg' {
  const src: number
  export default src
}
declare module '*.jpeg' {
  const src: number
  export default src
}
declare module '*.webp' {
  const src: number
  export default src
}
declare module '*.gif' {
  const src: number
  export default src
}
declare module '*.svg' {
  const src: number
  export default src
}
