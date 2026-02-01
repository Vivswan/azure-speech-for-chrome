import { vi } from "vitest";

interface ChromeStorage {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

/**
 * Create a mock Chrome storage with in-memory state
 */
export function createMockChromeStorage() {
	const syncStorage: ChromeStorage = {};
	const sessionStorage: ChromeStorage = {};
	const localStorage: ChromeStorage = {};

	return {
		sync: {
			data: syncStorage,
			get: vi.fn((keys?: string | string[] | null) => {
				if (!keys) return Promise.resolve(syncStorage);
				if (typeof keys === "string") {
					return Promise.resolve({ [keys]: syncStorage[keys] });
				}
				const result: ChromeStorage = {};
				keys.forEach((key) => {
					if (key in syncStorage) {
						result[key] = syncStorage[key];
					}
				});
				return Promise.resolve(result);
			}),
			set: vi.fn((items: ChromeStorage) => {
				Object.assign(syncStorage, items);
				return Promise.resolve();
			}),
			remove: vi.fn((keys: string | string[]) => {
				const keysArray = Array.isArray(keys) ? keys : [keys];
				keysArray.forEach((key) => delete syncStorage[key]);
				return Promise.resolve();
			}),
			clear: vi.fn(() => {
				Object.keys(syncStorage).forEach((key) => delete syncStorage[key]);
				return Promise.resolve();
			}),
		},
		session: {
			data: sessionStorage,
			get: vi.fn((keys?: string | string[] | null) => {
				if (!keys) return Promise.resolve(sessionStorage);
				if (typeof keys === "string") {
					return Promise.resolve({ [keys]: sessionStorage[keys] });
				}
				const result: ChromeStorage = {};
				keys.forEach((key) => {
					if (key in sessionStorage) {
						result[key] = sessionStorage[key];
					}
				});
				return Promise.resolve(result);
			}),
			set: vi.fn((items: ChromeStorage) => {
				Object.assign(sessionStorage, items);
				return Promise.resolve();
			}),
			remove: vi.fn((keys: string | string[]) => {
				const keysArray = Array.isArray(keys) ? keys : [keys];
				keysArray.forEach((key) => delete sessionStorage[key]);
				return Promise.resolve();
			}),
			clear: vi.fn(() => {
				Object.keys(sessionStorage).forEach((key) => delete sessionStorage[key]);
				return Promise.resolve();
			}),
		},
		local: {
			data: localStorage,
			get: vi.fn((keys?: string | string[] | null) => {
				if (!keys) return Promise.resolve(localStorage);
				if (typeof keys === "string") {
					return Promise.resolve({ [keys]: localStorage[keys] });
				}
				const result: ChromeStorage = {};
				keys.forEach((key) => {
					if (key in localStorage) {
						result[key] = localStorage[key];
					}
				});
				return Promise.resolve(result);
			}),
			set: vi.fn((items: ChromeStorage) => {
				Object.assign(localStorage, items);
				return Promise.resolve();
			}),
			remove: vi.fn((keys: string | string[]) => {
				const keysArray = Array.isArray(keys) ? keys : [keys];
				keysArray.forEach((key) => delete localStorage[key]);
				return Promise.resolve();
			}),
			clear: vi.fn(() => {
				Object.keys(localStorage).forEach((key) => delete localStorage[key]);
				return Promise.resolve();
			}),
		},
	};
}

/**
 * Reset all Chrome API mocks
 */
export function resetChromeMocks() {
	vi.clearAllMocks();

	// Reset Chrome storage mocks
	if (chrome?.storage) {
		vi.mocked(chrome.storage.sync.get).mockReset();
		vi.mocked(chrome.storage.sync.set).mockReset();
		vi.mocked(chrome.storage.sync.remove).mockReset();
		vi.mocked(chrome.storage.sync.clear).mockReset();

		vi.mocked(chrome.storage.session.get).mockReset();
		vi.mocked(chrome.storage.session.set).mockReset();
		vi.mocked(chrome.storage.session.remove).mockReset();
		vi.mocked(chrome.storage.session.clear).mockReset();

		vi.mocked(chrome.storage.local.get).mockReset();
		vi.mocked(chrome.storage.local.set).mockReset();
		vi.mocked(chrome.storage.local.remove).mockReset();
		vi.mocked(chrome.storage.local.clear).mockReset();
	}

	// Reset Chrome runtime mocks
	if (chrome?.runtime) {
		vi.mocked(chrome.runtime.sendMessage).mockReset();
	}

	// Reset Chrome tabs mocks
	if (chrome?.tabs) {
		vi.mocked(chrome.tabs.query).mockReset();
		vi.mocked(chrome.tabs.sendMessage).mockReset();
		vi.mocked(chrome.tabs.create).mockReset();
		vi.mocked(chrome.tabs.update).mockReset();
	}
}
