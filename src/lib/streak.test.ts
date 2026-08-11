import { describe, expect, it } from 'vitest'
import { calculateStreak } from './streak'

describe('calculateStreak', () => {
  it('returns 0 when there are no active dates', () => {
    expect(calculateStreak([], new Date(2026, 7, 11))).toBe(0)
  })

  it('returns 1 when only today is active', () => {
    expect(calculateStreak(['2026-08-11'], new Date(2026, 7, 11))).toBe(1)
  })

  it('stays alive when yesterday is active but today has not been written yet', () => {
    expect(calculateStreak(['2026-08-10'], new Date(2026, 7, 11))).toBe(1)
  })

  it('breaks when there is a full missed day', () => {
    expect(calculateStreak(['2026-08-09'], new Date(2026, 7, 11))).toBe(0)
  })

  it('counts a consecutive run ending today', () => {
    const dates = ['2026-08-08', '2026-08-09', '2026-08-10', '2026-08-11']
    expect(calculateStreak(dates, new Date(2026, 7, 11))).toBe(4)
  })

  it('counts a consecutive run ending yesterday when today is not yet logged', () => {
    const dates = ['2026-08-07', '2026-08-08', '2026-08-09', '2026-08-10']
    expect(calculateStreak(dates, new Date(2026, 7, 11))).toBe(4)
  })

  it('stops counting at the first gap looking backward', () => {
    const dates = ['2026-08-05', '2026-08-09', '2026-08-10', '2026-08-11']
    expect(calculateStreak(dates, new Date(2026, 7, 11))).toBe(3)
  })

  it('accepts a Set as well as an array', () => {
    const dates = new Set(['2026-08-10', '2026-08-11'])
    expect(calculateStreak(dates, new Date(2026, 7, 11))).toBe(2)
  })
})
