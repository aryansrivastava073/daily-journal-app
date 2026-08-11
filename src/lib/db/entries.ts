import { getDb } from './db'
import type { JournalEntry } from '@/types/entry'

export async function getEntryByDate(date: string): Promise<JournalEntry | undefined> {
  const db = await getDb()
  return db.getFromIndex('entries', 'by-date', date)
}

export async function getEntryById(id: string): Promise<JournalEntry | undefined> {
  const db = await getDb()
  return db.get('entries', id)
}

export async function listEntriesInRange(from: string, to: string): Promise<JournalEntry[]> {
  const db = await getDb()
  return db.getAllFromIndex('entries', 'by-date', IDBKeyRange.bound(from, to))
}

export async function listAllEntries(): Promise<JournalEntry[]> {
  const db = await getDb()
  return db.getAll('entries')
}

export async function putEntry(entry: JournalEntry): Promise<void> {
  const db = await getDb()
  await db.put('entries', entry)
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('entries', id)
}
