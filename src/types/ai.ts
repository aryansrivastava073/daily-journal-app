import type { MoodId } from './mood'

export interface AIContinueOptions {
  mood?: MoodId | null
  maxTokens?: number
}

export type AISource = 'claude' | 'gemini' | 'google' | 'local'

export interface AIResult {
  text: string
  source: AISource
}

export interface AIProvider {
  continueThought(text: string, options?: AIContinueOptions): Promise<AIResult>
  translateHinglish(text: string): Promise<AIResult>
}
