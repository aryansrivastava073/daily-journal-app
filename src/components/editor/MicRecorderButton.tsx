import clsx from 'clsx'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'

interface MicRecorderButtonProps {
  onRecorded: (blob: Blob) => void
  disabled?: boolean
}

export function MicRecorderButton({ onRecorded, disabled }: MicRecorderButtonProps) {
  const { status, start, stop } = useAudioRecorder()

  async function handleClick() {
    if (status === 'recording') {
      const blob = await stop()
      if (blob) onRecorded(blob)
    } else {
      start()
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={status === 'recording' ? 'Stop recording' : 'Record an audio note'}
        className={clsx(
          'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50',
          status === 'recording'
            ? 'bg-mood-tender text-white animate-pulse'
            : 'text-ink-soft hover:bg-sage hover:text-ink',
        )}
      >
        🎙
      </button>
      {status === 'denied' && (
        <div className="absolute right-0 top-11 z-10 w-56 rounded-xl bg-ink px-3 py-2 text-xs text-cream shadow-lg">
          Microphone access was denied. You can still write, attach images, and add video — just
          not record audio notes.
        </div>
      )}
      {status === 'error' && (
        <div className="absolute right-0 top-11 z-10 w-56 rounded-xl bg-ink px-3 py-2 text-xs text-cream shadow-lg">
          Couldn't reach a microphone on this device. Everything else in your entry is still safe
          to use.
        </div>
      )}
    </div>
  )
}
