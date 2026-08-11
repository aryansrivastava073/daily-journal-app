import { useRef, useState } from 'react'
import { Modal } from '@/components/common/Modal'
import { useUi } from '@/state/UiContext'
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '@/lib/apiKeyStorage'
import { parseBackupFile, importBackup, BackupValidationError } from '@/lib/export/backupImport'

export function SettingsModal() {
  const { settingsModalOpen, setSettingsModalOpen } = useUi()
  const [apiKey, setApiKey] = useState(() => getStoredApiKey() ?? '')
  const [saved, setSaved] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleSaveKey() {
    if (apiKey.trim()) {
      setStoredApiKey(apiKey.trim())
    } else {
      clearStoredApiKey()
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function handleClearKey() {
    setApiKey('')
    clearStoredApiKey()
  }

  async function handleImportFile(file: File) {
    setImportError(null)
    setImportStatus(null)
    try {
      const backup = await parseBackupFile(file)
      const confirmed = window.confirm(
        `This backup was exported on ${new Date(backup.exportedAt).toLocaleDateString()} and contains ${backup.entries.length} entries. Importing will replace everything currently on this device. Continue?`,
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
          <div className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
            Anthropic API key
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            Used only in your browser for "Continue my thought" and "Translate Hinglish" when
            you're online. Stored locally on this device — never uploaded, never included in
            backups.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full rounded-xl border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-dusk-line-dark dark:text-inherit"
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveKey}
              className="rounded-full bg-sage px-4 py-1.5 text-xs font-medium text-sage-ink"
            >
              {saved ? 'Saved' : 'Save key'}
            </button>
            <button
              type="button"
              onClick={handleClearKey}
              className="rounded-full bg-cream-soft px-4 py-1.5 text-xs font-medium text-ink-soft dark:bg-white/10"
            >
              Clear
            </button>
          </div>
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
