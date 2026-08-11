import { useUi } from '@/state/UiContext'
import { useSettings } from '@/state/SettingsContext'
import { IconButton } from '@/components/common/IconButton'

interface TopBarProps {
  onOpenMenu: () => void
}

export function TopBar({ onOpenMenu }: TopBarProps) {
  const { searchQuery, setSearchQuery, setActiveView, setExportModalOpen, setSettingsModalOpen } =
    useUi()
  const { settings, updateSettings } = useSettings()

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setActiveView(value.trim() ? 'search' : 'today')
  }

  function toggleDarkMode() {
    updateSettings({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' })
  }

  return (
    <header className="flex items-center gap-2 border-b border-line px-4 py-4 sm:gap-4 sm:px-6 lg:px-8 lg:py-5 dark:border-dusk-line-dark">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="shrink-0 rounded-full p-2 text-ink-soft hover:bg-sage lg:hidden"
      >
        ☰
      </button>

      <div className="relative min-w-0 flex-1 sm:max-w-xl">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">
          ⌕
        </span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search your reflections..."
          className="w-full rounded-2xl border border-line bg-white/70 py-2.5 pl-11 pr-4 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-sage-deep dark:border-dusk-line-dark dark:bg-white/5 dark:text-inherit"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
        <IconButton onClick={toggleDarkMode} aria-label="Toggle dark mode">
          {settings.themeMode === 'dark' ? '☾' : '☀'}
        </IconButton>

        <IconButton onClick={() => setSettingsModalOpen(true)} aria-label="Open settings">
          ⚙
        </IconButton>

        <button
          type="button"
          onClick={() => setExportModalOpen(true)}
          className="rounded-2xl bg-sage-ink px-3.5 py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-90 sm:px-5"
        >
          <span className="hidden sm:inline">Export diary</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>
    </header>
  )
}
