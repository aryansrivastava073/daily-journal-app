import { useState } from 'react'
import clsx from 'clsx'
import type { PromptItem } from '@/data/quotes'

interface RotatingPromptCardProps {
  heading: string
  items: PromptItem[]
  lastId: string | undefined
  onRefresh: (nextId: string) => void
  colorClassName: string
  textClassName?: string
  refreshLabel?: string
}

function pickNext(items: PromptItem[], lastId: string | undefined): PromptItem {
  if (items.length === 1) return items[0]
  let candidate = items[Math.floor(Math.random() * items.length)]
  while (candidate.id === lastId) {
    candidate = items[Math.floor(Math.random() * items.length)]
  }
  return candidate
}

export function RotatingPromptCard({
  heading,
  items,
  lastId,
  onRefresh,
  colorClassName,
  textClassName,
  refreshLabel = 'Refresh',
}: RotatingPromptCardProps) {
  const [current, setCurrent] = useState<PromptItem>(
    () => items.find((item) => item.id === lastId) ?? pickNext(items, undefined),
  )

  function refresh() {
    const next = pickNext(items, current.id)
    setCurrent(next)
    onRefresh(next.id)
  }

  return (
    <div className={clsx('rounded-2xl p-4 sm:p-6', colorClassName)}>
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold tracking-[0.18em] text-ink-soft uppercase">
            {heading}
          </div>
          <p className={clsx('mt-3 font-display text-lg leading-snug sm:text-xl', textClassName)}>
            {current.text}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="shrink-0 rounded-full bg-white/60 px-4 py-2 text-xs font-medium text-ink-soft transition-colors hover:bg-white/90 dark:bg-black/20 dark:hover:bg-black/30"
        >
          {refreshLabel}
        </button>
      </div>
    </div>
  )
}
