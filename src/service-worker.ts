import './helpers/text-helpers'
import { fileExtMap } from './helpers/file-helpers'
import { sanitizeTextForSSML } from './helpers/text-helpers'
import { SessionStorage, SyncStorage, SynthesizeParams, Voice } from './types'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

// Local state -----------------------------------------------------------------
let queue: string[] = []
let playing = false
let cancellationToken = false
let bootstrappedResolver: (() => void) | null = null

// Chunk size for processing audio bytes to avoid call stack overflow
// 8192 bytes is a good balance between memory usage and performance
const AUDIO_CHUNK_SIZE = 8192

const bootstrapped = new Promise<void>((resolve) => (bootstrappedResolver = resolve))

// Bootstrap function - called after handlers are defined
async function bootstrap() {
  await migrateSyncStorage()
  await handlers.fetchVoices()
  await setDefaultSettings()
  await createContextMenus()
  bootstrappedResolver!()
}

// Event listeners -------------------------------------------------------------
chrome.commands.onCommand.addListener(function(command) {
  console.log('Handling command...', ...arguments)

  if (!handlers[command]) throw new Error(`No handler found for ${command}`)

  handlers[command]()
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Handling message...', ...arguments)

  const { id, payload } = request

  if (!handlers[id]) throw new Error(`No handler found for ${id}`)
  handlers[id](payload).then(sendResponse)

  return true
})

chrome.storage.onChanged.addListener(function(changes) {
  console.log('Handling storage change...', ...arguments)

  if (!changes.downloadEncoding) return

  updateContextMenus()
})

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  console.log('Handling context menu click...', ...arguments)

  const id = info.menuItemId
  const sanitizedText = sanitizeTextForSSML(info.selectionText || '')
  const payload = { text: sanitizedText }

  if (!handlers[id]) throw new Error(`No handler found for ${id}`)

  handlers[id](payload)
})

chrome.runtime.onInstalled.addListener(async function(details) {
  console.log('Handling runtime install...', ...arguments)

  const self = await chrome.management.getSelf()
  if (details.reason === 'install' && self.installType !== 'development') {
    const helpUrl = chrome.runtime.getURL('/help.html')

    chrome.tabs.create({ url: helpUrl })
  }
})

// Handlers --------------------------------------------------------------------
export const handlers: any = {
  readAloud1x: async function({ text }: { text: string }): Promise<boolean> {
    return this.readAloud({ text, speed: 1 })
  },
  readAloud1_5x: async function({ text }: { text: string }): Promise<boolean> {
    return this.readAloud({ text, speed: 1.5 })
  },
  readAloud2x: async function({ text }: { text: string }): Promise<boolean> {
    return this.readAloud({ text, speed: 2 })
  },
  readAloud: async function({ text, speed }: { text: string; speed?: number }): Promise<boolean> {
    console.log('Reading aloud...', ...arguments)

    if (playing) await this.stopReading()

    const sync = await chrome.storage.sync.get() as SyncStorage
    const chunks = text.chunk()
    console.log('Chunked text into', chunks.length, 'chunks', chunks)

    queue.push(...chunks)
    playing = true
    updateContextMenus()

    let count = 0
    const encoding = sync.readAloudEncoding
    const prefetchQueue = []
    cancellationToken = false
    while (queue.length) {
      if (cancellationToken) {
        cancellationToken = false
        playing = false
        updateContextMenus()
        return
      }

      const text = queue.shift()
      const nextText = queue[0]

      if (nextText) {
        prefetchQueue.push(this.getAudioUri({ text: nextText, encoding, speed }))
      }

      const audioUri =
        count === 0
          ? await this.getAudioUri({ text, encoding, speed })
          : await prefetchQueue.shift()

      try {
        await createOffscreenDocument()
        await chrome.runtime.sendMessage({
          id: 'play',
          payload: { audioUri },
          offscreen: true
        })
      } catch (e) {
        console.warn('Failed to play audio', e)

        // Audio playback may have failed because the user stopped playback, or
        // called the readAloud function again. We need to return early to avoid
        // playing the next chunk.
        return
      }

      console.log('Play through of audio complete. Enqueuing next chunk.')
      count++
    }

    playing = false
    updateContextMenus()
    return Promise.resolve(true)
  },
  readAloudShortcut: async function(): Promise<void> {
    console.log('Handling read aloud shortcut...', ...arguments)

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: retrieveSelection
    })
    const rawText = result[0].result
    const text = sanitizeTextForSSML(rawText || '')

    if (playing) {
      await this.stopReading()

      if (!text) return
    }

    this.readAloud({ text })
  },
  stopReading: async function(): Promise<boolean> {
    console.log('Stopping reading...', ...arguments)

    cancellationToken = true
    queue = []
    playing = false
    updateContextMenus()

    try {
      await createOffscreenDocument()
      await chrome.runtime.sendMessage({
        id: 'stop',
        offscreen: true
      })
    } catch (e) {
      console.warn('Failed to stop audio', e)
    }

    return Promise.resolve(true)
  },
  download: async function({ text }: { text: string }): Promise<boolean> {
    console.log('Downloading audio...', ...arguments)

    const { downloadEncoding: encoding } = await chrome.storage.sync.get()
    const url = await this.getAudioUri({ text, encoding })

    console.log('Downloading audio from', url)
    chrome.downloads.download({
      url,
      filename: `tts-download.${fileExtMap[encoding]}`
    })

    return Promise.resolve(true)
  },
  downloadShortcut: async function(): Promise<void> {
    console.log('Handling download shortcut...', ...arguments)

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: retrieveSelection
    })
    const rawText = result[0].result
    const text = sanitizeTextForSSML(rawText || '')

    this.download({ text })
  },
  synthesize: async function(params: SynthesizeParams): Promise<string> {
    console.log('Synthesizing text...', ...arguments)

    const { text, encoding, voice, subscriptionKey, region, speed, pitch, volumeGainDb } = params

    if (!subscriptionKey || !region) {
      sendMessageToCurrentTab({
        id: 'setError',
        payload: {
          icon: 'error',
          title: 'Azure credentials are missing',
          message: 'Please enter valid Azure Subscription Key and Region in the extension popup. Instructions: https://docs.microsoft.com/azure/cognitive-services/speech-service/'
        }
      })

      throw new Error('Azure credentials are missing')
    }

    // Create Azure Speech Config
    const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region)
    speechConfig.speechSynthesisVoiceName = voice

    // Map audio formats to Azure supported formats
    const formatMap: { [key: string]: sdk.SpeechSynthesisOutputFormat } = {
      'MP3': sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3,
      'MP3_64_KBPS': sdk.SpeechSynthesisOutputFormat.Audio16Khz64KBitRateMonoMp3,
      'OGG_OPUS': sdk.SpeechSynthesisOutputFormat.Ogg16Khz16BitMonoOpus
    }

    speechConfig.speechSynthesisOutputFormat = formatMap[encoding] || sdk.SpeechSynthesisOutputFormat.Audio16Khz64KBitRateMonoMp3

    // Create synthesizer (no audio config for pull stream)
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as unknown as sdk.AudioConfig)

    // Build SSML with prosody settings
    const prosodyAttributes = []
    if (speed !== 1) {
      // Azure uses relative rate like "+50%" or "-25%"
      const ratePercent = Math.round((speed - 1) * 100)
      const rateSign = ratePercent >= 0 ? '+' : ''
      prosodyAttributes.push(`rate="${rateSign}${ratePercent}%"`)
    }
    if (pitch !== 0) {
      const pitchSign = pitch >= 0 ? '+' : ''
      prosodyAttributes.push(`pitch="${pitchSign}${pitch}%"`)
    }
    if (volumeGainDb !== 0) {
      const volumeSign = volumeGainDb >= 0 ? '+' : ''
      prosodyAttributes.push(`volume="${volumeSign}${volumeGainDb}dB"`)
    }

    let ssml: string
    const isSSML = text.isSSML()

    if (isSSML) {
      // If already SSML, wrap with prosody if needed
      if (prosodyAttributes.length > 0) {
        const prosodyTag = `<prosody ${prosodyAttributes.join(' ')}>`
        ssml = text.replace(/<speak[^>]*>(.*)<\/speak>/s,
          `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">${prosodyTag}$1</prosody></voice></speak>`)
      } else {
        ssml = text.replace(/<speak[^>]*>(.*)<\/speak>/s,
          `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">$1</voice></speak>`)
      }
    } else {
      // Convert text to SSML
      if (prosodyAttributes.length > 0) {
        ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}"><prosody ${prosodyAttributes.join(' ')}>${text}</prosody></voice></speak>`
      } else {
        ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">${text}</voice></speak>`
      }
    }

    try {
      const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
        synthesizer.speakSsmlAsync(
          ssml,
          (result) => {
            synthesizer.close()
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              resolve(result)
            } else {
              reject(new Error(`Speech synthesis failed: ${result.errorDetails || sdk.ResultReason[result.reason]}`))
            }
          },
          (error) => {
            synthesizer.close()
            reject(error)
          }
        )
      })

      // Convert ArrayBuffer to base64
      const audioData = result.audioData
      const audioBytes = new Uint8Array(audioData)
      const binaryChunks: string[] = []
      for (let i = 0; i < audioBytes.length; i += AUDIO_CHUNK_SIZE) {
        const chunk = audioBytes.slice(i, i + AUDIO_CHUNK_SIZE)
        binaryChunks.push(String.fromCharCode(...chunk))
      }
      return btoa(binaryChunks.join(''))
    } catch (error) {
      console.error('Azure Speech API error:', error)

      sendMessageToCurrentTab({
        id: 'setError',
        payload: { title: 'Failed to synthesize text', message: String(error) }
      })

      await this.stopReading()
      throw error
    }
  },
  getAudioUri: async function({ text, encoding, speed }: {
    text: string;
    encoding: string;
    speed?: number
  }): Promise<string> {
    console.log('Getting audio URI...', ...arguments)

    const sync = await chrome.storage.sync.get() as SyncStorage
    const voice = sync.voices[sync.language]

    const chunks = text.chunk()
    console.log('Chunked text into', chunks.length, 'chunks', chunks)

    const promises = chunks.map((text) => this.synthesize({
      text,
      encoding,
      voice,
      subscriptionKey: sync.subscriptionKey,
      region: sync.region,
      speed: speed !== undefined ? speed : sync.speed,
      pitch: sync.pitch,
      volumeGainDb: sync.volumeGainDb,
      engine: sync.engine
    }))
    const audioContents = await Promise.all(promises)

    return (
      `data:audio/${fileExtMap[encoding]};base64,` +
      btoa(audioContents.map(atob).join(''))
    )
  },
  fetchVoices: async function(): Promise<Voice[] | false> {
    console.log('Fetching voices...', ...arguments)

    try {
      const sync = await chrome.storage.sync.get() as SyncStorage

      if (!sync.subscriptionKey || !sync.region) {
        console.warn('Azure credentials not configured')
        return false
      }

      // Create Azure Speech Config
      const speechConfig = sdk.SpeechConfig.fromSubscription(sync.subscriptionKey, sync.region)
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as unknown as sdk.AudioConfig)

      // Use the Promise-based API for getVoicesAsync
      const voicesResult = await synthesizer.getVoicesAsync()
      synthesizer.close()

      if (!voicesResult.voices || voicesResult.voices.length === 0) {
        throw new Error(voicesResult.errorDetails || 'No voices found')
      }

      const result = voicesResult.voices

      // Transform Azure VoiceInfo to our Voice interface
      const transformedVoices: Voice[] = result.map((voice) => ({
        name: voice.name,
        shortName: voice.shortName,
        locale: voice.locale,
        localName: voice.localName,
        gender: voice.gender === sdk.SynthesisVoiceGender.Male ? 'Male' :
                voice.gender === sdk.SynthesisVoiceGender.Female ? 'Female' : 'Neutral',
        voiceType: voice.voiceType === sdk.SynthesisVoiceType.OnlineNeural ? 'neural' :
                   voice.voiceType === sdk.SynthesisVoiceType.OnlineStandard ? 'standard' : 'neural',
        styleList: voice.styleList || []
      }))

      await chrome.storage.session.set({ voices: transformedVoices })
      await setLanguages()

      return transformedVoices
    } catch (e) {
      console.warn('Failed to fetch voices', e)
      return false
    }
  }
}

// Initialize the extension
bootstrap()

// Helpers ---------------------------------------------------------------------
async function updateContextMenus() {
  console.log('Updating context menus...', { playing })

  // Prevents context menus from being updated before they are created,
  // which causes an unnecessary error in the console.
  await bootstrapped

  const commands = await chrome.commands.getAll()
  const encoding = (await chrome.storage.sync.get()).downloadEncoding
  const fileExt = fileExtMap[encoding]
  const downloadShortcut = commands.find((c) => c.name === 'downloadShortcut')?.shortcut

  chrome.contextMenus.update('readAloud', {
    enabled: true
  })

  chrome.contextMenus.update('readAloud1x', {
    enabled: true
  })

  chrome.contextMenus.update('readAloud1_5x', {
    enabled: true
  })

  chrome.contextMenus.update('readAloud2x', {
    enabled: true
  })

  chrome.contextMenus.update('stopReading', {
    enabled: playing
  })

  chrome.contextMenus.update('download', {
    title: `Download ${fileExt?.toUpperCase()}${downloadShortcut && ` (${downloadShortcut})`}`
  })
}

async function createContextMenus() {
  console.log('Creating context menus...', ...arguments)
  chrome.contextMenus.removeAll()


  const commands = await chrome.commands.getAll()
  const readAloudShortcut = commands.find((c) => c.name === 'readAloudShortcut')?.shortcut
  const downloadShortcut = commands.find((c) => c.name === 'downloadShortcut')?.shortcut
  const downloadEncoding = (await chrome.storage.sync.get()).downloadEncoding
  const fileExt = fileExtMap[downloadEncoding]

  chrome.contextMenus.create({
    id: 'readAloud',
    title: `Read Aloud ${readAloudShortcut && ` (${readAloudShortcut})`}`,
    contexts: ['selection'],
    enabled: !playing
  })

  chrome.contextMenus.create({
    id: 'readAloud1x',
    title: `Read Aloud (1x)`,
    contexts: ['selection'],
    enabled: !playing
  })

  chrome.contextMenus.create({
    id: 'readAloud1_5x',
    title: `Read Aloud (1.5x)`,
    contexts: ['selection'],
    enabled: !playing
  })

  chrome.contextMenus.create({
    id: 'readAloud2x',
    title: `Read Aloud (2x)`,
    contexts: ['selection'],
    enabled: !playing
  })

  chrome.contextMenus.create({
    id: 'stopReading',
    title: `Stop reading${readAloudShortcut && ` (${readAloudShortcut})`}`,
    contexts: ['all'],
    enabled: playing
  })

  chrome.contextMenus.create({
    id: 'download',
    title: `Download ${fileExt?.toUpperCase()}${downloadShortcut && ` (${downloadShortcut})`}`,
    contexts: ['selection']
  })
}

let creating: Promise<void> | null = null

async function createOffscreenDocument() {
  const path = 'offscreen.html'

  if (await hasOffscreenDocument(path)) return

  if (creating) {
    await creating
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: 'Plays synthesized audio in the background'
    })
      .then(() => {
        console.log('Offscreen document created successfully')
        creating = null
      })
      .catch((error) => {
        console.error('Failed to create offscreen document', error)
        creating = null
      })

    await creating
    creating = null
  }
}

async function hasOffscreenDocument(path: string): Promise<boolean> {
  console.log('Checking if offscreen document exists...', ...arguments)

  const offscreenUrl = chrome.runtime.getURL(path)
  const matchedClients = await clients.matchAll()

  for (const client of matchedClients) {
    if (client.url === offscreenUrl) return true
  }

  return false
}

export async function setDefaultSettings(): Promise<void> {
  console.log('Setting default settings...', ...arguments)

  await chrome.storage.session.setAccessLevel({
    accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'
  })

  const sync = await chrome.storage.sync.get()
  await chrome.storage.sync.set({
    language: sync.language || 'en-US',
    speed: sync.speed || 1,
    pitch: sync.pitch || 0,
    voices: sync.voices || { 'en-US': 'en-US-JennyNeural' },
    readAloudEncoding: sync.readAloudEncoding || 'OGG_OPUS',
    downloadEncoding: sync.downloadEncoding || 'MP3_64_KBPS',
    subscriptionKey: sync.subscriptionKey || '',
    region: sync.region || 'eastus',
    audioProfile: sync.audioProfile || 'default',
    volumeGainDb: sync.volumeGainDb || 0,
    engine: sync.engine || 'neural'
  })
}

async function migrateSyncStorage(): Promise<void> {
  console.log('Migrating sync storage...', ...arguments)

  const sync = await chrome.storage.sync.get()

  // Extension with version 8 had OGG_OPUS as a download option, but
  // it was rolled back in version 9. Due to audio stiching issues.
  if (
    Number(chrome.runtime.getManifest().version) <= 9 &&
    sync.downloadEncoding == 'OGG_OPUS'
  ) {
    await chrome.storage.sync.set({ downloadEncoding: 'MP3_64_KBPS' })
  }

  // Extensions with version < 8 had a different storage structure.
  // We need to migrate them to the new structure before we can use them.
  if (sync.voices || Number(chrome.runtime.getManifest().version) < 8) return

  await chrome.storage.sync.clear()

  const newSync: any = {}
  if (sync.locale) {
    const oldVoiceParts = sync.locale.split('-')
    newSync.language = [oldVoiceParts[0], oldVoiceParts[1]].join('-')
    // Map old voice to Azure neural voice
    newSync.voices = { [newSync.language]: 'en-US-JennyNeural' }
  }

  if (sync.speed) {
    newSync.speed = Number(sync.speed)
  }

  if (sync.pitch) {
    newSync.pitch = 0
  }

  // Migrate from Google Cloud API key to Azure credentials
  if (sync.apiKey) {
    // Clear old API key since we're now using Azure
    newSync.subscriptionKey = ''
    newSync.region = 'eastus'
    newSync.credentialsValid = false
  }

  await chrome.storage.sync.set(newSync)
}

async function setLanguages(): Promise<Set<string>> {
  console.log('Setting languages...', ...arguments)

  const session = await chrome.storage.session.get() as SessionStorage

  if (!session.voices) {
    throw new Error('No voices found. Cannot set languages.')
  }

  const languages = new Set(
    session.voices?.map((voice: Voice) => voice.locale) || []
  )

  await chrome.storage.session.set({ languages: Array.from(languages) })

  return languages
}

function retrieveSelection(): string {
  console.log('Retrieving selection...', ...arguments)

  const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement
  if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {

    const start = activeElement.selectionStart || 0
    const end = activeElement.selectionEnd || 0

    return activeElement.value.slice(start, end)
  }

  return window.getSelection()?.toString() || ''
}


async function sendMessageToCurrentTab(event: any): Promise<void> {
  console.log('Sending message to current tab...', ...arguments)

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const currentTab = tabs[0]

  if (!currentTab) {
    console.warn('No current tab found. Aborting message send.')
    return
  }

  chrome.tabs.sendMessage(currentTab.id!, event)
}
