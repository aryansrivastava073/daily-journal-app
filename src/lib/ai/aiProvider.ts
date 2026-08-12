import type { AIProvider, AIContinueOptions, AIResult } from '@/types/ai'
import { createLocalProvider } from './localProvider'
import { aiApi } from '@/lib/api'

const localProvider = createLocalProvider()

function isOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine
}

export function createAIProvider(): AIProvider {
  return {
    async continueThought(text: string, options?: AIContinueOptions): Promise<AIResult> {
      if (isOnline()) {
        try {
          return await aiApi.continueThought(text, options?.mood)
        } catch {
          // backend unreachable — fall through to the local heuristic below
        }
      }
      return localProvider.continueThought(text, options)
    },

    async translateHinglish(text: string): Promise<AIResult> {
      if (isOnline()) {
        try {
          return await aiApi.translateHinglish(text)
        } catch {
          // backend unreachable — fall through to the offline dictionary below
        }
      }
      return localProvider.translateHinglish(text)
    },
  }
}
