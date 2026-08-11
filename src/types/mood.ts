export type MoodId =
  | 'bright'
  | 'calm'
  | 'reflective'
  | 'tender'
  | 'heavy'
  | 'grateful'
  | 'joyful'

export interface MoodOption {
  id: MoodId
  label: string
  color: string
}
