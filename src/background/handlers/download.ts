// Download audio file handlers
import { fileExtMap } from "../../helpers/file-helpers";
import { sanitizeTextForSSML } from "../../helpers/text-helpers";
import { retrieveSelection } from "../utils/messaging";
import { getAudioUri } from "./synthesis";

export async function download({ text }: { text: string }): Promise<boolean> {
	console.log("Downloading audio...", ...arguments);

	const { downloadEncoding } = await chrome.storage.sync.get();
	const encoding = downloadEncoding as string;
	const url = await getAudioUri({ text, encoding });

	console.log("Downloading audio from", url);
	chrome.downloads.download({
		url,
		filename: `tts-download.${fileExtMap[encoding as keyof typeof fileExtMap]}`,
	});

	return Promise.resolve(true);
}

export async function downloadShortcut(): Promise<void> {
	console.log("Handling download shortcut...", ...arguments);

	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const result = await chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: retrieveSelection,
	});
	const rawText = result[0].result;
	const text = sanitizeTextForSSML(rawText || "");

	download({ text });
}
