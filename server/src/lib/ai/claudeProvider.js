const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const TIMEOUT_MS = 10_000

async function callClaude(apiKey, system, userText, maxTokens) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
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
    const block = data.content?.find((c) => c.type === 'text')
    if (!block?.text) {
      throw new Error('Claude API returned no text content')
    }
    return block.text.trim()
  } finally {
    clearTimeout(timeout)
  }
}

export function createClaudeProvider(apiKey) {
  return {
    async continueThought(text, options) {
      const mood = options?.mood ? ` The writer's current mood is "${options.mood}".` : ''
      const system =
        'You are a gentle journaling companion. Continue the user\'s journal entry in their own voice, ' +
        'for one or two short sentences only. Do not repeat what they wrote. Do not add quotation marks, ' +
        `labels, or commentary — reply with only the continuation text itself.${mood}`
      const continuation = await callClaude(apiKey, system, text, options?.maxTokens ?? 120)
      return { text: continuation, source: 'claude' }
    },
    async translateHinglish(text) {
      const system =
        'Translate the following Hinglish (mixed Hindi/English, romanized) journal text into natural, ' +
        'warm English. Preserve the meaning and tone. Reply with only the translated text, nothing else.'
      const translated = await callClaude(apiKey, system, text, 300)
      return { text: translated, source: 'claude' }
    },
  }
}
