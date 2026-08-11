export type MediaKind = 'image' | 'video' | 'audio'

export interface MediaAttachment {
  id: string
  entryId: string
  kind: MediaKind
  blob: Blob
  mimeType: string
  fileName?: string
  durationSec?: number
  createdAt: number
}
