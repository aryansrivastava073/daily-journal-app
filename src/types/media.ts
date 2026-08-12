export type MediaKind = 'image' | 'video' | 'audio'

export interface MediaAttachment {
  id: string
  entryId: string
  kind: MediaKind
  mimeType: string
  fileName?: string
  durationSec?: number
  createdAt: number
}
