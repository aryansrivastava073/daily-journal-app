import { createAIProvider } from './aiProvider'

export const aiProvider = createAIProvider()
export type { AIProvider, AIResult, AIContinueOptions, AISource } from '@/types/ai'
