import { useMemo } from 'react'
import { useEntries } from '@/state/EntriesContext'
import type { JournalEntry } from '@/types/entry'

export function useSearch(query: string): JournalEntry[] {
  const { entriesByDate } = useEntries()

  return useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []
    return [...entriesByDate.values()]
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(normalized) ||
          entry.body.toLowerCase().includes(normalized) ||
          entry.tags.some((tag) => tag.includes(normalized)),
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [entriesByDate, query])
}
