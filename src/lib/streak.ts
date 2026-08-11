import { addDaysLocal, toLocalDateString } from './dateUtils'

export function calculateStreak(
  activeDates: Set<string> | string[],
  referenceDate: Date = new Date(),
): number {
  const active = activeDates instanceof Set ? activeDates : new Set(activeDates)
  const todayStr = toLocalDateString(referenceDate)

  let cursor = todayStr
  if (!active.has(cursor)) {
    const yesterday = addDaysLocal(todayStr, -1)
    if (!active.has(yesterday)) {
      return 0
    }
    cursor = yesterday
  }

  let count = 0
  while (active.has(cursor)) {
    count++
    cursor = addDaysLocal(cursor, -1)
  }
  return count
}
