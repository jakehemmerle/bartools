import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

const defaultDelayMs = 120

export function DelayedFallback({
  children,
  delayMs = defaultDelayMs,
}: {
  children: ReactNode
  delayMs?: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsVisible(true)
    }, delayMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [delayMs])

  if (!isVisible) {
    return null
  }

  return children
}
