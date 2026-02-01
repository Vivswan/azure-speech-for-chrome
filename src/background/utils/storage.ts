// Storage utilities for managing settings and migrations
import { SessionStorage, Voice } from "../../types";

export async function setDefaultSettings(): Promise<void> {
	console.log("Setting default settings...", ...arguments);

	await chrome.storage.session.setAccessLevel({
		accessLevel: "TRUSTED_AND_UNTRUSTED_CONTEXTS",
	});

	const sync = await chrome.storage.sync.get();
	await chrome.storage.sync.set({
		language: sync.language || "en-US",
		speed: sync.speed || 1,
		pitch: sync.pitch || 0,
		voices: sync.voices || { "en-US": "en-US-JennyNeural" },
		readAloudEncoding: sync.readAloudEncoding || "OGG_OPUS",
		downloadEncoding: sync.downloadEncoding || "MP3_64_KBPS",
		subscriptionKey: sync.subscriptionKey || "",
		region: sync.region || "eastus",
		audioProfile: sync.audioProfile || "default",
		volumeGainDb: sync.volumeGainDb || 0,
		engine: sync.engine || "neural",
	});
}

export async function migrateSyncStorage(): Promise<void> {
	console.log("Migrating sync storage...", ...arguments);

	const sync = await chrome.storage.sync.get();

	// Extension with version 8 had OGG_OPUS as a download option, but
	// it was rolled back in version 9. Due to audio stiching issues.
	if (Number(chrome.runtime.getManifest().version) <= 9 && sync.downloadEncoding == "OGG_OPUS") {
		await chrome.storage.sync.set({ downloadEncoding: "MP3_64_KBPS" });
	}

	// Extensions with version < 8 had a different storage structure.
	// We need to migrate them to the new structure before we can use them.
	if (sync.voices || Number(chrome.runtime.getManifest().version) < 8) return;

	await chrome.storage.sync.clear();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const newSync: any = {};
	if (sync.locale) {
		const oldVoiceParts = (sync.locale as string).split("-");
		newSync.language = [oldVoiceParts[0], oldVoiceParts[1]].join("-");
		// Map old voice to Azure neural voice
		newSync.voices = { [newSync.language]: "en-US-JennyNeural" };
	}

	if (sync.speed) {
		newSync.speed = Number(sync.speed);
	}

	if (sync.pitch) {
		newSync.pitch = 0;
	}

	// Migrate from Google Cloud API key to Azure credentials
	if (sync.apiKey) {
		// Clear old API key since we're now using Azure
		newSync.subscriptionKey = "";
		newSync.region = "eastus";
		newSync.credentialsValid = false;
	}

	await chrome.storage.sync.set(newSync);
}

export async function setLanguages(): Promise<Set<string>> {
	console.log("Setting languages...", ...arguments);

	const session = (await chrome.storage.session.get()) as SessionStorage;

	if (!session.voices) {
		throw new Error("No voices found. Cannot set languages.");
	}

	const languages = new Set(session.voices?.map((voice: Voice) => voice.locale) || []);

	await chrome.storage.session.set({ languages: Array.from(languages) });

	return languages;
}
