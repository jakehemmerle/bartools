import type { ReportBottleRecord } from '@bartools/types'

export function RecordMedia({ record }: { record: ReportBottleRecord }) {
  if (!record.imageUrl) {
    return (
      <div className="bb-record-media bb-record-media--missing">
        <span aria-hidden="true">⌁</span>
        <p>Image unavailable</p>
      </div>
    )
  }

  return (
    <div className="bb-record-media">
      <img alt={record.bottleName} height={96} src={record.imageUrl} width={72} />
    </div>
  )
}
