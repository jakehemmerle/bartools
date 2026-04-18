import type { ReportBottleRecord } from '@bartools/types'
import { SurfaceCard } from '../../../components/primitives/surface-card'

export function ProcessingRecord({ record }: { record: ReportBottleRecord }) {
  return (
    <SurfaceCard
      className={`bt-processing-record${record.status === 'pending' ? ' bt-processing-record--pending' : ''}`}
      tone="base"
    >
      <div className="bt-processing-record__media">
        {record.imageUrl ? (
          <img alt={record.bottleName} height={96} src={record.imageUrl} width={72} />
        ) : (
          <div className="bt-processing-record__placeholder">◻</div>
        )}
      </div>
      <div className="bt-processing-record__summary">
        {record.status === 'pending' ? (
          <p className="bt-processing-record__pending">Processing…</p>
        ) : (
          <>
            <h3 className="bt-processing-record__title">{record.bottleName}</h3>
            <p className="bt-processing-record__meta">{record.category ?? 'Uncategorized'}</p>
          </>
        )}
      </div>
    </SurfaceCard>
  )
}
