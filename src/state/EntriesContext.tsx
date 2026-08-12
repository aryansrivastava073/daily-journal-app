import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { entriesApi } from '@/lib/api'
import type { JournalEntry } from '@/types/entry'
import { calculateStreak } from '@/lib/streak'

interface EntriesContextValue {
  entriesByDate: Map<string, JournalEntry>
  loaded: boolean
  writingStreak: number
  saveEntry: (date: string, entry: Pick<JournalEntry, 'title' | 'body' | 'mood' | 'tags'>) => Promise<JournalEntry>
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
    entriesApi.list().then((entries) => {
      const map = new Map<string, JournalEntry>()
      for (const entry of entries) map.set(entry.date, entry)
      setEntriesByDate(map)
      setLoaded(true)
    })
  }, [])

  async function saveEntry(
    date: string,
    entry: Pick<JournalEntry, 'title' | 'body' | 'mood' | 'tags'>,
  ): Promise<JournalEntry> {
    const saved = await entriesApi.upsertByDate(date, entry)
    setEntriesByDate((prev) => {
      const next = new Map(prev)
      next.set(date, saved)
      return next
    })
    return saved
  }

  async function removeEntry(id: string, date: string) {
    await entriesApi.remove(id)
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
