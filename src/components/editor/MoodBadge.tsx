import { getMood } from '@/data/moods'
import type { MoodId } from '@/types/mood'

export function MoodBadge({ moodId }: { moodId: MoodId | null | undefined }) {
  const mood = getMood(moodId)
  if (!mood) return null

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
      style={{ backgroundColor: mood.color }}
    >
      {mood.label}
    </span>
  )
}
