import { getDb } from '@/lib/db/db'
import type { DuskBackup } from '@/types/backup'
import { dataUrlToBlob } from '@/lib/blobUtils'

export class BackupValidationError extends Error {}

function isBackupShape(value: unknown): value is DuskBackup {
  if (!value || typeof value !== 'object') return false
  const backup = value as Record<string, unknown>
  return (
    backup.schemaVersion === 1 &&
    typeof backup.exportedAt === 'string' &&
    Array.isArray(backup.entries) &&
    Array.isArray(backup.habits) &&
    Array.isArray(backup.habitLogs) &&
    Array.isArray(backup.todos) &&
    Array.isArray(backup.media) &&
    typeof backup.settings === 'object' &&
    backup.settings !== null
  )
}

export async function parseBackupFile(file: File): Promise<DuskBackup> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new BackupValidationError('That file is not valid JSON.')
  }
  if (!isBackupShape(parsed)) {
    throw new BackupValidationError(
      'That file does not look like a dusk backup (missing or unsupported schema).',
    )
  }
  return parsed
}

export async function importBackup(backup: DuskBackup): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(
    ['entries', 'media', 'habits', 'habitLogs', 'todos', 'settings'],
    'readwrite',
  )

  await Promise.all([
    tx.objectStore('entries').clear(),
    tx.objectStore('media').clear(),
    tx.objectStore('habits').clear(),
    tx.objectStore('habitLogs').clear(),
    tx.objectStore('todos').clear(),
    tx.objectStore('settings').clear(),
  ])

  for (const entry of backup.entries) await tx.objectStore('entries').put(entry)
  for (const habit of backup.habits) await tx.objectStore('habits').put(habit)
  for (const log of backup.habitLogs) await tx.objectStore('habitLogs').put(log)
  for (const todo of backup.todos) await tx.objectStore('todos').put(todo)
  await tx.objectStore('settings').put(backup.settings)
  for (const media of backup.media) {
    await tx.objectStore('media').put({
      id: media.id,
      entryId: media.entryId,
      kind: media.kind,
      mimeType: media.mimeType,
      fileName: media.fileName,
      durationSec: media.durationSec,
      createdAt: media.createdAt,
      blob: dataUrlToBlob(media.dataUrl),
    })
  }

  await tx.done

  try {
    localStorage.setItem('dusk:theme-cache', backup.settings.themeMode)
  } catch {
    // localStorage unavailable — theme cache mirror stays stale until next toggle
  }
}
