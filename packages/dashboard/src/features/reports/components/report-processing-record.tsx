import type { ReportBottleRecord } from '@bartools/types'
import { SurfaceCard } from '../../../components/primitives/surface-card'

export function ProcessingRecord({ record }: { record: ReportBottleRecord }) {
  return (
    <SurfaceCard
      className={`bb-processing-record${record.status === 'pending' ? ' bb-processing-record--pending' : ''}`}
      tone="base"
    >
      <div className="bb-processing-record__media">
        {record.imageUrl ? (
          <img alt={record.bottleName} src={record.imageUrl} />
        ) : (
          <div className="bb-processing-record__placeholder">◻</div>
        )}
      </div>
      <div className="bb-processing-record__summary">
        {record.status === 'pending' ? (
          <p className="bb-processing-record__pending">Processing...</p>
        ) : (
          <>
            <h3 className="bb-processing-record__title">{record.bottleName}</h3>
            <p className="bb-processing-record__meta">{record.category ?? 'Uncategorized'}</p>
          </>
        )}
      </div>
    </SurfaceCard>
  )
}
