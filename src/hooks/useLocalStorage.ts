import { useCallback, useState } from 'react'

export function useLocalStorage(key: string, initialValue: string | null = null) {
  const [value, setValue] = useState<string | null>(() => {
    try {
      return localStorage.getItem(key) ?? initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (next: string | null) => {
      setValue(next)
      try {
        if (next === null) {
          localStorage.removeItem(key)
        } else {
          localStorage.setItem(key, next)
        }
      } catch {
        // localStorage unavailable (e.g. private mode) — keep in-memory value only
      }
    },
    [key],
  )

  return [value, set] as const
}
