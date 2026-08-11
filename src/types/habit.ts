export interface Habit {
  id: string
  name: string
  color?: string
  archived?: boolean
  createdAt: number
}

export interface HabitLog {
  habitId: string
  date: string
  completedAt: number
}
