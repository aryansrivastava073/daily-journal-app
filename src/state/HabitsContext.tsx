import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { habitsApi } from '@/lib/api'
import type { Habit, HabitWithLogs } from '@/types/habit'
import { calculateStreak } from '@/lib/streak'
import { todayLocalDateString } from '@/lib/dateUtils'

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
  const [habits, setHabits] = useState<HabitWithLogs[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    habitsApi.list().then((habitList) => {
      setHabits(habitList)
      setLoaded(true)
    })
  }, [])

  async function addHabit(name: string) {
    const habit = await habitsApi.create(name)
    setHabits((prev) => [...prev, habit])
  }

  async function toggleToday(habitId: string) {
    const today = todayLocalDateString()
    const habit = habits.find((h) => h.id === habitId)
    const nextCompleted = !(habit?.logDates.includes(today) ?? false)
    await habitsApi.toggle(habitId, today, nextCompleted)
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              logDates: nextCompleted
                ? [...h.logDates, today]
                : h.logDates.filter((d) => d !== today),
            }
          : h,
      ),
    )
  }

  async function deleteHabit(id: string) {
    await habitsApi.remove(id)
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  const habitsWithStreak: HabitWithStreak[] = habits
    .filter((h) => !h.archived)
    .map((habit) => ({
      ...habit,
      streak: calculateStreak(new Set(habit.logDates)),
      checkedToday: habit.logDates.includes(todayLocalDateString()),
    }))

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
