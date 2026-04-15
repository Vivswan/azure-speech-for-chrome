// Speech synthesis and audio generation
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { fileExtMap } from "../../helpers/file-helpers";
import { SyncStorage, SynthesizeParams } from "../../types";
import { AUDIO_CHUNK_SIZE } from "../state";
import { sendMessageToCurrentTab } from "../utils/messaging";
import {
	validateSubscriptionKey,
	validateRegion,
	validateTextForSynthesis,
	validateSpeed,
	validatePitch,
	validateVolume,
} from "../../helpers/validation-helpers";

export async function synthesize(params: SynthesizeParams): Promise<string> {
	console.log("Synthesizing text...", ...arguments);

	const { text, encoding, voice, subscriptionKey, region, speed, pitch, volumeGainDb } = params;

	// Validate subscription key
	const keyValidation = validateSubscriptionKey(subscriptionKey);
	if (!keyValidation.valid) {
		sendMessageToCurrentTab({
			id: "setError",
			payload: {
				icon: "error",
				title: "Invalid Azure Subscription Key",
				message: keyValidation.error || "Please provide a valid subscription key",
			},
		});
		throw new Error(keyValidation.error || "Invalid subscription key");
	}

	// Validate region
	const regionValidation = validateRegion(region);
	if (!regionValidation.valid) {
		sendMessageToCurrentTab({
			id: "setError",
			payload: {
				icon: "error",
				title: "Invalid Azure Region",
				message: regionValidation.error || "Please provide a valid region",
			},
		});
		throw new Error(regionValidation.error || "Invalid region");
	}

	// Validate text
	const textValidation = validateTextForSynthesis(text);
	if (!textValidation.valid) {
		sendMessageToCurrentTab({
			id: "setError",
			payload: {
				icon: "error",
				title: "Invalid Text",
				message: textValidation.error || "Please provide valid text",
			},
		});
		throw new Error(textValidation.error || "Invalid text");
	}

	// Validate speed
	const speedValidation = validateSpeed(speed);
	if (!speedValidation.valid) {
		sendMessageToCurrentTab({
			id: "setError",
			payload: {
				icon: "error",
				title: "Invalid Speed",
				message: speedValidation.error || "Please provide a valid speed value",
			},
		});
		throw new Error(speedValidation.error || "Invalid speed");
	}

	// Validate pitch
	const pitchValidation = validatePitch(pitch);
	if (!pitchValidation.valid) {
		sendMessageToCurrentTab({
			id: "setError",
			payload: {
				icon: "error",
				title: "Invalid Pitch",
				message: pitchValidation.error || "Please provide a valid pitch value",
			},
		});
		throw new Error(pitchValidation.error || "Invalid pitch");
	}

	// Validate volume
	const volumeValidation = validateVolume(volumeGainDb);
	if (!volumeValidation.valid) {
		sendMessageToCurrentTab({
			id: "setError",
			payload: {
				icon: "error",
				title: "Invalid Volume",
				message: volumeValidation.error || "Please provide a valid volume value",
			},
		});
		throw new Error(volumeValidation.error || "Invalid volume");
	}

	// Create Azure Speech Config
	const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
	speechConfig.speechSynthesisVoiceName = voice;

	// Map audio formats to Azure supported formats
	const formatMap: { [key: string]: sdk.SpeechSynthesisOutputFormat } = {
		MP3: sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3,
		MP3_64_KBPS: sdk.SpeechSynthesisOutputFormat.Audio16Khz64KBitRateMonoMp3,
		OGG_OPUS: sdk.SpeechSynthesisOutputFormat.Ogg16Khz16BitMonoOpus,
	};

	speechConfig.speechSynthesisOutputFormat =
		formatMap[encoding] || sdk.SpeechSynthesisOutputFormat.Audio16Khz64KBitRateMonoMp3;

	// Create synthesizer (no audio config for pull stream)
	const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null as unknown as sdk.AudioConfig);

	// Build SSML with prosody settings
	const prosodyAttributes = [];
	if (speed !== 1) {
		// Azure uses relative rate like "+50%" or "-25%"
		const ratePercent = Math.round((speed - 1) * 100);
		const rateSign = ratePercent >= 0 ? "+" : "";
		prosodyAttributes.push(`rate="${rateSign}${ratePercent}%"`);
	}
	if (pitch !== 0) {
		const pitchSign = pitch >= 0 ? "+" : "";
		prosodyAttributes.push(`pitch="${pitchSign}${pitch}%"`);
	}
	if (volumeGainDb !== 0) {
		const volumeSign = volumeGainDb >= 0 ? "+" : "";
		prosodyAttributes.push(`volume="${volumeSign}${volumeGainDb}dB"`);
	}

	let ssml: string;
	const isSSML = text.isSSML();

	if (isSSML) {
		// If already SSML, wrap with prosody if needed
		if (prosodyAttributes.length > 0) {
			const prosodyTag = `<prosody ${prosodyAttributes.join(" ")}>`;
			ssml = text.replace(
				/<speak[^>]*>(.*)<\/speak>/s,
				`<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">${prosodyTag}$1</prosody></voice></speak>`
			);
		} else {
			ssml = text.replace(
				/<speak[^>]*>(.*)<\/speak>/s,
				`<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">$1</voice></speak>`
			);
		}
	} else {
		// Convert text to SSML
		if (prosodyAttributes.length > 0) {
			ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}"><prosody ${prosodyAttributes.join(" ")}>${text}</prosody></voice></speak>`;
		} else {
			ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">${text}</voice></speak>`;
		}
	}

	try {
		const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
			synthesizer.speakSsmlAsync(
				ssml,
				(result) => {
					synthesizer.close();
					if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
						resolve(result);
					} else {
						reject(new Error(`Speech synthesis failed: ${result.errorDetails || sdk.ResultReason[result.reason]}`));
					}
				},
				(error) => {
					synthesizer.close();
					reject(error);
				}
			);
		});

		// Convert ArrayBuffer to base64
		const audioData = result.audioData;
		const audioBytes = new Uint8Array(audioData);
		const binaryChunks: string[] = [];
		for (let i = 0; i < audioBytes.length; i += AUDIO_CHUNK_SIZE) {
			const chunk = audioBytes.slice(i, i + AUDIO_CHUNK_SIZE);
			binaryChunks.push(String.fromCharCode(...chunk));
		}
		return btoa(binaryChunks.join(""));
	} catch (error) {
		console.error("Azure Speech API error:", error);

		sendMessageToCurrentTab({
			id: "setError",
			payload: { title: "Failed to synthesize text", message: String(error) },
		});

		throw error;
	}
}

export async function getAudioUri({
	text,
	encoding,
	speed,
}: {
	text: string;
	encoding: string;
	speed?: number;
}): Promise<string> {
	console.log("Getting audio URI...", ...arguments);

	const sync = (await chrome.storage.sync.get()) as SyncStorage;
	const voice = sync.voices[sync.language];

	const chunks = text.chunk();
	console.log("Chunked text into", chunks.length, "chunks", chunks);

	const promises = chunks.map((text) =>
		synthesize({
			text,
			encoding,
			voice,
			subscriptionKey: sync.subscriptionKey,
			region: sync.region,
			speed: speed !== undefined ? speed : sync.speed,
			pitch: sync.pitch,
			volumeGainDb: sync.volumeGainDb,
			engine: sync.engine,
		})
	);
	const audioContents = await Promise.all(promises);

	return `data:audio/${fileExtMap[encoding]};base64,` + btoa(audioContents.map(atob).join(""));
}
