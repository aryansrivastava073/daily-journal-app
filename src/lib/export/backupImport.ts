import type { DuskBackup } from '@/types/backup'
import { backupApi } from '@/lib/api'

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
  await backupApi.import(backup)
  try {
    localStorage.setItem('dusk:theme-cache', backup.settings.themeMode)
  } catch {
    // localStorage unavailable — theme cache mirror stays stale until next toggle
  }
}
