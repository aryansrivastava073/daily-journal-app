import { createContext, useContext, useState, type ReactNode } from 'react'
import { todayLocalDateString } from '@/lib/dateUtils'

export type ActiveView = 'today' | 'calendar' | 'search'

interface UiContextValue {
  activeDate: string
  setActiveDate: (date: string) => void
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  exportModalOpen: boolean
  setExportModalOpen: (open: boolean) => void
  settingsModalOpen: boolean
  setSettingsModalOpen: (open: boolean) => void
}

const UiContext = createContext<UiContextValue | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [activeDate, setActiveDate] = useState(todayLocalDateString())
  const [activeView, setActiveView] = useState<ActiveView>('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  return (
    <UiContext.Provider
      value={{
        activeDate,
        setActiveDate,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        exportModalOpen,
        setExportModalOpen,
        settingsModalOpen,
        setSettingsModalOpen,
      }}
    >
      {children}
    </UiContext.Provider>
  )
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi must be used within UiProvider')
  return ctx
}
