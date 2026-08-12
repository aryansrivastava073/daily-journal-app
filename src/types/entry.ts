import type { MoodId } from './mood'

export interface JournalEntry {
  id: string
  date: string
  title: string
  body: string
  mood: MoodId | null
  tags: string[]
  createdAt: number
  updatedAt: number
}
