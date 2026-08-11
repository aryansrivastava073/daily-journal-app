import { createAIProvider } from './aiProvider'
import { getStoredApiKey } from '@/lib/apiKeyStorage'

export const aiProvider = createAIProvider(getStoredApiKey)
export type { AIProvider, AIResult, AIContinueOptions, AISource } from '@/types/ai'
