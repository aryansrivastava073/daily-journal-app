import type { AIProvider, AIResult } from '@/types/ai'
import { CONTINUATION_BANK, GENERIC_CONTINUATIONS } from '@/data/continuationPhrases'
import { HINGLISH_MAP } from '@/data/hinglishMap'

const lastPicked = new Map<string, number>()

function pickPhrase(bucketKey: string, phrases: string[]): string {
  if (phrases.length === 1) return phrases[0]
  const previous = lastPicked.get(bucketKey)
  let index = Math.floor(Math.random() * phrases.length)
  if (index === previous) {
    index = (index + 1) % phrases.length
  }
  lastPicked.set(bucketKey, index)
  return phrases[index]
}

function lastSentence(text: string): string {
  const parts = text.split(/(?<=[.!?])\s+/).map((p) => p.trim()).filter(Boolean)
  return parts.length ? parts[parts.length - 1] : text.trim()
}

const sortedHinglishKeys = Object.keys(HINGLISH_MAP).sort((a, b) => b.length - a.length)

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const hinglishPattern = new RegExp(
  `\\b(${sortedHinglishKeys.map(escapeRegExp).join('|')})\\b`,
  'gi',
)

function translateHinglishText(text: string): string {
  return text.replace(hinglishPattern, (match) => {
    const replacement = HINGLISH_MAP[match.toLowerCase()]
    if (!replacement) return match
    return match[0] === match[0].toUpperCase()
      ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
      : replacement
  })
}

export function createLocalProvider(): AIProvider {
  return {
    async continueThought(text): Promise<AIResult> {
      const last = lastSentence(text)
      const bucket = CONTINUATION_BANK.find((b) => b.test(last))
      const phrases = bucket ? bucket.phrases : GENERIC_CONTINUATIONS
      const bucketKey = bucket ? bucket.phrases[0] : 'generic'
      return { text: pickPhrase(bucketKey, phrases), source: 'local' }
    },
    async translateHinglish(text): Promise<AIResult> {
      return { text: translateHinglishText(text), source: 'local' }
    },
  }
}
