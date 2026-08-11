import clsx from 'clsx'
import { useUi, type ActiveView } from '@/state/UiContext'
import { useEntries } from '@/state/EntriesContext'

const NAV_ITEMS: { id: ActiveView; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '☀' },
  { id: 'calendar', label: 'Calendar', icon: '▦' },
  { id: 'search', label: 'Search', icon: '⌕' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { activeView, setActiveView } = useUi()
  const { writingStreak } = useEntries()

  function navigate(view: ActiveView) {
    setActiveView(view)
    onClose()
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-line bg-cream-soft px-6 py-8 transition-transform duration-200 dark:border-dusk-line-dark dark:bg-dusk-surface-dark',
          'lg:static lg:z-auto lg:h-full lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div>
          <div className="mb-10 flex items-center justify-between">
            <div>
              <div className="font-display text-2xl leading-none text-ink dark:text-inherit">
                dusk
              </div>
              <div className="mt-1 text-[11px] font-medium tracking-[0.18em] text-ink-soft uppercase">
                your daily ritual
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="rounded-full p-1 text-ink-soft hover:bg-sage/60 lg:hidden"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={clsx(
                  'flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors',
                  activeView === item.id
                    ? 'bg-sage text-sage-ink'
                    : 'text-ink-soft hover:bg-sage/50',
                )}
              >
                <span aria-hidden className="text-base">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => navigate('today')}
          className="flex items-center gap-3 rounded-2xl bg-sage/60 px-4 py-3 text-left transition-colors hover:bg-sage"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-deep font-display text-lg text-sage-ink">
            🌙
          </div>
          <div>
            <div className="text-sm font-medium text-ink dark:text-inherit">Your ritual</div>
            <div className="text-xs text-ink-soft">
              {writingStreak > 0 ? `${writingStreak} day streak` : 'Start today'}
            </div>
          </div>
        </button>
      </aside>
    </>
  )
}
