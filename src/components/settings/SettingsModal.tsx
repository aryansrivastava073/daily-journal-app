import { useRef, useState } from 'react'
import { Modal } from '@/components/common/Modal'
import { useUi } from '@/state/UiContext'
import { useAuth } from '@/state/AuthContext'
import { parseBackupFile, importBackup, BackupValidationError } from '@/lib/export/backupImport'

export function SettingsModal() {
  const { settingsModalOpen, setSettingsModalOpen } = useUi()
  const { user, logout } = useAuth()
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImportFile(file: File) {
    setImportError(null)
    setImportStatus(null)
    try {
      const backup = await parseBackupFile(file)
      const confirmed = window.confirm(
        `This backup was exported on ${new Date(backup.exportedAt).toLocaleDateString()} and contains ${backup.entries.length} entries. Importing will replace everything currently in your account. Continue?`,
      )
      if (!confirmed) return
      await importBackup(backup)
      setImportStatus('Backup restored. Reloading dusk...')
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      setImportError(
        err instanceof BackupValidationError ? err.message : 'Could not import that backup file.',
      )
    }
  }

  return (
    <Modal
      isOpen={settingsModalOpen}
      onClose={() => setSettingsModalOpen(false)}
      title="Settings"
      widthClassName="max-w-lg"
    >
      <div className="flex flex-col gap-6">
        <section>
          <div className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Account</div>
          <p className="mt-1 text-xs text-ink-soft">Signed in as {user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 rounded-full bg-cream-soft px-4 py-1.5 text-xs font-medium text-ink-soft dark:bg-white/10"
          >
            Log out
          </button>
        </section>

        <section className="border-t border-line pt-5 dark:border-dusk-line-dark">
          <div className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
            Restore from backup
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            Import a dusk backup .json file exported from this or another device.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImportFile(file)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 rounded-full bg-cream-soft px-4 py-1.5 text-xs font-medium text-ink-soft dark:bg-white/10"
          >
            Choose backup file…
          </button>
          {importStatus && <p className="mt-2 text-xs text-sage-ink">{importStatus}</p>}
          {importError && <p className="mt-2 text-xs text-mood-tender">{importError}</p>}
        </section>
      </div>
    </Modal>
  )
}
