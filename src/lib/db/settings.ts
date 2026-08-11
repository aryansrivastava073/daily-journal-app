import { getDb } from './db'
import { DEFAULT_SETTINGS, type Settings } from '@/types/settings'

export async function getSettings(): Promise<Settings> {
  const db = await getDb()
  const stored = await db.get('settings', 'app')
  return stored ?? DEFAULT_SETTINGS
}

export async function putSettings(settings: Settings): Promise<void> {
  const db = await getDb()
  await db.put('settings', settings)
}
