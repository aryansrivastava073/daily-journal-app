import clsx from 'clsx'
import { TagInput } from './TagInput'

interface EditorFooterToolbarProps {
  wordCount: number
  streak: number
  manualTags: string[]
  parsedTags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onContinueThought: () => void
  onTranslateHinglish: () => void
  aiBusy: 'continue' | 'translate' | null
  aiSourceNote: string | null
}

export function EditorFooterToolbar({
  wordCount,
  streak,
  manualTags,
  parsedTags,
  onAddTag,
  onRemoveTag,
  onContinueThought,
  onTranslateHinglish,
  aiBusy,
  aiSourceNote,
}: EditorFooterToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4 dark:border-dusk-line-dark sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-soft">
        <span>
          {wordCount} words • {streak} day streak
        </span>
        <TagInput
          manualTags={manualTags}
          parsedTags={parsedTags}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
        />
      </div>

      <div className="flex items-center gap-2">
        {aiSourceNote && <span className="text-[11px] text-ink-soft/70">{aiSourceNote}</span>}
        <button
          type="button"
          onClick={onContinueThought}
          disabled={aiBusy !== null}
          className={clsx(
            'rounded-full bg-sage px-4 py-1.5 text-xs font-medium text-sage-ink transition-opacity hover:opacity-90',
            aiBusy !== null && 'opacity-60',
          )}
        >
          {aiBusy === 'continue' ? 'Thinking…' : '✨ Continue my thought'}
        </button>
        <button
          type="button"
          onClick={onTranslateHinglish}
          disabled={aiBusy !== null}
          className={clsx(
            'rounded-full bg-cream-soft px-4 py-1.5 text-xs font-medium text-ink-soft transition-opacity hover:opacity-90 dark:bg-white/10',
            aiBusy !== null && 'opacity-60',
          )}
        >
          {aiBusy === 'translate' ? 'Translating…' : 'Aa Translate Hinglish'}
        </button>
      </div>
    </div>
  )
}
