const ENDPOINT = 'https://translate.googleapis.com/translate_a/single'

export async function translateHinglishViaGoogle(text: string): Promise<string> {
  const url = `${ENDPOINT}?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Translate API error: ${response.status}`)
  }

  const data = await response.json()
  const segments = data?.[0]
  if (!Array.isArray(segments)) {
    throw new Error('Unexpected translate response shape')
  }

  const translated = segments.map((segment: unknown[]) => segment?.[0] ?? '').join('')
  if (!translated.trim()) {
    throw new Error('Empty translation result')
  }
  return translated
}
