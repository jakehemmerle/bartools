import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

const localStorageStore = new Map<string, string>()
const sessionStorageStore = new Map<string, string>()

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: (key: string) => localStorageStore.get(key) ?? null,
    setItem: (key: string, value: string) => {
      localStorageStore.set(key, value)
    },
    removeItem: (key: string) => {
      localStorageStore.delete(key)
    },
    clear: () => {
      localStorageStore.clear()
    },
  },
})

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: {
    getItem: (key: string) => sessionStorageStore.get(key) ?? null,
    setItem: (key: string, value: string) => {
      sessionStorageStore.set(key, value)
    },
    removeItem: (key: string) => {
      sessionStorageStore.delete(key)
    },
    clear: () => {
      sessionStorageStore.clear()
    },
  },
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
})

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
})

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
})
