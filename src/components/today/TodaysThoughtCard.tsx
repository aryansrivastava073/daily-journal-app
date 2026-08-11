import { RotatingPromptCard } from './RotatingPromptCard'
import { DAILY_QUOTES } from '@/data/quotes'
import { useSettings } from '@/state/SettingsContext'

export function TodaysThoughtCard() {
  const { settings, updateSettings } = useSettings()

  return (
    <RotatingPromptCard
      heading="Today's thought"
      items={DAILY_QUOTES}
      lastId={settings.lastQuoteId}
      onRefresh={(id) => updateSettings({ lastQuoteId: id })}
      colorClassName="bg-sage"
      textClassName="text-sage-ink"
      refreshLabel="New thought"
    />
  )
}
