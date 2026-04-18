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
  placeholder = 'Search to rematch…',
  search,
  selectedBottleId,
}: ReportBottleMatchFieldProps) {
  const showManualMatchHint = search.query.trim().length > 0 && search.results.length === 0
  const showCurrentMatchHint =
    Boolean(selectedBottleId) && search.results.length === 0 && search.query.trim().length > 0

  return (
    <div className="bt-bottle-match">
      <label className="bt-field" htmlFor={inputId}>
        <span className="bt-field__label">{label}</span>
        <div className="bt-search-field">
          <span aria-hidden="true" className="bt-search-field__icon">
            ⌕
          </span>
          <input
            className="bt-input bt-input--search"
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
        <div aria-label={`${label} results`} className="bt-bottle-match__results">
          {search.results.map((result) => {
            const isSelected = result.id === selectedBottleId

            return (
              <button
                className={`bt-bottle-match__option${isSelected ? ' is-selected' : ''}`}
                key={result.id}
                onClick={() => onSelectResult(result)}
                type="button"
              >
                <span className="bt-bottle-match__copy">
                  <span className="bt-bottle-match__name">{result.name}</span>
                  <span className="bt-bottle-match__meta">{buildBottleSearchMeta(result)}</span>
                </span>
                {isSelected ? <span className="bt-bottle-match__tag">Selected</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}

      {showCurrentMatchHint ? (
        <p className="bt-field__hint">Current match: {search.query}.</p>
      ) : null}

      {showManualMatchHint && !showCurrentMatchHint ? (
        <p className="bt-field__hint">{emptyHint}</p>
      ) : null}
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
