/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

const STORAGE_KEY = 'bartools.dashboard.fixture-persona'

export type FixturePersona = 'manager' | 'staff' | 'signed_out'

type FixtureSessionValue = {
  persona: FixturePersona
  signInAs: (persona: Exclude<FixturePersona, 'signed_out'>) => void
  signOut: () => void
}

const FixtureSessionContext = createContext<FixtureSessionValue | null>(null)

export function FixtureSessionProvider({ children }: PropsWithChildren) {
  const [persona, setPersona] = useState<FixturePersona>(() => {
    if (typeof window === 'undefined') {
      return 'signed_out'
    }

    const stored = window.localStorage.getItem(STORAGE_KEY)

    if (stored === 'manager' || stored === 'staff') {
      return stored
    }

    return 'signed_out'
  })

  useEffect(() => {
    if (persona === 'signed_out') {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    window.localStorage.setItem(STORAGE_KEY, persona)
  }, [persona])

  const value = useMemo<FixtureSessionValue>(
    () => ({
      persona,
      signInAs: setPersona,
      signOut: () => setPersona('signed_out'),
    }),
    [persona],
  )

  return (
    <FixtureSessionContext.Provider value={value}>
      {children}
    </FixtureSessionContext.Provider>
  )
}

export function useFixtureSession() {
  const value = useContext(FixtureSessionContext)

  if (!value) {
    throw new Error('useFixtureSession must be used within FixtureSessionProvider')
  }

  return value
}

export function resolvePersonaOverride(
  search: string,
  fallback: FixturePersona,
): FixturePersona {
  const persona = new URLSearchParams(search).get('persona')

  if (persona === 'manager' || persona === 'staff' || persona === 'signed_out') {
    return persona
  }

  return fallback
}
