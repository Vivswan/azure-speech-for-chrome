/**
 * Validation utilities for user input across the extension
 */

/**
 * Azure regions that are valid for Speech Services
 * Source: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/regions
 */
export const VALID_AZURE_REGIONS = [
	"eastus",
	"eastus2",
	"westus",
	"westus2",
	"westus3",
	"centralus",
	"northcentralus",
	"southcentralus",
	"westcentralus",
	"canadacentral",
	"brazilsouth",
	"eastasia",
	"southeastasia",
	"australiaeast",
	"centralindia",
	"japaneast",
	"japanwest",
	"koreacentral",
	"northeurope",
	"westeurope",
	"francecentral",
	"germanywestcentral",
	"norwayeast",
	"swedencentral",
	"switzerlandnorth",
	"switzerlandwest",
	"uksouth",
	"uaenorth",
	"southafricanorth",
];

/**
 * Azure Speech Service text-to-speech limits
 */
export const AZURE_TTS_LIMITS = {
	MAX_TEXT_LENGTH: 10000, // Maximum characters in a single request
	MAX_SSML_LENGTH: 10000, // Maximum characters in SSML request
	MIN_SPEED: 0.5,
	MAX_SPEED: 3.0,
	MIN_PITCH: -10,
	MAX_PITCH: 10,
	MIN_VOLUME: -16,
	MAX_VOLUME: 16,
};

/**
 * Validation result interface
 */
export interface ValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Validates an Azure subscription key format
 * Azure subscription keys are typically 32-character hexadecimal strings
 */
export function validateSubscriptionKey(key: string | null | undefined): ValidationResult {
	if (!key || key.trim() === "") {
		return { valid: false, error: "Subscription key is required" };
	}

	const trimmedKey = key.trim();

	// Azure subscription keys are typically 32-character alphanumeric strings
	if (trimmedKey.length !== 32) {
		return { valid: false, error: "Subscription key must be 32 characters" };
	}

	// Check if it's alphanumeric (hexadecimal)
	if (!/^[a-fA-F0-9]{32}$/.test(trimmedKey)) {
		return { valid: false, error: "Subscription key must be a valid hexadecimal string" };
	}

	return { valid: true };
}

/**
 * Validates an Azure region
 */
export function validateRegion(region: string | null | undefined): ValidationResult {
	if (!region || region.trim() === "") {
		return { valid: false, error: "Region is required" };
	}

	const trimmedRegion = region.trim().toLowerCase();

	if (!VALID_AZURE_REGIONS.includes(trimmedRegion)) {
		return {
			valid: false,
			error: `Invalid region. Must be one of: ${VALID_AZURE_REGIONS.join(", ")}`,
		};
	}

	return { valid: true };
}

/**
 * Validates text input for TTS synthesis
 */
export function validateTextForSynthesis(text: string | null | undefined): ValidationResult {
	if (!text || text.trim() === "") {
		return { valid: false, error: "Text is required" };
	}

	const trimmedText = text.trim();

	// Check if text is SSML
	const isSSML = trimmedText.startsWith("<speak>") && trimmedText.endsWith("</speak>");

	const maxLength = isSSML ? AZURE_TTS_LIMITS.MAX_SSML_LENGTH : AZURE_TTS_LIMITS.MAX_TEXT_LENGTH;

	if (trimmedText.length > maxLength) {
		return {
			valid: false,
			error: `Text exceeds maximum length of ${maxLength} characters`,
		};
	}

	// Basic SSML validation if it looks like SSML
	if (isSSML) {
		const validationResult = validateSSML(trimmedText);
		if (!validationResult.valid) {
			return validationResult;
		}
	}

	return { valid: true };
}

/**
 * Validates SSML structure (basic validation)
 */
export function validateSSML(ssml: string): ValidationResult {
	if (!ssml || ssml.trim() === "") {
		return { valid: false, error: "SSML is required" };
	}

	const trimmed = ssml.trim();

	// Must start with <speak> and end with </speak>
	if (!trimmed.startsWith("<speak>") || !trimmed.endsWith("</speak>")) {
		return { valid: false, error: "SSML must be wrapped in <speak> tags" };
	}

	// Check for balanced tags (simplified check)
	const openTags = trimmed.match(/<[^/][^>]*>/g) || [];
	const closeTags = trimmed.match(/<\/[^>]+>/g) || [];

	// This is a simplified check - in reality SSML validation is complex
	// For production, consider using an XML parser
	if (openTags.length !== closeTags.length) {
		return { valid: false, error: "SSML tags are not balanced" };
	}

	return { valid: true };
}

/**
 * Validates numeric values are within range
 */
export function validateNumber(
	value: number | null | undefined,
	min: number,
	max: number,
	name: string = "Value"
): ValidationResult {
	if (value === null || value === undefined || isNaN(value)) {
		return { valid: false, error: `${name} is required and must be a number` };
	}

	if (value < min || value > max) {
		return { valid: false, error: `${name} must be between ${min} and ${max}` };
	}

	return { valid: true };
}

/**
 * Validates speed parameter for TTS
 */
export function validateSpeed(speed: number | null | undefined): ValidationResult {
	return validateNumber(speed, AZURE_TTS_LIMITS.MIN_SPEED, AZURE_TTS_LIMITS.MAX_SPEED, "Speed");
}

/**
 * Validates pitch parameter for TTS
 */
export function validatePitch(pitch: number | null | undefined): ValidationResult {
	return validateNumber(pitch, AZURE_TTS_LIMITS.MIN_PITCH, AZURE_TTS_LIMITS.MAX_PITCH, "Pitch");
}

/**
 * Validates volume parameter for TTS
 */
export function validateVolume(volume: number | null | undefined): ValidationResult {
	return validateNumber(volume, AZURE_TTS_LIMITS.MIN_VOLUME, AZURE_TTS_LIMITS.MAX_VOLUME, "Volume");
}

/**
 * Validates that a value is in a list of allowed values
 */
export function validateEnum<T>(value: T, allowedValues: T[], name: string = "Value"): ValidationResult {
	if (!allowedValues.includes(value)) {
		return {
			valid: false,
			error: `${name} must be one of: ${allowedValues.join(", ")}`,
		};
	}

	return { valid: true };
}

/**
 * Validates message payload structure
 */
export function validateMessagePayload(payload: unknown): ValidationResult {
	if (!payload) {
		return { valid: false, error: "Payload is required" };
	}

	if (typeof payload !== "object" || Array.isArray(payload)) {
		return { valid: false, error: "Payload must be an object" };
	}

	return { valid: true };
}

/**
 * Sanitizes user input by trimming whitespace and limiting length
 */
export function sanitizeInput(input: string, maxLength: number = 10000): string {
	if (!input) return "";
	return input.trim().slice(0, maxLength);
}
