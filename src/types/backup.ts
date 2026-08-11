import type { JournalEntry } from './entry'
import type { Habit, HabitLog } from './habit'
import type { Todo } from './todo'
import type { Settings } from './settings'
import type { MediaKind } from './media'

export interface MediaExport {
  id: string
  entryId: string
  kind: MediaKind
  mimeType: string
  fileName?: string
  durationSec?: number
  createdAt: number
  dataUrl: string
}

export interface DuskBackup {
  schemaVersion: 1
  exportedAt: string
  entries: JournalEntry[]
  habits: Habit[]
  habitLogs: HabitLog[]
  todos: Todo[]
  settings: Settings
  media: MediaExport[]
}
