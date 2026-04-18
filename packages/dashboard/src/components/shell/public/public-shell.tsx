import type { PropsWithChildren } from 'react'

export function PublicShell({ children }: PropsWithChildren) {
  return (
    <div className="bt-public-shell">
      <div className="bt-public-shell__ghost" aria-hidden="true" />
      <main className="bt-public-shell__canvas">{children}</main>
    </div>
  )
}
