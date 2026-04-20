import type { ReportBottleRecord } from '@bartools/types'
import { SurfaceCard } from '../../../components/primitives/surface-card'
import {
  getReportRecordImageStateKey,
  useReportRecordImage,
} from './use-report-record-image'

export function ProcessingRecord({ record }: { record: ReportBottleRecord }) {
  return <ResolvedProcessingRecord key={getReportRecordImageStateKey(record)} record={record} />
}

function ResolvedProcessingRecord({ record }: { record: ReportBottleRecord }) {
  const { handleError, imageUrl, showFallback } = useReportRecordImage(record)

  return (
    <SurfaceCard
      className={`bt-processing-record${record.status === 'pending' ? ' bt-processing-record--pending' : ''}`}
      tone="base"
    >
      <div className="bt-processing-record__media">
        {!showFallback ? (
          <a
            aria-label={`Open ${record.bottleName} image in a new tab`}
            className="bt-processing-record__media-link"
            href={imageUrl}
            rel="noopener noreferrer"
            target="_blank"
            title="Open full image in a new tab"
          >
            <img
              alt={record.bottleName}
              height={96}
              onError={handleError}
              src={imageUrl}
              width={72}
            />
          </a>
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
