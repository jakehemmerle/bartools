import type { HTMLAttributes, PropsWithChildren } from 'react'

type SurfaceTone = 'low' | 'base' | 'high' | 'canvas'

type SurfaceCardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    tone?: SurfaceTone
  }
>

export function SurfaceCard({
  children,
  className = '',
  tone = 'low',
  ...rest
}: SurfaceCardProps) {
  return (
    <div
      className={`bt-surface-card bt-surface-card--${tone}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </div>
  )
}
