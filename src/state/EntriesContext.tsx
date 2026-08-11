import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { listAllEntries, putEntry as dbPutEntry, deleteEntry as dbDeleteEntry } from '@/lib/db'
import type { JournalEntry } from '@/types/entry'
import { calculateStreak } from '@/lib/streak'

interface EntriesContextValue {
  entriesByDate: Map<string, JournalEntry>
  loaded: boolean
  writingStreak: number
  saveEntry: (entry: JournalEntry) => Promise<void>
  removeEntry: (id: string, date: string) => Promise<void>
}

const EntriesContext = createContext<EntriesContextValue | null>(null)

function isNonEmpty(entry: JournalEntry): boolean {
  return entry.title.trim().length > 0 || entry.body.trim().length > 0
}

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entriesByDate, setEntriesByDate] = useState<Map<string, JournalEntry>>(new Map())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    listAllEntries().then((entries) => {
      const map = new Map<string, JournalEntry>()
      for (const entry of entries) map.set(entry.date, entry)
      setEntriesByDate(map)
      setLoaded(true)
    })
  }, [])

  async function saveEntry(entry: JournalEntry) {
    await dbPutEntry(entry)
    setEntriesByDate((prev) => {
      const next = new Map(prev)
      next.set(entry.date, entry)
      return next
    })
  }

  async function removeEntry(id: string, date: string) {
    await dbDeleteEntry(id)
    setEntriesByDate((prev) => {
      const next = new Map(prev)
      next.delete(date)
      return next
    })
  }

  const activeDates = new Set(
    [...entriesByDate.values()].filter(isNonEmpty).map((entry) => entry.date),
  )
  const writingStreak = calculateStreak(activeDates)

  return (
    <EntriesContext.Provider value={{ entriesByDate, loaded, writingStreak, saveEntry, removeEntry }}>
      {children}
    </EntriesContext.Provider>
  )
}

export function useEntries(): EntriesContextValue {
  const ctx = useContext(EntriesContext)
  if (!ctx) throw new Error('useEntries must be used within EntriesProvider')
  return ctx
}
