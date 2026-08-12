import { useEffect, useMemo, useState } from 'react'
import { useEntries } from '@/state/EntriesContext'
import type { JournalEntry } from '@/types/entry'

function blankEntry(date: string): JournalEntry {
  return {
    id: '',
    date,
    title: '',
    body: '',
    mood: null,
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function useActiveEntry(date: string) {
  const { entriesByDate, saveEntry } = useEntries()
  const persisted = entriesByDate.get(date)
  const [draft, setDraft] = useState<JournalEntry>(() => persisted ?? blankEntry(date))

  useEffect(() => {
    setDraft(entriesByDate.get(date) ?? blankEntry(date))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const entry = useMemo(() => persisted ?? draft, [persisted, draft])

  function update(partial: Partial<JournalEntry>): Promise<JournalEntry> {
    const next: JournalEntry = { ...entry, ...partial, updatedAt: Date.now() }
    setDraft(next)
    return saveEntry(date, next)
  }

  return { entry, update }
}
