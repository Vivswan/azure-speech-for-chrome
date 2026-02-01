// Handlers barrel export - maintains the original handlers object structure
import { download, downloadShortcut } from "./download";
import { readAloud, readAloud1x, readAloud1_5x, readAloud2x, readAloudShortcut, stopReading } from "./read-aloud";
import { getAudioUri, synthesize } from "./synthesis";
import { fetchVoices } from "./voices";

// Export handlers object with all methods properly mapped
// This maintains backward compatibility with the original structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handlers: any = {
	readAloud1x,
	readAloud1_5x,
	readAloud2x,
	readAloud,
	readAloudShortcut,
	stopReading,
	download,
	downloadShortcut,
	synthesize,
	getAudioUri,
	fetchVoices,
};
