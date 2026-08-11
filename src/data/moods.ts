import type { MoodOption } from '@/types/mood'

export const MOODS: MoodOption[] = [
  { id: 'bright', label: 'Bright', color: 'var(--color-mood-bright)' },
  { id: 'calm', label: 'Calm', color: 'var(--color-mood-calm)' },
  { id: 'reflective', label: 'Reflective', color: 'var(--color-mood-reflective)' },
  { id: 'tender', label: 'Tender', color: 'var(--color-mood-tender)' },
  { id: 'heavy', label: 'Heavy', color: 'var(--color-mood-heavy)' },
  { id: 'grateful', label: 'Grateful', color: 'var(--color-mood-grateful)' },
  { id: 'joyful', label: 'Joyful', color: 'var(--color-mood-joyful)' },
]

export function getMood(id: string | null | undefined): MoodOption | undefined {
  return MOODS.find((m) => m.id === id)
}
