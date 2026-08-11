export interface Settings {
  id: 'app'
  themeMode: 'light' | 'dark'
  calendarView: 'month' | 'week'
  weekStartsOn: 0 | 1
  lastQuoteId?: string
  lastManifestationId?: string
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'app',
  themeMode: 'light',
  calendarView: 'month',
  weekStartsOn: 1,
}
