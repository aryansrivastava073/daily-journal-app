const API_KEY_STORAGE_KEY = 'dusk:anthropic-api-key'

export function getStoredApiKey(): string | null {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, key)
  } catch {
    // localStorage unavailable — key simply won't persist across reloads
  }
}

export function clearStoredApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
  } catch {
    // no-op
  }
}
