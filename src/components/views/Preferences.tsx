import React from 'react'
import { useSession } from '../../hooks/useSession'
import { useSync } from '../../hooks/useSync'
import { Dropdown } from '../inputs/Dropdown'
import { Range } from '../inputs/Range'
import { EngineOption, LanguageOption, SessionStorage, VoiceOption } from '../../types'
import { useTranslation } from '../../localization/translation'

const downloadAudioFormats = [
  { value: 'MP3_64_KBPS', title: 'MP3 (64kbps)', description: 'Recommended' },
  { value: 'MP3', title: 'MP3 (32kbps)' }
]

const readingAudioFormats = [
  { value: 'OGG_OPUS', title: 'OGG', description: 'Recommended' },
  { value: 'MP3_64_KBPS', title: 'MP3 (64kbps)' },
  { value: 'MP3', title: 'MP3 (32kbps)' }
]


export function Preferences() {
  const { ready: sessionReady, session } = useSession()
  const { ready: syncReady, sync, setSync } = useSync()
  const { t } = useTranslation()

  if (!sessionReady || !syncReady) return null
  const languageOptions = getLanguageOptions(session)
  const engineOptions = getEngineOptions(session, sync.language)
  const voiceOptions = getVoiceOptions(session, sync.language, sync.engine)
  const voice = sync.voices[sync.language] || voiceOptions[0]?.value


  return (
    <div className="flex flex-col gap-5">
      <div className={!sync.credentialsValid ? 'opacity-50 pointer-events-none' : ''}>
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          {t('preferences.title')}
        </div>
        <div className="grid gap-4 grid-cols-1 bg-white p-3 rounded shadow-sm border">
          <div className="grid grid-cols-2 gap-4">
            <Dropdown
              label={t('preferences.language_label')}
              value={sync.language}
              onChange={(language) => {
                if (languageOptions.find((l: LanguageOption) => l.value === language)) {
                  const newEngineOptions = getEngineOptions(session, language)
                  const isCurrentEngineValid = newEngineOptions.find((e: EngineOption) => e.value === sync.engine)
                  const newEngine = isCurrentEngineValid ? sync.engine : newEngineOptions[0]?.value

                  const newVoiceOptions = getVoiceOptions(session, language, newEngine)
                  const currentVoice = sync.voices[language]
                  const isCurrentVoiceValid = currentVoice && newVoiceOptions.find((v: VoiceOption) => v.value === currentVoice)
                  const newVoice = isCurrentVoiceValid ? currentVoice : newVoiceOptions[0]?.value

                  setSync({
                    ...sync,
                    language,
                    engine: newEngine,
                    voices: { ...sync.voices, [language]: newVoice }
                  })
                }
              }}
              placeholder={t('preferences.language_placeholder')}
              options={languageOptions}
            />
            <Dropdown
              label={t('preferences.engine_label')}
              value={sync.engine}
              onChange={(engine) => {
                if (engineOptions.find((e: EngineOption) => e.value === engine)) {
                  const newVoiceOptions = getVoiceOptions(session, sync.language, engine)
                  const currentVoice = sync.voices[sync.language]
                  const isCurrentVoiceValid = currentVoice && newVoiceOptions.find((v: VoiceOption) => v.value === currentVoice)
                  const newVoice = isCurrentVoiceValid ? currentVoice : newVoiceOptions[0]?.value

                  setSync({
                    ...sync,
                    engine,
                    voices: { ...sync.voices, [sync.language]: newVoice }
                  })
                }
              }}
              placeholder={t('preferences.engine_placeholder')}
              options={engineOptions}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Dropdown
              label={t('preferences.voice_label')}
              value={voice}
              onChange={(voice) => {
                if (voiceOptions.find((v: VoiceOption) => v.value === voice)) {
                  setSync({
                    ...sync,
                    voices: { ...sync.voices, [sync.language]: voice }
                  })
                }
              }}
              placeholder={t('preferences.voice_placeholder')}
              options={voiceOptions}
            />
          </div>
          <div className="grid gap-4">
            <Range
              label={t('preferences.speed_label')}
              min={0.5}
              max={3}
              step={0.05}
              value={sync.speed}
              unit="×"
              onChange={(speed) => setSync({ ...sync, speed })}
              ticks={[0.5, 1, 1.5, 2, 2.5, 3]}
            />
            <Range
              label={t('preferences.pitch_label')}
              min={-10}
              max={10}
              step={0.1}
              value={sync.pitch}
              onChange={(pitch) => setSync({ ...sync, pitch })}
              ticks={[-10, -5, 0, 5, 10]}
            />
            <Range
              label={t('preferences.volume_gain_label')}
              min={-16}
              max={16}
              step={1}
              value={sync.volumeGainDb}
              unit="dB"
              onChange={(volumeGainDb) => setSync({ ...sync, volumeGainDb })}
              ticks={[-16, -8, 0, 8, 16]}
            />
          </div>
        </div>
      </div>
      <div className={!sync.credentialsValid ? 'opacity-50 pointer-events-none' : ''}>
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          {t('preferences.audio_format_title')}
        </div>
        <div className="grid gap-4 grid-cols-2 bg-white p-3 rounded shadow-sm border">
          <Dropdown
            label={t('preferences.download_format_label')}
            value={sync.downloadEncoding}
            options={downloadAudioFormats}
            onChange={(downloadEncoding) => {
              if (
                downloadAudioFormats.find((f: any) => f.value === downloadEncoding)
              ) {
                setSync({ ...sync, downloadEncoding })
              }
            }}
          />
          <Dropdown
            label={t('preferences.read_aloud_format_label')}
            value={sync.readAloudEncoding}
            options={readingAudioFormats}
            onChange={(readAloudEncoding) => {
              if (
                readingAudioFormats.find((f: any) => f.value === readAloudEncoding)
              ) {
                setSync({ ...sync, readAloudEncoding })
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

function getVoiceOptions(session: SessionStorage, language: string, engine: string): VoiceOption[] {
  if (!session?.voices) return []
  const voicesInLanguage = session.voices?.filter((voice) =>
    voice.locale === language && voice.voiceType === engine
  ) || []

  const voiceNames = voicesInLanguage.map(({ name, shortName, localName, gender }) => {
    // Use the shortName for display (e.g., "JennyNeural") and name for value (full Azure voice name)
    // Extract the voice name part from shortName (e.g., "en-US-JennyNeural" -> "Jenny Neural")
    const displayName = shortName.replace(/^[a-z]+-[A-Z]+-/, '').replace(/Neural$/, ' Neural').replace(/Standard$/, ' Standard').trim()
    const title = localName || displayName
    const description = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()

    return { value: name, title, description }
  })

  const sortedVoices = voiceNames.sort((a, b) => {
    if (a.title < b.title) return -1
    if (a.title > b.title) return 1
    return 0
  })

  return sortedVoices
}

function getLanguageOptions(session: SessionStorage): LanguageOption[] {
  if (!session?.languages) return []
  const displayNames = new Intl.DisplayNames(['en-US'], {
    type: 'language',
    languageDisplay: 'standard'
  })

  const languageNames = session.languages?.map((value) => {
    try {
      // Azure uses standard locale codes like 'en-US', 'zh-CN', etc.
      let displayName
      try {
        displayName = displayNames.of(value)
      } catch (e) {
        // If the code fails, try just the language part
        const parts = value.split('-')
        displayName = displayNames.of(parts[0])
      }

      if (!displayName) {
        // Create a readable fallback from the original code
        const parts = value.split('-')
        const language = parts[0].toUpperCase()
        const region = parts[1] ? parts[1].toUpperCase() : ''
        const title = region ? `${language} (${region})` : language
        return { value, title, description: 'Language variant' }
      }

      const parts = value.split('-')
      let [title, ...tail] = displayName.split(' ')

      // Add region info from locale code
      if (parts.length > 1) {
        title += ` (${parts[1]})`
      }

      let description = tail.join(' ')
      if (description.startsWith('(')) description = description.slice(1, -1)
      if (description.endsWith(')')) description = description.slice(0, -1)

      return { value, title, description }
    } catch (error) {
      console.warn(`Error processing language code ${value}:`, error)
      // Enhanced fallback with better formatting
      const parts = value.split('-')
      const language = parts[0] ? parts[0].toUpperCase() : 'Unknown'
      const region = parts[1] ? parts[1].toUpperCase() : ''

      let title = language
      if (region) {
        title += ` (${region})`
      }

      return { value, title, description: 'Language variant' }
    }
  }).filter(Boolean)

  const sortedLanguages = Array.from(languageNames).sort((a: any, b: any) => {
    if (a.title < b.title) return -1
    if (a.title > b.title) return 1
    return 0
  })

  return sortedLanguages as LanguageOption[]
}

function getEngineOptions(session: SessionStorage, language: string): EngineOption[] {
  if (!session?.voices) return []

  const voicesInLanguage = session.voices?.filter((voice) =>
    voice.locale === language
  ) || []

  const engines = new Set(
    voicesInLanguage.map((voice) => voice.voiceType)
  )

  const engineOptions = Array.from(engines).map((engine) => {
    const engineNames = {
      'standard': { title: 'Standard', description: 'Basic quality (legacy)' },
      'neural': { title: 'Neural', description: 'High quality, natural sounding' }
    }

    const engineInfo = engineNames[engine.toLowerCase()] || {
      title: engine.charAt(0).toUpperCase() + engine.slice(1).toLowerCase(),
      description: 'Voice engine'
    }

    return {
      value: engine,
      title: engineInfo.title,
      description: engineInfo.description
    }
  })

  // Sort with neural first (Azure primarily uses neural now)
  const sortedEngines = engineOptions.sort((a, b) => {
    const order = ['neural', 'standard']
    const aIndex = order.indexOf(a.value.toLowerCase())
    const bIndex = order.indexOf(b.value.toLowerCase())

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }

    if (a.title < b.title) return -1
    if (a.title > b.title) return 1
    return 0
  })

  return sortedEngines
}
