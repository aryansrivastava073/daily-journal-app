const HASHTAG_RE = /#([a-zA-Z][\w-]*)/g

export function extractHashtags(text: string): string[] {
  const found = new Set<string>()
  for (const match of text.matchAll(HASHTAG_RE)) {
    found.add(match[1].toLowerCase())
  }
  return [...found]
}

export function mergeTags(manualTags: string[], parsedTags: string[]): string[] {
  const merged = new Set<string>()
  for (const tag of [...parsedTags, ...manualTags]) {
    const normalized = tag.trim().toLowerCase()
    if (normalized) merged.add(normalized)
  }
  return [...merged]
}
