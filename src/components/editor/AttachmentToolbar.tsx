import { useRef } from 'react'
import { MicRecorderButton } from './MicRecorderButton'

interface AttachmentToolbarProps {
  onPickImage: (file: File) => void
  onPickVideo: (file: File) => void
  onRecordAudio: (blob: Blob) => void
}

export function AttachmentToolbar({
  onPickImage,
  onPickVideo,
  onRecordAudio,
}: AttachmentToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-1">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPickImage(file)
          e.target.value = ''
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPickVideo(file)
          e.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        aria-label="Attach image"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sage hover:text-ink"
      >
        🖼
      </button>
      <button
        type="button"
        onClick={() => videoInputRef.current?.click()}
        aria-label="Attach video"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sage hover:text-ink"
      >
        🎬
      </button>
      <MicRecorderButton onRecorded={onRecordAudio} />
    </div>
  )
}
