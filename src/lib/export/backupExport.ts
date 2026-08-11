import { listAllEntries, listHabits, listAllHabitLogs, listTodos, getSettings, listAllMedia } from '@/lib/db'
import type { DuskBackup, MediaExport } from '@/types/backup'
import { blobToDataUrl } from '@/lib/blobUtils'

export async function buildBackup(): Promise<DuskBackup> {
  const [entries, habits, habitLogs, todos, settings, media] = await Promise.all([
    listAllEntries(),
    listHabits(),
    listAllHabitLogs(),
    listTodos(),
    getSettings(),
    listAllMedia(),
  ])

  const mediaExports: MediaExport[] = await Promise.all(
    media.map(async (attachment) => ({
      id: attachment.id,
      entryId: attachment.entryId,
      kind: attachment.kind,
      mimeType: attachment.mimeType,
      fileName: attachment.fileName,
      durationSec: attachment.durationSec,
      createdAt: attachment.createdAt,
      dataUrl: await blobToDataUrl(attachment.blob),
    })),
  )

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    entries,
    habits,
    habitLogs,
    todos,
    settings,
    media: mediaExports,
  }
}

export async function exportBackup(): Promise<void> {
  const backup = await buildBackup()
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dusk-backup-${backup.exportedAt.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
