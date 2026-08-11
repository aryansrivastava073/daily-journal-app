import { useState } from 'react'
import clsx from 'clsx'
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { useUi } from '@/state/UiContext'
import { useSettings } from '@/state/SettingsContext'
import { useEntries } from '@/state/EntriesContext'
import { getMood } from '@/data/moods'
import { parseLocalDate, toLocalDateString, todayLocalDateString } from '@/lib/dateUtils'

export function MiniCalendar() {
  const { activeDate, setActiveDate, setActiveView } = useUi()
  const { settings, updateSettings } = useSettings()
  const { entriesByDate } = useEntries()
  const [cursor, setCursor] = useState(() => parseLocalDate(activeDate))

  const view = settings.calendarView
  const weekStartsOn = settings.weekStartsOn

  function selectDate(date: string) {
    setActiveDate(date)
    setActiveView('today')
  }

  const days =
    view === 'month'
      ? eachDayOfInterval({
          start: startOfWeek(startOfMonth(cursor), { weekStartsOn }),
          end: endOfWeek(endOfMonth(cursor), { weekStartsOn }),
        })
      : eachDayOfInterval({
          start: startOfWeek(cursor, { weekStartsOn }),
          end: endOfWeek(cursor, { weekStartsOn }),
        })

  const today = todayLocalDateString()

  return (
    <div className="rounded-2xl border border-line bg-white/60 p-5 dark:border-dusk-line-dark dark:bg-white/5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold tracking-[0.18em] text-ink-soft uppercase">
          Your rhythm
        </div>
        <div className="flex rounded-full bg-cream-soft p-0.5 text-xs dark:bg-white/10">
          {(['month', 'week'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => updateSettings({ calendarView: mode })}
              className={clsx(
                'rounded-full px-3 py-1 font-medium capitalize transition-colors',
                view === mode ? 'bg-sage text-sage-ink' : 'text-ink-soft',
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            view === 'month'
              ? setCursor((prev) => subMonths(prev, 1))
              : setCursor((prev) => subWeeks(prev, 1))
          }
          aria-label="Previous"
          className="text-ink-soft hover:text-ink"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-ink dark:text-inherit">
          {format(cursor, view === 'month' ? 'MMMM yyyy' : "'Week of' MMM d")}
        </span>
        <button
          type="button"
          onClick={() =>
            view === 'month'
              ? setCursor((prev) => addMonths(prev, 1))
              : setCursor((prev) => addWeeks(prev, 1))
          }
          aria-label="Next"
          className="text-ink-soft hover:text-ink"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-ink-soft/70">
        {days.slice(0, 7).map((d) => (
          <div key={d.toISOString()}>{format(d, 'EEEEE')}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = toLocalDateString(day)
          const entry = entriesByDate.get(dateStr)
          const mood = getMood(entry?.mood)
          const inCurrentMonth = view === 'week' || isSameMonth(day, cursor)
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => selectDate(dateStr)}
              className={clsx(
                'relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors',
                dateStr === activeDate
                  ? 'bg-sage-ink text-cream'
                  : dateStr === today
                    ? 'bg-sage text-sage-ink'
                    : 'hover:bg-sage/40',
                !inCurrentMonth && 'text-ink-soft/30',
              )}
            >
              {format(day, 'd')}
              {mood && (
                <span
                  className="absolute bottom-1 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: mood.color }}
                  aria-hidden
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
