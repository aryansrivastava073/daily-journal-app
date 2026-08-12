import { apiFetch, apiFetchBlob } from './client'
import type { JournalEntry } from '@/types/entry'
import type { MediaAttachment, MediaKind } from '@/types/media'
import type { HabitWithLogs } from '@/types/habit'
import type { Todo } from '@/types/todo'
import type { Settings } from '@/types/settings'
import type { AuthUser } from '@/types/auth'
import type { AIResult } from '@/types/ai'
import type { DuskBackup } from '@/types/backup'
import type { MoodId } from '@/types/mood'

export const authApi = {
  signup: (email: string, password: string) =>
    apiFetch<{ token: string; user: AuthUser }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => apiFetch<{ user: AuthUser }>('/api/auth/me'),
}

export const entriesApi = {
  list: (from?: string, to?: string) =>
    apiFetch<JournalEntry[]>(`/api/entries${from && to ? `?from=${from}&to=${to}` : ''}`),
  getByDate: (date: string) => apiFetch<JournalEntry>(`/api/entries/${date}`),
  upsertByDate: (date: string, partial: Partial<JournalEntry>) =>
    apiFetch<JournalEntry>(`/api/entries/${date}`, { method: 'PUT', body: JSON.stringify(partial) }),
  remove: (id: string) => apiFetch<void>(`/api/entries/${id}`, { method: 'DELETE' }),
}

export const mediaApi = {
  listForEntry: (entryId: string) => apiFetch<MediaAttachment[]>(`/api/entries/${entryId}/media`),
  upload: (entryId: string, file: Blob, kind: MediaKind, fileName?: string, durationSec?: number) => {
    const form = new FormData()
    form.set('kind', kind)
    if (durationSec) form.set('durationSec', String(durationSec))
    form.set('file', file, fileName)
    return apiFetch<MediaAttachment>(`/api/entries/${entryId}/media`, { method: 'POST', body: form })
  },
  fetchBlob: (id: string) => apiFetchBlob(`/api/media/${id}`),
  remove: (id: string) => apiFetch<void>(`/api/media/${id}`, { method: 'DELETE' }),
}

export const habitsApi = {
  list: () => apiFetch<HabitWithLogs[]>('/api/habits'),
  create: (name: string) => apiFetch<HabitWithLogs>('/api/habits', { method: 'POST', body: JSON.stringify({ name }) }),
  toggle: (id: string, date: string, completed: boolean) =>
    apiFetch<{ ok: true }>(`/api/habits/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ date, completed }),
    }),
  remove: (id: string) => apiFetch<void>(`/api/habits/${id}`, { method: 'DELETE' }),
}

export const todosApi = {
  list: () => apiFetch<Todo[]>('/api/todos'),
  create: (text: string, tag?: string) =>
    apiFetch<Todo>('/api/todos', { method: 'POST', body: JSON.stringify({ text, tag }) }),
  setDone: (id: string, done: boolean) =>
    apiFetch<Todo>(`/api/todos/${id}`, { method: 'PUT', body: JSON.stringify({ done }) }),
  remove: (id: string) => apiFetch<void>(`/api/todos/${id}`, { method: 'DELETE' }),
}

export const settingsApi = {
  get: () => apiFetch<Settings>('/api/settings'),
  update: (partial: Partial<Settings>) =>
    apiFetch<Settings>('/api/settings', { method: 'PUT', body: JSON.stringify(partial) }),
}

export const aiApi = {
  continueThought: (text: string, mood?: MoodId | null) =>
    apiFetch<AIResult>('/api/ai/continue', { method: 'POST', body: JSON.stringify({ text, mood }) }),
  translateHinglish: (text: string) =>
    apiFetch<AIResult>('/api/ai/translate', { method: 'POST', body: JSON.stringify({ text }) }),
}

export const backupApi = {
  export: () => apiFetch<DuskBackup>('/api/backup/export'),
  import: (backup: DuskBackup) =>
    apiFetch<{ ok: true }>('/api/backup/import', { method: 'POST', body: JSON.stringify(backup) }),
}
