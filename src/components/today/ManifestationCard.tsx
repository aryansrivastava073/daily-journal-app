import { RotatingPromptCard } from './RotatingPromptCard'
import { MANIFESTATION_PROMPTS } from '@/data/manifestations'
import { useSettings } from '@/state/SettingsContext'

export function ManifestationCard() {
  const { settings, updateSettings } = useSettings()

  return (
    <RotatingPromptCard
      heading="A little intention"
      items={MANIFESTATION_PROMPTS}
      lastId={settings.lastManifestationId}
      onRefresh={(id) => updateSettings({ lastManifestationId: id })}
      colorClassName="bg-peach"
      textClassName="text-peach-ink"
    />
  )
}
