import type { ReactNode } from 'react'
import { SettingsProvider } from './SettingsContext'
import { EntriesProvider } from './EntriesContext'
import { HabitsProvider } from './HabitsContext'
import { TodosProvider } from './TodosContext'
import { UiProvider } from './UiContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <UiProvider>
        <EntriesProvider>
          <HabitsProvider>
            <TodosProvider>{children}</TodosProvider>
          </HabitsProvider>
        </EntriesProvider>
      </UiProvider>
    </SettingsProvider>
  )
}
