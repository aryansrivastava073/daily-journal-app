import { AppProviders } from '@/state/AppProviders'
import { AppShell } from '@/components/layout/AppShell'

function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  )
}

export default App
