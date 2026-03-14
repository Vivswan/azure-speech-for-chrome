// Local variables -------------------------------------------------------------
let audioElement = new Audio();
let shouldPlay = false;

interface PlayRequest {
	id: "play";
	payload: { audioUri: string };
	offscreen: true;
}

interface StopRequest {
	id: "stop";
	offscreen: true;
}

type OffscreenRequest = PlayRequest | StopRequest;

// Event listeners -------------------------------------------------------------
chrome.runtime.onMessage.addListener((request: OffscreenRequest | undefined, _sender, sendResponse) => {
	if (!request) return;

	if (!request.offscreen) return;

	const action = request.id === "play" ? handlers.play(request.payload) : handlers.stop();
	action.then(sendResponse);

	return true;
});

// Handlers --------------------------------------------------------------------
const handlers = {
	play: function ({ audioUri }: { audioUri: string }): Promise<string> {
		return new Promise((resolve, reject) => {
			if (!audioUri) reject("No audioUri provided");

			console.log("Attempting to play audio URI:", audioUri.substring(0, 100) + "...");
			console.log("Audio URI length:", audioUri.length);

			shouldPlay = true;

			audioElement.src = audioUri;
			audioElement.onloadedmetadata = function () {
				console.log("Audio metadata loaded successfully");
				if (!shouldPlay) {
					resolve("Playback was stopped before audio could start");
					return;
				}

				audioElement
					.play()
					.then(() => console.log("Audio playback started"))
					.catch((e) => {
						console.error("Play error:", e);
						reject("Error while trying to play audio: " + e);
					});
			};

			audioElement.onerror = function (e) {
				console.error("Audio element error:", e);
				console.error("Audio element error details:", audioElement.error);
				reject(`Error loading audio source: ${audioElement.error?.message || "Unknown error"}`);
			};

			audioElement.onended = function () {
				console.log("Audio playback ended");
				resolve(`Finished playing`);
			};
		});
	},
	stop: function (): Promise<string> {
		return new Promise((resolve) => {
			shouldPlay = false;

			if (!audioElement.paused) {
				audioElement.pause();
				audioElement.currentTime = 0;

				resolve("Stopped audio");
				return;
			}

			resolve("No audio is currently playing");
		});
	},
};
