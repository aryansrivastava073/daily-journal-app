const GEMINI_MODEL = 'gemini-flash-latest'
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_API_URL = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent`
const TIMEOUT_MS = 10_000

export async function listGeminiModels(apiKey) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${GEMINI_API_BASE}?key=${encodeURIComponent(apiKey)}`, {
      signal: controller.signal,
    })
    if (!response.ok) return []
    const data = await response.json()
    return (data.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => m.name.replace('models/', ''))
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

async function callGemini(apiKey, systemInstruction, userText, maxOutputTokens) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userText }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { maxOutputTokens },
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Gemini API error: ${response.status} ${body}`)
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('')
    if (!text?.trim()) {
      throw new Error('Gemini API returned no text content')
    }
    return text.trim()
  } finally {
    clearTimeout(timeout)
  }
}

export function createGeminiProvider(apiKey) {
  return {
    async continueThought(text, options) {
      const mood = options?.mood ? ` The writer's current mood is "${options.mood}".` : ''
      const system =
        'You are a gentle journaling companion. Continue the user\'s journal entry in their own voice, ' +
        'for one or two short sentences only. Do not repeat what they wrote. Do not add quotation marks, ' +
        `labels, or commentary — reply with only the continuation text itself.${mood}`
      const continuation = await callGemini(apiKey, system, text, options?.maxTokens ?? 120)
      return { text: continuation, source: 'gemini' }
    },
    async translateHinglish(text) {
      const system =
        'Translate the following Hinglish (mixed Hindi/English, romanized) journal text into natural, ' +
        'warm English. Preserve the meaning and tone. Reply with only the translated text, nothing else.'
      const translated = await callGemini(apiKey, system, text, 300)
      return { text: translated, source: 'gemini' }
    },
  }
}
