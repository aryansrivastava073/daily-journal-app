import { getDb } from './db'
import type { Habit, HabitLog } from '@/types/habit'

export async function listHabits(): Promise<Habit[]> {
  const db = await getDb()
  return db.getAll('habits')
}

export async function putHabit(habit: Habit): Promise<void> {
  const db = await getDb()
  await db.put('habits', habit)
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['habits', 'habitLogs'], 'readwrite')
  await tx.objectStore('habits').delete(id)
  const logIndex = tx.objectStore('habitLogs').index('by-habitId')
  let cursor = await logIndex.openCursor(id)
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}

export async function toggleHabitLog(
  habitId: string,
  date: string,
  completed: boolean,
): Promise<void> {
  const db = await getDb()
  if (completed) {
    await db.put('habitLogs', { habitId, date, completedAt: Date.now() })
  } else {
    await db.delete('habitLogs', [habitId, date])
  }
}

export async function getHabitLogDates(habitId: string): Promise<string[]> {
  const db = await getDb()
  const logs = await db.getAllFromIndex('habitLogs', 'by-habitId', habitId)
  return logs.map((log) => log.date)
}

export async function listAllHabitLogs(): Promise<HabitLog[]> {
  const db = await getDb()
  return db.getAll('habitLogs')
}
