import type { ReactNode } from 'react'
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components'
import { Link } from 'react-router-dom'

type AppButtonProps = Omit<AriaButtonProps, 'className' | 'children'> & {
  children: ReactNode
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  to?: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({
  children,
  className = '',
  disabled = false,
  fullWidth = false,
  to,
  variant = 'primary',
  ...props
}: AppButtonProps) {
  const classes = [
    'bb-button',
    `bb-button--${variant}`,
    fullWidth ? 'bb-button--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link
        aria-disabled={disabled || undefined}
        className={classes}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault()
          }
        }}
        to={to}
      >
        {children}
      </Link>
    )
  }

  return (
    <AriaButton className={classes} isDisabled={disabled} {...props}>
      {children}
    </AriaButton>
  )
}
