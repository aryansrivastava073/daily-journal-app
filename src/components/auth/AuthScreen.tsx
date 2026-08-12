import { useState, type FormEvent } from 'react'
import { useAuth, authErrorMessage } from '@/state/AuthContext'

export function AuthScreen() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        await signup(email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 text-ink dark:bg-dusk-bg-dark dark:text-inherit">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white/60 p-8 shadow-sm dark:border-dusk-line-dark dark:bg-white/5">
        <div className="mb-8 text-center">
          <div className="font-display text-2xl leading-none text-ink dark:text-inherit">dusk</div>
          <div className="mt-1 text-[11px] font-medium tracking-[0.18em] text-ink-soft uppercase">
            your daily ritual
          </div>
        </div>

        <h1 className="mb-6 text-center font-display text-xl text-ink dark:text-inherit">
          {mode === 'login' ? 'Welcome back' : 'Begin your ritual'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-sage-deep dark:border-dusk-line-dark dark:text-inherit"
          />
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 8 characters)"
            className="w-full rounded-xl border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-sage-deep dark:border-dusk-line-dark dark:text-inherit"
          />

          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-2xl bg-sage-ink px-5 py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'login' ? 'signup' : 'login'))
            setError(null)
          }}
          className="mt-6 w-full text-center text-xs font-medium text-ink-soft hover:text-ink dark:hover:text-inherit"
        >
          {mode === 'login' ? "New here? Create an account" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  )
}
