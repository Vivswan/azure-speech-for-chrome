import type { SyncStorage, SessionStorage } from "@/types";

/**
 * Mock sync storage data
 */
export const mockSyncStorage: SyncStorage = {
	subscriptionKey: "mock-subscription-key",
	region: "eastus",
	voices: { "en-US": "en-US-JennyNeural" },
	pitch: 0,
	speed: 1.0,
	readAloudEncoding: "mp3-24khz-48kbitrate-mono",
	downloadEncoding: "mp3-24khz-48kbitrate-mono",
	language: "en-US",
	audioProfile: "",
	volumeGainDb: 0,
	credentialsValid: true,
	engine: "azure",
};

/**
 * Mock session storage data with voices and languages
 */
export const mockSessionStorage: Partial<SessionStorage> = {
	voices: [
		{
			name: "en-US-JennyNeural",
			shortName: "en-US-JennyNeural",
			locale: "en-US",
			localName: "Jenny",
			gender: "Female",
			voiceType: "Neural",
		},
		{
			name: "en-US-GuyNeural",
			shortName: "en-US-GuyNeural",
			locale: "en-US",
			localName: "Guy",
			gender: "Male",
			voiceType: "Neural",
		},
	],
	languages: ["en-US", "es-ES"],
};

/**
 * Mock voice options for dropdown
 */
export const mockVoiceOptions = [
	{ label: "Jenny (en-US-JennyNeural)", value: "en-US-JennyNeural" },
	{ label: "Guy (en-US-GuyNeural)", value: "en-US-GuyNeural" },
];

/**
 * Mock language options for dropdown
 */
export const mockLanguageOptions = [
	{ label: "English (United States)", value: "en-US" },
	{ label: "Spanish (Spain)", value: "es-ES" },
];

/**
 * Mock translation data
 */
export const mockTranslations = {
	en: {
		app_name: "Azure Speech for Chrome",
		settings: "Settings",
		subscription_key: "Subscription Key",
		region: "Region",
		voice: "Voice",
		pitch: "Pitch",
		rate: "Rate",
		save: "Save",
		cancel: "Cancel",
	},
	es: {
		app_name: "Azure Speech para Chrome",
		settings: "Configuración",
		subscription_key: "Clave de suscripción",
		region: "Región",
		voice: "Voz",
		pitch: "Tono",
		rate: "Velocidad",
		save: "Guardar",
		cancel: "Cancelar",
	},
};

/**
 * Mock plain text samples
 */
export const mockPlainText = "Hello, this is a test message for text-to-speech.";

/**
 * Mock SSML text samples
 */
export const mockSSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <prosody rate="1.0" pitch="0Hz">
      Hello, this is a test message for text-to-speech.
    </prosody>
  </voice>
</speak>`;

/**
 * Mock long text for chunking tests
 */
export const mockLongText =
	"This is the first sentence. This is the second sentence. This is the third sentence. This is the fourth sentence. This is the fifth sentence.";

/**
 * Mock file format mappings
 */
export const mockFileFormats = {
	".txt": "plain",
	".md": "plain",
	".html": "html",
	".xml": "xml",
	".pdf": "pdf",
	".docx": "docx",
};

/**
 * Mock Chrome tab
 */
export const mockTab = {
	id: 1,
	index: 0,
	windowId: 1,
	highlighted: true,
	active: true,
	pinned: false,
	incognito: false,
	selected: true,
	discarded: false,
	autoDiscardable: true,
	groupId: -1,
	url: "https://example.com",
	title: "Example Domain",
};

/**
 * Mock Chrome message
 */
export const mockMessage = {
	type: "SPEAK_TEXT",
	payload: {
		text: mockPlainText,
		voice: "en-US-JennyNeural",
		rate: 1.0,
		pitch: 0,
	},
};
