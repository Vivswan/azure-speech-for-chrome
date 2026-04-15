import { describe, it, expect } from "vitest";
import {
	validateSubscriptionKey,
	validateRegion,
	validateTextForSynthesis,
	validateSSML,
	validateSpeed,
	validatePitch,
	validateVolume,
	validateNumber,
	validateEnum,
	validateMessagePayload,
	sanitizeInput,
	VALID_AZURE_REGIONS,
	AZURE_TTS_LIMITS,
} from "@/helpers/validation-helpers";

describe("validation-helpers", () => {
	describe("validateSubscriptionKey", () => {
		it("should accept valid 32-character hexadecimal key", () => {
			const result = validateSubscriptionKey("abc123def456789012345678901234ab");
			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it("should accept uppercase hexadecimal key", () => {
			const result = validateSubscriptionKey("ABC123DEF456789012345678901234AB");
			expect(result.valid).toBe(true);
		});

		it("should reject empty string", () => {
			const result = validateSubscriptionKey("");
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Subscription key is required");
		});

		it("should reject null", () => {
			const result = validateSubscriptionKey(null);
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Subscription key is required");
		});

		it("should reject undefined", () => {
			const result = validateSubscriptionKey(undefined);
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Subscription key is required");
		});

		it("should reject key with wrong length", () => {
			const result = validateSubscriptionKey("abc123");
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Subscription key must be 32 characters");
		});

		it("should reject key with non-hexadecimal characters", () => {
			const result = validateSubscriptionKey("xyz123def456789012345678901234ab");
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Subscription key must be a valid hexadecimal string");
		});

		it("should trim whitespace before validation", () => {
			const result = validateSubscriptionKey("  abc123def456789012345678901234ab  ");
			expect(result.valid).toBe(true);
		});
	});

	describe("validateRegion", () => {
		it("should accept valid region", () => {
			const result = validateRegion("eastus");
			expect(result.valid).toBe(true);
		});

		it("should accept valid region regardless of case", () => {
			const result = validateRegion("EastUS");
			expect(result.valid).toBe(true);
		});

		it("should reject empty string", () => {
			const result = validateRegion("");
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Region is required");
		});

		it("should reject null", () => {
			const result = validateRegion(null);
			expect(result.valid).toBe(false);
		});

		it("should reject undefined", () => {
			const result = validateRegion(undefined);
			expect(result.valid).toBe(false);
		});

		it("should reject invalid region", () => {
			const result = validateRegion("invalid-region");
			expect(result.valid).toBe(false);
			expect(result.error).toContain("Invalid region");
		});

		it("should trim whitespace", () => {
			const result = validateRegion("  westus  ");
			expect(result.valid).toBe(true);
		});

		it("should validate all regions in VALID_AZURE_REGIONS", () => {
			VALID_AZURE_REGIONS.forEach((region) => {
				const result = validateRegion(region);
				expect(result.valid).toBe(true);
			});
		});
	});

	describe("validateTextForSynthesis", () => {
		it("should accept valid text", () => {
			const result = validateTextForSynthesis("Hello world");
			expect(result.valid).toBe(true);
		});

		it("should reject empty string", () => {
			const result = validateTextForSynthesis("");
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Text is required");
		});

		it("should reject null", () => {
			const result = validateTextForSynthesis(null);
			expect(result.valid).toBe(false);
		});

		it("should reject text exceeding max length", () => {
			const longText = "a".repeat(AZURE_TTS_LIMITS.MAX_TEXT_LENGTH + 1);
			const result = validateTextForSynthesis(longText);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("exceeds maximum length");
		});

		it("should accept text at max length", () => {
			const maxText = "a".repeat(AZURE_TTS_LIMITS.MAX_TEXT_LENGTH);
			const result = validateTextForSynthesis(maxText);
			expect(result.valid).toBe(true);
		});

		it("should validate SSML when text looks like SSML", () => {
			const result = validateTextForSynthesis("<speak>Hello world</speak>");
			expect(result.valid).toBe(true);
		});

		it("should reject invalid SSML", () => {
			const result = validateTextForSynthesis("<speak><voice>Unclosed tag</speak>");
			expect(result.valid).toBe(false);
		});

		it("should trim whitespace", () => {
			const result = validateTextForSynthesis("  Hello world  ");
			expect(result.valid).toBe(true);
		});
	});

	describe("validateSSML", () => {
		it("should accept valid SSML", () => {
			const result = validateSSML("<speak>Hello world</speak>");
			expect(result.valid).toBe(true);
		});

		it("should accept SSML with nested tags", () => {
			const result = validateSSML("<speak><voice name='test'>Hello</voice></speak>");
			expect(result.valid).toBe(true);
		});

		it("should reject SSML without speak tags", () => {
			const result = validateSSML("Hello world");
			expect(result.valid).toBe(false);
			expect(result.error).toContain("wrapped in <speak> tags");
		});

		it("should reject SSML missing opening tag", () => {
			const result = validateSSML("Hello world</speak>");
			expect(result.valid).toBe(false);
		});

		it("should reject SSML missing closing tag", () => {
			const result = validateSSML("<speak>Hello world");
			expect(result.valid).toBe(false);
		});

		it("should reject unbalanced tags", () => {
			const result = validateSSML("<speak><voice>Hello</speak>");
			expect(result.valid).toBe(false);
			expect(result.error).toContain("not balanced");
		});

		it("should reject empty string", () => {
			const result = validateSSML("");
			expect(result.valid).toBe(false);
			expect(result.error).toBe("SSML is required");
		});
	});

	describe("validateSpeed", () => {
		it("should accept valid speed", () => {
			const result = validateSpeed(1.5);
			expect(result.valid).toBe(true);
		});

		it("should accept minimum speed", () => {
			const result = validateSpeed(AZURE_TTS_LIMITS.MIN_SPEED);
			expect(result.valid).toBe(true);
		});

		it("should accept maximum speed", () => {
			const result = validateSpeed(AZURE_TTS_LIMITS.MAX_SPEED);
			expect(result.valid).toBe(true);
		});

		it("should reject speed below minimum", () => {
			const result = validateSpeed(0.1);
			expect(result.valid).toBe(false);
			expect(result.error).toContain("Speed must be between");
		});

		it("should reject speed above maximum", () => {
			const result = validateSpeed(5);
			expect(result.valid).toBe(false);
		});

		it("should reject null", () => {
			const result = validateSpeed(null);
			expect(result.valid).toBe(false);
		});

		it("should reject NaN", () => {
			const result = validateSpeed(NaN);
			expect(result.valid).toBe(false);
		});
	});

	describe("validatePitch", () => {
		it("should accept valid pitch", () => {
			const result = validatePitch(0);
			expect(result.valid).toBe(true);
		});

		it("should accept minimum pitch", () => {
			const result = validatePitch(AZURE_TTS_LIMITS.MIN_PITCH);
			expect(result.valid).toBe(true);
		});

		it("should accept maximum pitch", () => {
			const result = validatePitch(AZURE_TTS_LIMITS.MAX_PITCH);
			expect(result.valid).toBe(true);
		});

		it("should reject pitch below minimum", () => {
			const result = validatePitch(-20);
			expect(result.valid).toBe(false);
		});

		it("should reject pitch above maximum", () => {
			const result = validatePitch(20);
			expect(result.valid).toBe(false);
		});
	});

	describe("validateVolume", () => {
		it("should accept valid volume", () => {
			const result = validateVolume(0);
			expect(result.valid).toBe(true);
		});

		it("should accept minimum volume", () => {
			const result = validateVolume(AZURE_TTS_LIMITS.MIN_VOLUME);
			expect(result.valid).toBe(true);
		});

		it("should accept maximum volume", () => {
			const result = validateVolume(AZURE_TTS_LIMITS.MAX_VOLUME);
			expect(result.valid).toBe(true);
		});

		it("should reject volume below minimum", () => {
			const result = validateVolume(-20);
			expect(result.valid).toBe(false);
		});

		it("should reject volume above maximum", () => {
			const result = validateVolume(20);
			expect(result.valid).toBe(false);
		});
	});

	describe("validateNumber", () => {
		it("should accept valid number in range", () => {
			const result = validateNumber(5, 0, 10, "Test");
			expect(result.valid).toBe(true);
		});

		it("should accept minimum value", () => {
			const result = validateNumber(0, 0, 10);
			expect(result.valid).toBe(true);
		});

		it("should accept maximum value", () => {
			const result = validateNumber(10, 0, 10);
			expect(result.valid).toBe(true);
		});

		it("should reject value below minimum", () => {
			const result = validateNumber(-1, 0, 10);
			expect(result.valid).toBe(false);
		});

		it("should reject value above maximum", () => {
			const result = validateNumber(11, 0, 10);
			expect(result.valid).toBe(false);
		});

		it("should reject null", () => {
			const result = validateNumber(null, 0, 10);
			expect(result.valid).toBe(false);
		});

		it("should use custom name in error message", () => {
			const result = validateNumber(-1, 0, 10, "CustomField");
			expect(result.error).toContain("CustomField");
		});
	});

	describe("validateEnum", () => {
		it("should accept value in allowed list", () => {
			const result = validateEnum("apple", ["apple", "banana", "orange"]);
			expect(result.valid).toBe(true);
		});

		it("should reject value not in allowed list", () => {
			const result = validateEnum("grape", ["apple", "banana", "orange"]);
			expect(result.valid).toBe(false);
		});

		it("should work with numbers", () => {
			const result = validateEnum(1, [1, 2, 3]);
			expect(result.valid).toBe(true);
		});

		it("should use custom name in error message", () => {
			const result = validateEnum("grape", ["apple", "banana"], "Fruit");
			expect(result.error).toContain("Fruit");
		});
	});

	describe("validateMessagePayload", () => {
		it("should accept valid object payload", () => {
			const result = validateMessagePayload({ text: "hello" });
			expect(result.valid).toBe(true);
		});

		it("should accept empty object", () => {
			const result = validateMessagePayload({});
			expect(result.valid).toBe(true);
		});

		it("should reject null", () => {
			const result = validateMessagePayload(null);
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Payload is required");
		});

		it("should reject undefined", () => {
			const result = validateMessagePayload(undefined);
			expect(result.valid).toBe(false);
		});

		it("should reject string", () => {
			const result = validateMessagePayload("string");
			expect(result.valid).toBe(false);
			expect(result.error).toBe("Payload must be an object");
		});

		it("should reject number", () => {
			const result = validateMessagePayload(123);
			expect(result.valid).toBe(false);
		});

		it("should reject array", () => {
			const result = validateMessagePayload([1, 2, 3]);
			expect(result.valid).toBe(false);
		});
	});

	describe("sanitizeInput", () => {
		it("should trim whitespace", () => {
			const result = sanitizeInput("  hello  ");
			expect(result).toBe("hello");
		});

		it("should limit length to default max", () => {
			const longString = "a".repeat(15000);
			const result = sanitizeInput(longString);
			expect(result.length).toBe(10000);
		});

		it("should limit length to custom max", () => {
			const longString = "a".repeat(100);
			const result = sanitizeInput(longString, 50);
			expect(result.length).toBe(50);
		});

		it("should handle empty string", () => {
			const result = sanitizeInput("");
			expect(result).toBe("");
		});

		it("should handle null/undefined", () => {
			expect(sanitizeInput(null as unknown as string)).toBe("");
			expect(sanitizeInput(undefined as unknown as string)).toBe("");
		});

		it("should preserve content within limits", () => {
			const result = sanitizeInput("Hello world");
			expect(result).toBe("Hello world");
		});
	});

	describe("VALID_AZURE_REGIONS constant", () => {
		it("should contain expected regions", () => {
			expect(VALID_AZURE_REGIONS).toContain("eastus");
			expect(VALID_AZURE_REGIONS).toContain("westus");
			expect(VALID_AZURE_REGIONS).toContain("westeurope");
		});

		it("should be an array", () => {
			expect(Array.isArray(VALID_AZURE_REGIONS)).toBe(true);
		});

		it("should have at least 20 regions", () => {
			expect(VALID_AZURE_REGIONS.length).toBeGreaterThan(20);
		});
	});

	describe("AZURE_TTS_LIMITS constant", () => {
		it("should have correct max text length", () => {
			expect(AZURE_TTS_LIMITS.MAX_TEXT_LENGTH).toBe(10000);
		});

		it("should have correct speed limits", () => {
			expect(AZURE_TTS_LIMITS.MIN_SPEED).toBe(0.5);
			expect(AZURE_TTS_LIMITS.MAX_SPEED).toBe(3.0);
		});

		it("should have correct pitch limits", () => {
			expect(AZURE_TTS_LIMITS.MIN_PITCH).toBe(-10);
			expect(AZURE_TTS_LIMITS.MAX_PITCH).toBe(10);
		});

		it("should have correct volume limits", () => {
			expect(AZURE_TTS_LIMITS.MIN_VOLUME).toBe(-16);
			expect(AZURE_TTS_LIMITS.MAX_VOLUME).toBe(16);
		});
	});
});
