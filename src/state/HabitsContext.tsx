import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  listHabits,
  putHabit as dbPutHabit,
  deleteHabit as dbDeleteHabit,
  toggleHabitLog as dbToggleHabitLog,
  listAllHabitLogs,
} from '@/lib/db'
import type { Habit } from '@/types/habit'
import { calculateStreak } from '@/lib/streak'
import { todayLocalDateString } from '@/lib/dateUtils'
import { uuid } from '@/lib/uuid'

export interface HabitWithStreak extends Habit {
  streak: number
  checkedToday: boolean
}

interface HabitsContextValue {
  habits: HabitWithStreak[]
  loaded: boolean
  addHabit: (name: string) => Promise<void>
  toggleToday: (habitId: string) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
}

const HabitsContext = createContext<HabitsContextValue | null>(null)

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logsByHabit, setLogsByHabit] = useState<Map<string, Set<string>>>(new Map())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([listHabits(), listAllHabitLogs()]).then(([habitList, logs]) => {
      const map = new Map<string, Set<string>>()
      for (const log of logs) {
        if (!map.has(log.habitId)) map.set(log.habitId, new Set())
        map.get(log.habitId)!.add(log.date)
      }
      setHabits(habitList)
      setLogsByHabit(map)
      setLoaded(true)
    })
  }, [])

  async function addHabit(name: string) {
    const habit: Habit = { id: uuid(), name, createdAt: Date.now() }
    await dbPutHabit(habit)
    setHabits((prev) => [...prev, habit])
  }

  async function toggleToday(habitId: string) {
    const today = todayLocalDateString()
    const dates = logsByHabit.get(habitId) ?? new Set<string>()
    const nextCompleted = !dates.has(today)
    await dbToggleHabitLog(habitId, today, nextCompleted)
    setLogsByHabit((prev) => {
      const next = new Map(prev)
      const nextDates = new Set(next.get(habitId) ?? [])
      if (nextCompleted) nextDates.add(today)
      else nextDates.delete(today)
      next.set(habitId, nextDates)
      return next
    })
  }

  async function deleteHabit(id: string) {
    await dbDeleteHabit(id)
    setHabits((prev) => prev.filter((h) => h.id !== id))
    setLogsByHabit((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }

  const habitsWithStreak: HabitWithStreak[] = habits
    .filter((h) => !h.archived)
    .map((habit) => {
      const dates = logsByHabit.get(habit.id) ?? new Set<string>()
      return {
        ...habit,
        streak: calculateStreak(dates),
        checkedToday: dates.has(todayLocalDateString()),
      }
    })

  return (
    <HabitsContext.Provider
      value={{ habits: habitsWithStreak, loaded, addHabit, toggleToday, deleteHabit }}
    >
      {children}
    </HabitsContext.Provider>
  )
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext)
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider')
  return ctx
}
