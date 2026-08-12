import { useEffect, useState } from 'react'
import type { JournalEntry } from '@/types/entry'
import type { MediaAttachment, MediaKind } from '@/types/media'
import { MoodSelector } from './MoodSelector'
import { AttachmentToolbar } from './AttachmentToolbar'
import { AttachmentPreviewList } from './AttachmentPreviewList'
import { EditorFooterToolbar } from './EditorFooterToolbar'
import { countWords } from '@/lib/wordCount'
import { extractHashtags, mergeTags } from '@/lib/tagParser'
import { mediaApi } from '@/lib/api'
import { useEntries } from '@/state/EntriesContext'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { aiProvider } from '@/lib/ai'

interface JournalEditorCardProps {
  entry: JournalEntry
  onUpdate: (partial: Partial<JournalEntry>) => Promise<JournalEntry>
}

export function JournalEditorCard({ entry, onUpdate }: JournalEditorCardProps) {
  const { writingStreak } = useEntries()
  const [title, setTitle] = useState(entry.title)
  const [body, setBody] = useState(entry.body)
  const [attachments, setAttachments] = useState<MediaAttachment[]>([])
  const [aiBusy, setAiBusy] = useState<'continue' | 'translate' | null>(null)
  const [aiSourceNote, setAiSourceNote] = useState<string | null>(null)
  const [mediaBusy, setMediaBusy] = useState(false)

  useEffect(() => {
    setTitle(entry.title)
    setBody(entry.body)
  }, [entry.id])

  useEffect(() => {
    if (!entry.id) {
      setAttachments([])
      return
    }
    mediaApi.listForEntry(entry.id).then(setAttachments)
  }, [entry.id])

  const debouncedTextUpdate = useDebouncedCallback((next: { title: string; body: string }) => {
    onUpdate(next)
  }, 400)

  function handleTitleChange(value: string) {
    setTitle(value)
    debouncedTextUpdate({ title: value, body })
  }

  function handleBodyChange(value: string) {
    setBody(value)
    debouncedTextUpdate({ title, body: value })
  }

  const parsedTags = extractHashtags(body)
  const manualTags = entry.tags.filter((tag) => !parsedTags.includes(tag))

  function addManualTag(tag: string) {
    onUpdate({ title, body, tags: mergeTags([...manualTags, tag], parsedTags) })
  }

  function removeManualTag(tag: string) {
    onUpdate({ title, body, tags: mergeTags(manualTags.filter((t) => t !== tag), parsedTags) })
  }

  async function withSavedEntry<T>(action: (savedEntry: JournalEntry) => Promise<T>): Promise<T> {
    setMediaBusy(true)
    try {
      const saved = await onUpdate({ title, body })
      return await action(saved)
    } finally {
      setMediaBusy(false)
    }
  }

  async function attachFile(file: File, kind: MediaKind) {
    await withSavedEntry(async (saved) => {
      const meta = await mediaApi.upload(saved.id, file, kind, file.name)
      setAttachments((prev) => [...prev, meta])
    })
  }

  async function attachAudio(blob: Blob) {
    await withSavedEntry(async (saved) => {
      const meta = await mediaApi.upload(saved.id, blob, 'audio')
      setAttachments((prev) => [...prev, meta])
    })
  }

  async function removeAttachment(id: string) {
    await mediaApi.remove(id)
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  async function handleContinueThought() {
    if (!body.trim() || aiBusy) return
    setAiBusy('continue')
    try {
      const result = await aiProvider.continueThought(body, { mood: entry.mood })
      const nextBody = `${body.trim()} ${result.text}`.trim()
      setBody(nextBody)
      onUpdate({ title, body: nextBody })
      setAiSourceNote(result.source === 'local' ? '(offline suggestion)' : null)
    } finally {
      setAiBusy(null)
    }
  }

  async function handleTranslateHinglish() {
    if (!body.trim() || aiBusy) return
    setAiBusy('translate')
    try {
      const result = await aiProvider.translateHinglish(body)
      setBody(result.text)
      onUpdate({ title, body: result.text })
      setAiSourceNote(
        result.source === 'local'
          ? '(offline translation)'
          : result.source === 'google'
            ? '(via free translator)'
            : null,
      )
    } finally {
      setAiBusy(null)
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white/60 p-4 shadow-sm sm:p-6 dark:border-dusk-line-dark dark:bg-white/5">
      <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <MoodSelector value={entry.mood} onChange={(mood) => onUpdate({ title, body, mood })} />
        <AttachmentToolbar
          onPickImage={(file) => attachFile(file, 'image')}
          onPickVideo={(file) => attachFile(file, 'video')}
          onRecordAudio={attachAudio}
          disabled={mediaBusy}
        />
      </div>

      <input
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Untitled reflection"
        className="w-full bg-transparent font-display text-2xl text-ink outline-none placeholder:text-ink-soft/50 dark:text-inherit"
      />

      <textarea
        value={body}
        onChange={(e) => handleBodyChange(e.target.value)}
        placeholder="What is moving through you today? Start anywhere..."
        rows={10}
        disabled={aiBusy !== null}
        className="mt-4 w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-soft/50 disabled:opacity-60 dark:text-inherit"
      />

      <AttachmentPreviewList attachments={attachments} onDelete={removeAttachment} />

      <div className="mt-4">
        <EditorFooterToolbar
          wordCount={countWords(body)}
          streak={writingStreak}
          manualTags={manualTags}
          parsedTags={parsedTags}
          onAddTag={addManualTag}
          onRemoveTag={removeManualTag}
          onContinueThought={handleContinueThought}
          onTranslateHinglish={handleTranslateHinglish}
          aiBusy={aiBusy}
          aiSourceNote={aiSourceNote}
        />
      </div>
    </div>
  )
}
