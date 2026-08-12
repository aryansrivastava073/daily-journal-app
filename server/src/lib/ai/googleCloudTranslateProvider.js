const ENDPOINT = 'https://translation.googleapis.com/language/translate/v2'
const TIMEOUT_MS = 8_000

export async function translateHinglishViaGoogleCloud(text, apiKey) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ q: text, target: 'en', format: 'text' }),
    })
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Google Cloud Translate API error: ${response.status} ${body}`)
    }

    const data = await response.json()
    const translated = data?.data?.translations?.[0]?.translatedText
    if (typeof translated !== 'string' || !translated.trim()) {
      throw new Error('Empty translation result')
    }
    return translated
  } finally {
    clearTimeout(timeout)
  }
}
