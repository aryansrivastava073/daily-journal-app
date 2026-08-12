const ENDPOINT = 'https://translate.googleapis.com/translate_a/single'
const TIMEOUT_MS = 6_000

export async function translateHinglishViaGoogle(text) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const url = `${ENDPOINT}?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Translate API error: ${response.status}`)
    }

    const data = await response.json()
    const segments = data?.[0]
    if (!Array.isArray(segments)) {
      throw new Error('Unexpected translate response shape')
    }

    const translated = segments.map((segment) => segment?.[0] ?? '').join('')
    if (!translated.trim()) {
      throw new Error('Empty translation result')
    }
    return translated
  } finally {
    clearTimeout(timeout)
  }
}
