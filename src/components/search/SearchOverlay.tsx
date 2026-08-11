import { useUi } from '@/state/UiContext'
import { useSearch } from '@/hooks/useSearch'
import { formatDisplayDate } from '@/lib/dateUtils'
import { MoodBadge } from '@/components/editor/MoodBadge'

export function SearchOverlay() {
  const { searchQuery, setActiveDate, setActiveView } = useUi()
  const results = useSearch(searchQuery)

  function openEntry(date: string) {
    setActiveDate(date)
    setActiveView('today')
  }

  return (
    <div className="rounded-2xl border border-line bg-white/60 p-6 dark:border-dusk-line-dark dark:bg-white/5">
      <div className="text-[11px] font-semibold tracking-[0.18em] text-ink-soft uppercase">
        {results.length} reflection{results.length === 1 ? '' : 's'} found
      </div>

      {results.length === 0 && (
        <p className="mt-4 text-sm text-ink-soft">
          No reflections match "{searchQuery}" yet. Try a different word or tag.
        </p>
      )}

      <ul className="mt-4 flex flex-col gap-3">
        {results.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => openEntry(entry.date)}
              className="w-full rounded-xl border border-line p-4 text-left transition-colors hover:bg-sage/30 dark:border-dusk-line-dark"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-ink-soft">{formatDisplayDate(entry.date)}</span>
                <MoodBadge moodId={entry.mood} />
              </div>
              <div className="mt-1 font-display text-lg text-ink dark:text-inherit">
                {entry.title || 'Untitled reflection'}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{entry.body}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
