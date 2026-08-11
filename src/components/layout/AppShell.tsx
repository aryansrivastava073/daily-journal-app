import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { TodaysThoughtCard } from '@/components/today/TodaysThoughtCard'
import { ManifestationCard } from '@/components/today/ManifestationCard'
import { DateHeader } from '@/components/editor/DateHeader'
import { JournalEditorCard } from '@/components/editor/JournalEditorCard'
import { MiniCalendar } from '@/components/calendar/MiniCalendar'
import { HabitsWidget } from '@/components/habits/HabitsWidget'
import { TodosWidget } from '@/components/todos/TodosWidget'
import { SearchOverlay } from '@/components/search/SearchOverlay'
import { ExportDiaryModal } from '@/components/export/ExportDiaryModal'
import { SettingsModal } from '@/components/settings/SettingsModal'
import { useUi } from '@/state/UiContext'
import { useActiveEntry } from '@/hooks/useActiveEntry'

function TodayColumn() {
  const { activeDate, setActiveDate } = useUi()
  const { entry, update } = useActiveEntry(activeDate)

  return (
    <div className="flex flex-col gap-6">
      <TodaysThoughtCard />
      <DateHeader activeDate={activeDate} onChangeDate={setActiveDate} />
      <JournalEditorCard entry={entry} onUpdate={update} />
      <ManifestationCard />
    </div>
  )
}

function CenterColumn() {
  const { activeView } = useUi()
  if (activeView === 'search') return <SearchOverlay />
  return <TodayColumn />
}

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen min-h-screen bg-cream text-ink dark:bg-dusk-bg-dark dark:text-inherit">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar onOpenMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <CenterColumn />
            <div className="flex flex-col gap-6">
              <MiniCalendar />
              <HabitsWidget />
              <TodosWidget />
            </div>
          </div>
        </main>
      </div>

      <ExportDiaryModal />
      <SettingsModal />
    </div>
  )
}
