import type { AIProvider, AIContinueOptions, AIResult } from '@/types/ai'
import { createClaudeProvider } from './claudeProvider'
import { createLocalProvider } from './localProvider'
import { translateHinglishViaGoogle } from './googleTranslateProvider'

const localProvider = createLocalProvider()

function isOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine
}

export function createAIProvider(getApiKey: () => string | null): AIProvider {
  return {
    async continueThought(text: string, options?: AIContinueOptions): Promise<AIResult> {
      const apiKey = getApiKey()
      if (isOnline() && apiKey) {
        try {
          return await createClaudeProvider(apiKey).continueThought(text, options)
        } catch {
          // fall through to the local heuristic below
        }
      }
      return localProvider.continueThought(text, options)
    },

    async translateHinglish(text: string): Promise<AIResult> {
      const apiKey = getApiKey()
      if (isOnline() && apiKey) {
        try {
          return await createClaudeProvider(apiKey).translateHinglish(text)
        } catch {
          // fall through to the free translator below
        }
      }
      if (isOnline()) {
        try {
          const translated = await translateHinglishViaGoogle(text)
          return { text: translated, source: 'google' }
        } catch {
          // fall through to the offline dictionary below
        }
      }
      return localProvider.translateHinglish(text)
    },
  }
}
