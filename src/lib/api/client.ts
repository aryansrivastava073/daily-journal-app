import { getStoredToken } from '@/lib/authStorage'

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (typeof data?.error === 'string') return data.error
  } catch {
    // response body wasn't JSON — fall through to the generic message
  }
  return `Request failed with status ${response.status}`
}

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken()
  const headers = new Headers(options.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  if (response.status === 401 && onUnauthorized) {
    onUnauthorized()
  }
  if (!response.ok) {
    throw new ApiError(response.status, await extractErrorMessage(response))
  }
  return response
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('content-type', 'application/json')
  }
  const response = await request(path, { ...options, headers })
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function apiFetchBlob(path: string): Promise<Blob> {
  const response = await request(path)
  return response.blob()
}

export function apiJsonBody(value: unknown): string {
  return JSON.stringify(value)
}
