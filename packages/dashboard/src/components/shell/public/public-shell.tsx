import type { PropsWithChildren } from 'react'

export function PublicShell({ children }: PropsWithChildren) {
  return (
    <div className="bb-public-shell">
      <div className="bb-public-shell__ghost" aria-hidden="true" />
      <main className="bb-public-shell__canvas">{children}</main>
    </div>
  )
}
