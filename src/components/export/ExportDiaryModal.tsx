import { useState } from 'react'
import { Modal } from '@/components/common/Modal'
import { useUi } from '@/state/UiContext'
import { addDaysLocal, todayLocalDateString } from '@/lib/dateUtils'

export function ExportDiaryModal() {
  const { exportModalOpen, setExportModalOpen } = useUi()
  const today = todayLocalDateString()
  const [from, setFrom] = useState(addDaysLocal(today, -30))
  const [to, setTo] = useState(today)
  const [busy, setBusy] = useState<'pdf' | 'backup' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handlePdfExport() {
    setBusy('pdf')
    setError(null)
    try {
      const { exportEntriesToPdf } = await import('@/lib/export/pdfExport')
      await exportEntriesToPdf(from, to)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not export PDF.')
    } finally {
      setBusy(null)
    }
  }

  async function handleBackupExport() {
    setBusy('backup')
    setError(null)
    try {
      const { exportBackup } = await import('@/lib/export/backupExport')
      await exportBackup()
    } catch {
      setError('Could not build the backup file.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal
      isOpen={exportModalOpen}
      onClose={() => setExportModalOpen(false)}
      title="Export diary"
      widthClassName="max-w-lg"
    >
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 text-xs font-medium text-ink-soft">Date range (for PDF export)</div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-xl border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-dusk-line-dark dark:text-inherit"
            />
            <span className="text-ink-soft">to</span>
            <input
              type="date"
              value={to}
              min={from}
              max={today}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-xl border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-dusk-line-dark dark:text-inherit"
            />
          </div>
        </div>

        {error && <p className="text-sm text-mood-tender">{error}</p>}

        <button
          type="button"
          onClick={handlePdfExport}
          disabled={busy !== null}
          className="rounded-2xl bg-sage px-4 py-3 text-left text-sm font-medium text-sage-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <div>{busy === 'pdf' ? 'Preparing PDF…' : 'Rich printable PDF'}</div>
          <div className="mt-0.5 text-xs text-sage-ink/70">
            A formatted, serif-typeset PDF of entries in the range above.
          </div>
        </button>

        <button
          type="button"
          onClick={handleBackupExport}
          disabled={busy !== null}
          className="rounded-2xl bg-cream-soft px-4 py-3 text-left text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-white/10 dark:text-inherit"
        >
          <div>{busy === 'backup' ? 'Building backup…' : 'Complete portable backup (.json)'}</div>
          <div className="mt-0.5 text-xs text-ink-soft">
            Every entry, habit, todo, and media file — always the full diary, not just this range.
          </div>
        </button>
      </div>
    </Modal>
  )
}
