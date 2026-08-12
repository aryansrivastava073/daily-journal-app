import { AuthProvider, useAuth } from '@/state/AuthContext'
import { AppProviders } from '@/state/AppProviders'
import { AppShell } from '@/components/layout/AppShell'
import { AuthScreen } from '@/components/auth/AuthScreen'

function Gate() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <AuthScreen />

  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  )
}

function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}

export default App
