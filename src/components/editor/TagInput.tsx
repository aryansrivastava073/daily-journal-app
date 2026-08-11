import { useState } from 'react'

interface TagInputProps {
  manualTags: string[]
  parsedTags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}

export function TagInput({ manualTags, parsedTags, onAddTag, onRemoveTag }: TagInputProps) {
  const [draft, setDraft] = useState('')

  function submit() {
    const tag = draft.trim().replace(/^#/, '').toLowerCase()
    if (tag) onAddTag(tag)
    setDraft('')
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {parsedTags.map((tag) => (
        <span
          key={`parsed-${tag}`}
          className="rounded-full bg-sage/70 px-2.5 py-1 text-xs font-medium text-sage-ink"
        >
          #{tag}
        </span>
      ))}
      {manualTags.map((tag) => (
        <span
          key={`manual-${tag}`}
          className="inline-flex items-center gap-1 rounded-full bg-cream-soft px-2.5 py-1 text-xs font-medium text-ink-soft dark:bg-white/10"
        >
          #{tag}
          <button
            type="button"
            onClick={() => onRemoveTag(tag)}
            aria-label={`Remove tag ${tag}`}
            className="text-ink-soft/70 hover:text-ink"
          >
            ✕
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            submit()
          }
        }}
        onBlur={submit}
        placeholder="+ tag"
        className="w-20 bg-transparent text-xs text-ink-soft outline-none placeholder:text-ink-soft/60"
      />
    </div>
  )
}
