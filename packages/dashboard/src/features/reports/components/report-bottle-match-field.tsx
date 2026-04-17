import type { BottleSearchResult } from '@bartools/types'

export type RecordSearchState = {
  query: string
  results: BottleSearchResult[]
}

type ReportBottleMatchFieldProps = {
  emptyHint?: string
  inputId: string
  label?: string
  onQueryChange: (query: string) => void
  onSearch: (query: string) => void
  onSelectResult: (result: BottleSearchResult) => void
  placeholder?: string
  search: RecordSearchState
  selectedBottleId: string | null
}

export function ReportBottleMatchField({
  emptyHint = 'Needs manual matching.',
  inputId,
  label = 'Product Match',
  onQueryChange,
  onSearch,
  onSelectResult,
  placeholder = 'Search to rematch...',
  search,
  selectedBottleId,
}: ReportBottleMatchFieldProps) {
  const showManualMatchHint = search.query.trim().length > 0 && search.results.length === 0

  return (
    <div className="bb-bottle-match">
      <label className="bb-field" htmlFor={inputId}>
        <span className="bb-field__label">{label}</span>
        <div className="bb-search-field">
          <span aria-hidden="true" className="bb-search-field__icon">
            ⌕
          </span>
          <input
            className="bb-input bb-input--search"
            id={inputId}
            onChange={(event) => {
              const query = event.currentTarget.value
              onQueryChange(query)
              onSearch(query)
            }}
            placeholder={placeholder}
            value={search.query}
          />
        </div>
      </label>

      {search.results.length > 0 ? (
        <div aria-label={`${label} results`} className="bb-bottle-match__results">
          {search.results.map((result) => {
            const isSelected = result.id === selectedBottleId

            return (
              <button
                className={`bb-bottle-match__option${isSelected ? ' is-selected' : ''}`}
                key={result.id}
                onClick={() => onSelectResult(result)}
                type="button"
              >
                <span className="bb-bottle-match__copy">
                  <span className="bb-bottle-match__name">{result.name}</span>
                  <span className="bb-bottle-match__meta">{buildBottleSearchMeta(result)}</span>
                </span>
                {isSelected ? <span className="bb-bottle-match__tag">Selected</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}

      {showManualMatchHint ? <p className="bb-field__hint">{emptyHint}</p> : null}
    </div>
  )
}

function buildBottleSearchMeta(result: BottleSearchResult) {
  const meta: string[] = [result.category]

  if (result.volumeMl) {
    meta.push(`${result.volumeMl} ml`)
  }

  if (result.upc) {
    meta.push(`UPC ${result.upc}`)
  }

  return meta.join(' • ')
}
