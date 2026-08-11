import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSettings, putSettings } from '@/lib/db'
import { DEFAULT_SETTINGS, type Settings } from '@/types/settings'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const THEME_CACHE_KEY = 'dusk:theme-cache'

interface SettingsContextValue {
  settings: Settings
  loaded: boolean
  updateSettings: (partial: Partial<Settings>) => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const [, setThemeCache] = useLocalStorage(THEME_CACHE_KEY)

  useEffect(() => {
    getSettings().then((loadedSettings) => {
      setSettings(loadedSettings)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.themeMode === 'dark')
    setThemeCache(settings.themeMode)
  }, [settings.themeMode, setThemeCache])

  async function updateSettings(partial: Partial<Settings>) {
    const next = { ...settings, ...partial }
    setSettings(next)
    await putSettings(next)
  }

  return (
    <SettingsContext.Provider value={{ settings, loaded, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export function readThemeCache(): 'light' | 'dark' | null {
  try {
    const value = localStorage.getItem(THEME_CACHE_KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}
