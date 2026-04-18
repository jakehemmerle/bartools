import type { SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hideLabel?: boolean
  label: string
}

export function Select({ className = '', hideLabel = false, id, label, ...props }: SelectProps) {
  const fieldId = id ?? label.toLowerCase().replaceAll(/\s+/g, '-')

  return (
    <label className="bt-field">
      <span className={`bt-field__label${hideLabel ? ' sr-only' : ''}`}>{label}</span>
      <select className={`bt-select${className ? ` ${className}` : ''}`} id={fieldId} {...props} />
    </label>
  )
}
