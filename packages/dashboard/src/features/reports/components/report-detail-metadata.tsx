import type { PropsWithChildren } from 'react'

export function MetadataItem({
  children,
  label,
}: PropsWithChildren<{ label: string }>) {
  return (
    <div className="bb-metadata-item">
      <span className="bb-field__label">{label}</span>
      <span className="bb-metadata-item__value">{children}</span>
    </div>
  )
}

export function MetadataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="bb-metadata-line">
      <span className="bb-field__label">{label}</span>
      <span>{value}</span>
    </div>
  )
}
