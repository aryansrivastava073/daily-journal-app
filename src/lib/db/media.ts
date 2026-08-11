import { getDb } from './db'
import type { MediaAttachment } from '@/types/media'

export async function addMedia(attachment: MediaAttachment): Promise<void> {
  const db = await getDb()
  await db.put('media', attachment)
}

export async function getMediaById(id: string): Promise<MediaAttachment | undefined> {
  const db = await getDb()
  return db.get('media', id)
}

export async function getMediaForEntry(entryId: string): Promise<MediaAttachment[]> {
  const db = await getDb()
  return db.getAllFromIndex('media', 'by-entryId', entryId)
}

export async function deleteMedia(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('media', id)
}

export async function listAllMedia(): Promise<MediaAttachment[]> {
  const db = await getDb()
  return db.getAll('media')
}
