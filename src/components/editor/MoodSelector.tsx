import clsx from 'clsx'
import { MOODS } from '@/data/moods'
import type { MoodId } from '@/types/mood'

interface MoodSelectorProps {
  value: MoodId | null
  onChange: (mood: MoodId | null) => void
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.18em] text-ink-soft uppercase">
        How are you arriving?
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => onChange(value === mood.id ? null : mood.id)}
            className={clsx(
              'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              value === mood.id
                ? 'border-transparent text-white'
                : 'border-line text-ink-soft hover:border-sage-deep dark:border-dusk-line-dark',
            )}
            style={value === mood.id ? { backgroundColor: mood.color } : undefined}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: mood.color }}
              aria-hidden
            />
            {mood.label}
          </button>
        ))}
      </div>
    </div>
  )
}
