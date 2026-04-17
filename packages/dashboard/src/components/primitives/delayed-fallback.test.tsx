import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DelayedFallback } from './delayed-fallback'

describe('DelayedFallback', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits before showing loading content', async () => {
    vi.useFakeTimers()

    render(
      <DelayedFallback>
        <p>Loading recent reports.</p>
      </DelayedFallback>,
    )

    expect(screen.queryByText('Loading recent reports.')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120)
    })

    expect(screen.getByText('Loading recent reports.')).toBeInTheDocument()
  })
})
