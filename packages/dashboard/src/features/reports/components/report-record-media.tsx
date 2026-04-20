import type { ReportBottleRecord } from '@bartools/types'
import {
  getReportRecordImageStateKey,
  useReportRecordImage,
} from './use-report-record-image'

export function RecordMedia({ record }: { record: ReportBottleRecord }) {
  return <ResolvedRecordMedia key={getReportRecordImageStateKey(record)} record={record} />
}

function ResolvedRecordMedia({ record }: { record: ReportBottleRecord }) {
  const { handleError, imageUrl, showFallback } = useReportRecordImage(record)

  if (showFallback) {
    return (
      <div className="bt-record-media bt-record-media--missing">
        <span aria-hidden="true">⌁</span>
        <p>Image unavailable</p>
      </div>
    )
  }

  return (
    <div className="bt-record-media">
      <a
        aria-label={`Open ${record.bottleName} image in a new tab`}
        className="bt-record-media__link"
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
    </div>
  )
}
