import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { JournalEntry } from '@/types/entry'
import type { MediaAttachment } from '@/types/media'
import type { Habit, HabitLog } from '@/types/habit'
import type { Todo } from '@/types/todo'
import type { Settings } from '@/types/settings'

const DB_NAME = 'dusk-db'
const DB_VERSION = 1

export interface DuskDBSchema extends DBSchema {
  entries: {
    key: string
    value: JournalEntry
    indexes: { 'by-date': string }
  }
  media: {
    key: string
    value: MediaAttachment
    indexes: { 'by-entryId': string }
  }
  habits: {
    key: string
    value: Habit
  }
  habitLogs: {
    key: [string, string]
    value: HabitLog
    indexes: { 'by-habitId': string; 'by-date': string }
  }
  todos: {
    key: string
    value: Todo
  }
  settings: {
    key: string
    value: Settings
  }
}

let dbPromise: Promise<IDBPDatabase<DuskDBSchema>> | null = null

export function getDb(): Promise<IDBPDatabase<DuskDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<DuskDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const entries = db.createObjectStore('entries', { keyPath: 'id' })
        entries.createIndex('by-date', 'date', { unique: true })

        const media = db.createObjectStore('media', { keyPath: 'id' })
        media.createIndex('by-entryId', 'entryId')

        db.createObjectStore('habits', { keyPath: 'id' })

        const habitLogs = db.createObjectStore('habitLogs', {
          keyPath: ['habitId', 'date'],
        })
        habitLogs.createIndex('by-habitId', 'habitId')
        habitLogs.createIndex('by-date', 'date')

        db.createObjectStore('todos', { keyPath: 'id' })

        db.createObjectStore('settings', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}
