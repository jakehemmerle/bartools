import type { PropsWithChildren } from 'react'

export function MetadataItem({
  children,
  label,
}: PropsWithChildren<{ label: string }>) {
  return (
    <div className="bt-metadata-item">
      <span className="bt-field__label">{label}</span>
      <span className="bt-metadata-item__value">{children}</span>
    </div>
  )
}

export function MetadataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="bt-metadata-line">
      <span className="bt-field__label">{label}</span>
      <span>{value}</span>
    </div>
  )
}
