import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReportBottleMatchField, type RecordSearchState } from './report-bottle-match-field'

const fixtureResults = [
  {
    id: 'bottle-1',
    name: 'Montelobos Mezcal',
    category: 'mezcal',
    upc: '618115630028',
    volumeMl: 750,
  },
  {
    id: 'bottle-2',
    name: 'Espolon Blanco',
    category: 'tequila',
    upc: '721059000018',
    volumeMl: 750,
  },
] as const

describe('ReportBottleMatchField', () => {
  it('renders search results as selectable buttons instead of a native select', () => {
    renderField({
      query: 'mezcal',
      results: [...fixtureResults],
    })

    expect(screen.getByRole('button', { name: /Montelobos Mezcal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Espolon Blanco/i })).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('shows the manual matching hint when no results exist for a non-empty query', () => {
    renderField({
      query: 'unknown bottle',
      results: [],
    })

    expect(screen.getByText('Needs manual matching.')).toBeInTheDocument()
  })

  it('marks the active bottle and notifies selection clicks', async () => {
    const user = userEvent.setup()
    const onSelectResult = vi.fn()

    renderField(
      {
        query: 'mezcal',
        results: [...fixtureResults],
      },
      {
        onSelectResult,
        selectedBottleId: 'bottle-1',
      },
    )

    expect(screen.getByText('Selected')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Espolon Blanco/i }))

    expect(onSelectResult).toHaveBeenCalledWith(fixtureResults[1])
  })
})

function renderField(
  search: RecordSearchState,
  overrides?: Partial<ComponentProps<typeof ReportBottleMatchField>>,
) {
  const onQueryChange = vi.fn()
  const onSearch = vi.fn()
  const onSelectResult = vi.fn()

  render(
    <ReportBottleMatchField
      inputId="product-match"
      onQueryChange={onQueryChange}
      onSearch={onSearch}
      onSelectResult={onSelectResult}
      search={search}
      selectedBottleId={null}
      {...overrides}
    />,
  )
}
