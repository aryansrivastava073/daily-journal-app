import type { MediaAttachment } from '@/types/media'
import { useRemoteMediaUrl } from '@/hooks/useRemoteMediaUrl'

interface AttachmentPreviewListProps {
  attachments: MediaAttachment[]
  onDelete: (id: string) => void
}

export function AttachmentPreviewList({ attachments, onDelete }: AttachmentPreviewListProps) {
  if (attachments.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3 border-t border-line pt-4 dark:border-dusk-line-dark">
      {attachments.map((attachment) => (
        <AttachmentPreviewItem
          key={attachment.id}
          attachment={attachment}
          onDelete={() => onDelete(attachment.id)}
        />
      ))}
    </div>
  )
}

function AttachmentPreviewItem({
  attachment,
  onDelete,
}: {
  attachment: MediaAttachment
  onDelete: () => void
}) {
  const { url, loading, error } = useRemoteMediaUrl(attachment.id)

  return (
    <div className="group relative overflow-hidden rounded-xl border border-line bg-white/60 dark:border-dusk-line-dark dark:bg-white/5">
      {loading && (
        <div className="flex h-28 w-28 items-center justify-center text-xs text-ink-soft">Loading…</div>
      )}
      {error && (
        <div className="flex h-28 w-28 items-center justify-center p-2 text-center text-xs text-ink-soft">
          Couldn't load
        </div>
      )}
      {url && attachment.kind === 'image' && (
        <img src={url} alt={attachment.fileName ?? 'attached image'} className="h-28 w-28 object-cover" />
      )}
      {url && attachment.kind === 'video' && (
        <video src={url} className="h-28 w-28 object-cover" controls />
      )}
      {url && attachment.kind === 'audio' && (
        <div className="flex h-28 w-56 flex-col items-center justify-center gap-2 p-3">
          <span className="text-xs text-ink-soft">🎙 Audio note</span>
          <audio src={url} className="w-full" controls />
        </div>
      )}
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete attachment"
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}
