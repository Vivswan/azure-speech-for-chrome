// Voice fetching and management
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { SyncStorage, Voice } from "../../types";
import { setLanguages } from "../utils/storage";

export async function fetchVoices(): Promise<Voice[] | false> {
	console.log("Fetching voices...", ...arguments);

	try {
		const sync = (await chrome.storage.sync.get()) as SyncStorage;

		if (!sync.subscriptionKey || !sync.region) {
			console.warn("Azure credentials not configured");
			return false;
		}

		// Create Azure Speech Config
		const speechConfig = sdk.SpeechConfig.fromSubscription(sync.subscriptionKey, sync.region);
		const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as unknown as sdk.AudioConfig);

		// Use the Promise-based API for getVoicesAsync
		const voicesResult = await synthesizer.getVoicesAsync();
		synthesizer.close();

		if (!voicesResult.voices || voicesResult.voices.length === 0) {
			throw new Error(voicesResult.errorDetails || "No voices found");
		}

		const result = voicesResult.voices;

		// Transform Azure VoiceInfo to our Voice interface
		const transformedVoices: Voice[] = result.map((voice) => ({
			name: voice.name,
			shortName: voice.shortName,
			locale: voice.locale,
			localName: voice.localName,
			gender:
				voice.gender === sdk.SynthesisVoiceGender.Male
					? "Male"
					: voice.gender === sdk.SynthesisVoiceGender.Female
						? "Female"
						: "Neutral",
			voiceType:
				voice.voiceType === sdk.SynthesisVoiceType.OnlineNeural
					? "neural"
					: voice.voiceType === sdk.SynthesisVoiceType.OnlineStandard
						? "standard"
						: "neural",
			styleList: voice.styleList || [],
		}));

		await chrome.storage.session.set({ voices: transformedVoices });
		await setLanguages();

		return transformedVoices;
	} catch (e) {
		console.warn("Failed to fetch voices", e);
		return false;
	}
}
