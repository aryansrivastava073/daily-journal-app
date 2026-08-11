import { useState } from 'react'
import clsx from 'clsx'
import { useHabits } from '@/state/HabitsContext'

export function HabitsWidget() {
  const { habits, addHabit, toggleToday, deleteHabit } = useHabits()
  const [draft, setDraft] = useState('')

  function submit() {
    const name = draft.trim()
    if (name) addHabit(name)
    setDraft('')
  }

  return (
    <div className="rounded-2xl border border-line bg-white/60 p-5 dark:border-dusk-line-dark dark:bg-white/5">
      <div className="text-[11px] font-semibold tracking-[0.18em] text-ink-soft uppercase">
        Gentle consistency
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {habits.map((habit) => (
          <li key={habit.id} className="group flex items-center justify-between gap-2">
            <label className="flex flex-1 items-center gap-2.5 text-sm text-ink dark:text-inherit">
              <input
                type="checkbox"
                checked={habit.checkedToday}
                onChange={() => toggleToday(habit.id)}
                className="h-4 w-4 rounded border-line accent-sage-ink"
              />
              <span className={clsx(habit.checkedToday && 'text-ink-soft line-through')}>
                {habit.name}
              </span>
            </label>
            <span className="text-xs text-ink-soft">
              {habit.streak > 0 ? `${habit.streak}d` : ''}
            </span>
            <button
              type="button"
              onClick={() => deleteHabit(habit.id)}
              aria-label={`Remove habit ${habit.name}`}
              className="text-ink-soft/50 opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="+ Add a habit"
          className="flex-1 rounded-xl border border-line bg-transparent px-3 py-1.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-sage-deep dark:border-dusk-line-dark dark:text-inherit"
        />
      </div>
    </div>
  )
}
