import type { AIProvider, AIContinueOptions, AIResult } from '@/types/ai'

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude(apiKey: string, system: string, userText: string, maxTokens: number): Promise<string> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userText }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  const block = data.content?.find((c: { type: string }) => c.type === 'text')
  if (!block?.text) {
    throw new Error('Claude API returned no text content')
  }
  return block.text.trim()
}

export function createClaudeProvider(apiKey: string): AIProvider {
  return {
    async continueThought(text: string, options?: AIContinueOptions): Promise<AIResult> {
      const mood = options?.mood ? ` The writer's current mood is "${options.mood}".` : ''
      const system =
        'You are a gentle journaling companion. Continue the user\'s journal entry in their own voice, ' +
        'for one or two short sentences only. Do not repeat what they wrote. Do not add quotation marks, ' +
        `labels, or commentary — reply with only the continuation text itself.${mood}`
      const continuation = await callClaude(apiKey, system, text, options?.maxTokens ?? 120)
      return { text: continuation, source: 'claude' }
    },
    async translateHinglish(text: string): Promise<AIResult> {
      const system =
        'Translate the following Hinglish (mixed Hindi/English, romanized) journal text into natural, ' +
        'warm English. Preserve the meaning and tone. Reply with only the translated text, nothing else.'
      const translated = await callClaude(apiKey, system, text, 300)
      return { text: translated, source: 'claude' }
    },
  }
}
