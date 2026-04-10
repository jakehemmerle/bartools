import type { SessionListItem } from './fixtures/schemas'

export function sortSessionsNewestFirst(sessions: SessionListItem[]) {
  return [...sessions].sort((left, right) => {
    return getSessionTimestamp(right) - getSessionTimestamp(left)
  })
}

function getSessionTimestamp(session: SessionListItem) {
  const fallback = session.startedAt ?? session.completedAt

  if (!fallback) {
    return 0
  }

  return new Date(fallback).getTime()
}
