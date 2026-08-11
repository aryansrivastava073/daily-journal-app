import { addDaysLocal, formatDisplayDate, isTodayLocal } from '@/lib/dateUtils'
import { IconButton } from '@/components/common/IconButton'

interface DateHeaderProps {
  activeDate: string
  onChangeDate: (date: string) => void
}

export function DateHeader({ activeDate, onChangeDate }: DateHeaderProps) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.18em] text-ink-soft uppercase">
        Your space for today
      </div>
      <div className="mt-2 flex items-center gap-3">
        <IconButton
          onClick={() => onChangeDate(addDaysLocal(activeDate, -1))}
          aria-label="Previous day"
        >
          ‹
        </IconButton>
        <h1 className="font-display text-lg text-ink sm:text-2xl dark:text-inherit">
          {formatDisplayDate(activeDate)}
          {isTodayLocal(activeDate) && (
            <span className="ml-2 align-middle text-xs font-medium text-sage-ink">today</span>
          )}
        </h1>
        <IconButton onClick={() => onChangeDate(addDaysLocal(activeDate, 1))} aria-label="Next day">
          ›
        </IconButton>
      </div>
    </div>
  )
}
