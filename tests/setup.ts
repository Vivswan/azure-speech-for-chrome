/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Auto cleanup after each test
afterEach(() => {
	cleanup();
	// Clear all mocks
	vi.clearAllMocks();
});

// Mock Chrome Extension APIs
global.chrome = {
	storage: {
		sync: {
			get: vi.fn(),
			set: vi.fn(),
			remove: vi.fn(),
			clear: vi.fn(),
			getBytesInUse: vi.fn(),
			onChanged: {
				addListener: vi.fn(),
				removeListener: vi.fn(),
				hasListener: vi.fn(),
			},
		},
		session: {
			get: vi.fn(),
			set: vi.fn(),
			remove: vi.fn(),
			clear: vi.fn(),
			onChanged: {
				addListener: vi.fn(),
				removeListener: vi.fn(),
				hasListener: vi.fn(),
			},
		},
		local: {
			get: vi.fn(),
			set: vi.fn(),
			remove: vi.fn(),
			clear: vi.fn(),
			getBytesInUse: vi.fn(),
			onChanged: {
				addListener: vi.fn(),
				removeListener: vi.fn(),
				hasListener: vi.fn(),
			},
		},
	},
	runtime: {
		sendMessage: vi.fn(),
		onMessage: {
			addListener: vi.fn(),
			removeListener: vi.fn(),
			hasListener: vi.fn(),
		},
		getURL: vi.fn((path) => `chrome-extension://mock-id/${path}`),
		id: "mock-extension-id",
		lastError: undefined,
	},
	tabs: {
		query: vi.fn(),
		sendMessage: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		onUpdated: {
			addListener: vi.fn(),
			removeListener: vi.fn(),
			hasListener: vi.fn(),
		},
		onActivated: {
			addListener: vi.fn(),
			removeListener: vi.fn(),
			hasListener: vi.fn(),
		},
	},
	commands: {
		onCommand: {
			addListener: vi.fn(),
			removeListener: vi.fn(),
			hasListener: vi.fn(),
		},
	},
	contextMenus: {
		create: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		removeAll: vi.fn(),
		onClicked: {
			addListener: vi.fn(),
			removeListener: vi.fn(),
			hasListener: vi.fn(),
		},
	},
	offscreen: {
		createDocument: vi.fn(),
		closeDocument: vi.fn(),
		hasDocument: vi.fn(),
	},
} as any;

// Mock Azure Speech SDK
vi.mock("microsoft-cognitiveservices-speech-sdk", () => ({
	AudioConfig: {
		fromDefaultSpeakerOutput: vi.fn(() => ({ close: vi.fn() })),
	},
	SpeechConfig: {
		fromSubscription: vi.fn(() => ({
			speechSynthesisLanguage: "",
			speechSynthesisVoiceName: "",
			close: vi.fn(),
		})),
	},
	SpeechSynthesizer: vi.fn(() => ({
		speakTextAsync: vi.fn((text, success, _error) => {
			success?.({ audioData: new ArrayBuffer(0) });
		}),
		speakSsmlAsync: vi.fn((ssml, success, _error) => {
			success?.({ audioData: new ArrayBuffer(0) });
		}),
		close: vi.fn(),
	})),
	ResultReason: {
		SynthesizingAudioCompleted: "SynthesizingAudioCompleted",
		Canceled: "Canceled",
	},
	CancellationReason: {
		Error: "Error",
	},
}));

// Mock wink-nlp
vi.mock("wink-nlp", () => ({
	default: vi.fn(() => ({
		readDoc: vi.fn((text) => ({
			sentences: vi.fn(() => ({
				out: vi.fn(() => [text]),
			})),
		})),
	})),
}));

// Mock wink-eng-lite-web-model
vi.mock("wink-eng-lite-web-model", () => ({
	default: {},
}));

// Mock Service Worker clients API
(global as any).clients = {
	matchAll: vi.fn(() => Promise.resolve([])),
	openWindow: vi.fn(),
	claim: vi.fn(),
	get: vi.fn(),
};

// Mock browser APIs
global.matchMedia = vi.fn((query) => ({
	matches: false,
	media: query,
	onchange: null,
	addListener: vi.fn(),
	removeListener: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	dispatchEvent: vi.fn(),
})) as any;

global.IntersectionObserver = vi.fn(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
	takeRecords: vi.fn(),
	root: null,
	rootMargin: "",
	thresholds: [],
})) as any;

global.ResizeObserver = vi.fn(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
})) as any;

// Mock window.location
delete (window as any).location;
window.location = {
	href: "http://localhost:3000",
	origin: "http://localhost:3000",
	protocol: "http:",
	host: "localhost:3000",
	hostname: "localhost",
	port: "3000",
	pathname: "/",
	search: "",
	hash: "",
	assign: vi.fn(),
	reload: vi.fn(),
	replace: vi.fn(),
	ancestorOrigins: {} as any,
} as any;
