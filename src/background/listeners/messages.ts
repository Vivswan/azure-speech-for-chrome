// Chrome runtime messages listener
import { handlers } from "../handlers";
import { validateMessagePayload } from "../../helpers/validation-helpers";

export function registerMessagesListener(): void {
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		console.log("Handling message...", ...arguments);

		// Validate request structure
		if (!request || typeof request !== "object") {
			console.error("Invalid message request: not an object");
			sendResponse({ error: "Invalid request format" });
			return true;
		}

		const { id, payload } = request;

		// Validate message ID
		if (!id || typeof id !== "string") {
			console.error("Invalid message ID");
			sendResponse({ error: "Message ID is required and must be a string" });
			return true;
		}

		// Check if handler exists
		if (!handlers[id]) {
			console.error(`No handler found for ${id}`);
			sendResponse({ error: `No handler found for ${id}` });
			return true;
		}

		// Validate payload if present (some handlers may not need payload)
		if (payload !== undefined && payload !== null) {
			const payloadValidation = validateMessagePayload(payload);
			if (!payloadValidation.valid) {
				console.error("Invalid message payload:", payloadValidation.error);
				sendResponse({ error: payloadValidation.error });
				return true;
			}
		}

		// Execute handler with error handling
		handlers[id](payload)
			.then(sendResponse)
			.catch((error) => {
				console.error(`Error in handler ${id}:`, error);
				sendResponse({ error: String(error) });
			});

		return true;
	});
}
