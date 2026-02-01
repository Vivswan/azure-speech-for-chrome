import { describe, it, expect } from "vitest";
import { sanitizeTextForSSML } from "@/helpers/text-helpers";
// Importing the module registers String prototype extensions
import "@/helpers/text-helpers";

describe("text-helpers", () => {
	describe("String.prototype.isSSML", () => {
		it("should return true for valid SSML text", () => {
			const ssml = "<speak>Hello world</speak>";
			expect(ssml.isSSML()).toBe(true);
		});

		it("should return true for SSML with whitespace", () => {
			const ssml = "  <speak>Hello world</speak>  ";
			expect(ssml.isSSML()).toBe(true);
		});

		it("should return false for plain text", () => {
			const text = "Hello world";
			expect(text.isSSML()).toBe(false);
		});

		it("should return false for HTML", () => {
			const html = "<div>Hello world</div>";
			expect(html.isSSML()).toBe(false);
		});

		it("should return false for partial SSML", () => {
			const partial = "<speak>Hello world";
			expect(partial.isSSML()).toBe(false);
		});

		it("should return false for empty string", () => {
			expect("".isSSML()).toBe(false);
		});
	});

	describe("String.prototype.chunk", () => {
		it("should chunk plain text by sentences", () => {
			const text = "First sentence. Second sentence. Third sentence.";
			const chunks = text.chunk();

			// wink-nlp is mocked to return single chunk in tests
			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toContain("First sentence");
		});

		it("should return single chunk for short text", () => {
			const text = "Short text without period";
			const chunks = text.chunk();

			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toBe(text);
		});

		it("should delegate to chunkSSML for SSML text", () => {
			const ssml = "<speak>Hello world</speak>";
			const chunks = ssml.chunk();

			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toBe(ssml);
		});

		it("should handle empty string", () => {
			const chunks = "".chunk();
			expect(chunks).toHaveLength(1);
		});

		it("should handle multiple sentences without extra splitting", () => {
			const text = "One. Two. Three. Four.";
			const chunks = text.chunk();

			expect(chunks.length).toBeGreaterThan(0);
			expect(chunks.every((chunk) => typeof chunk === "string")).toBe(true);
		});
	});

	describe("String.prototype.chunkSSML", () => {
		it("should return single chunk for short SSML", () => {
			const ssml = "<speak>Hello world</speak>";
			const chunks = ssml.chunkSSML();

			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toBe(ssml);
		});

		it("should preserve speak tags in chunks", () => {
			const ssml = '<speak><voice name="en-US-JennyNeural">Test</voice></speak>';
			const chunks = ssml.chunkSSML();

			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toContain("<speak>");
			expect(chunks[0]).toContain("</speak>");
		});

		it("should split very long SSML into multiple chunks", () => {
			const longContent = "a".repeat(6000);
			const ssml = `<speak>${longContent}</speak>`;
			const chunks = ssml.chunkSSML();

			expect(chunks.length).toBeGreaterThan(1);
			chunks.forEach((chunk) => {
				expect(chunk).toContain("<speak>");
				expect(chunk).toContain("</speak>");
				// Each chunk includes the speak tags, so total length can be slightly over 5000
				expect(chunk.length).toBeLessThanOrEqual(6015);
			});
		});

		it("should preserve XML tags when chunking", () => {
			const content = '<voice name="test">Content</voice>'.repeat(200);
			const ssml = `<speak>${content}</speak>`;
			const chunks = ssml.chunkSSML();

			chunks.forEach((chunk) => {
				expect(chunk).toContain("<speak>");
				expect(chunk).toContain("</speak>");
			});
		});

		it("should handle SSML with nested tags", () => {
			const ssml = '<speak><voice name="en-US-JennyNeural"><prosody rate="1.0">Hello</prosody></voice></speak>';
			const chunks = ssml.chunkSSML();

			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toBe(ssml);
		});
	});

	describe("sanitizeTextForSSML", () => {
		it("should return empty string for empty input", () => {
			expect(sanitizeTextForSSML("")).toBe("");
		});

		it("should return SSML as-is if already valid", () => {
			const ssml = "<speak>Hello world</speak>";
			expect(sanitizeTextForSSML(ssml)).toBe(ssml);
		});

		it("should remove HTML tags", () => {
			const html = "<div>Hello <strong>world</strong></div>";
			const result = sanitizeTextForSSML(html);

			expect(result).not.toContain("<div>");
			expect(result).not.toContain("<strong>");
			expect(result).toContain("Hello");
			expect(result).toContain("world");
		});

		it("should escape XML special characters", () => {
			const text = "Test & < > \" ' symbols";
			const result = sanitizeTextForSSML(text);

			expect(result).toContain("&#x26;"); // &
			expect(result).toContain("&#x3C;"); // <
			expect(result).toContain("&#x3E;"); // >
			expect(result).toContain("&#x22;"); // "
			expect(result).toContain("&#x27;"); // '
		});

		it("should decode HTML entities before escaping", () => {
			const text = "&lt;div&gt;Test&lt;/div&gt;";
			const result = sanitizeTextForSSML(text);

			// Should decode &lt; to <, then escape < to &#x3C;
			expect(result).toContain("&#x3C;");
			expect(result).toContain("&#x3E;");
			expect(result).not.toContain("&lt;");
			expect(result).not.toContain("&gt;");
		});

		it("should normalize whitespace", () => {
			const text = "Hello    world\n\n\nwith   spaces";
			const result = sanitizeTextForSSML(text);

			expect(result).not.toContain("    ");
			expect(result).not.toContain("\n\n\n");
			expect(result).toContain("Hello world");
		});

		it("should trim leading and trailing whitespace", () => {
			const text = "   Hello world   ";
			const result = sanitizeTextForSSML(text);

			expect(result).toBe("Hello world");
		});

		it("should handle mixed HTML entities and special characters", () => {
			const text = "&amp; and & both present";
			const result = sanitizeTextForSSML(text);

			// &amp; decodes to & (1), and there's another & (1) = 2 ampersands total
			expect(result.split("&#x26;").length - 1).toBe(2);
		});

		it("should strip script tags and content", () => {
			const malicious = '<script>alert("xss")</script>Hello';
			const result = sanitizeTextForSSML(malicious);

			expect(result).not.toContain("script");
			expect(result).not.toContain("alert");
			expect(result).toContain("Hello");
		});

		it("should handle complex HTML structure", () => {
			const html = `
        <html>
          <body>
            <h1>Title</h1>
            <p>Paragraph with <a href="#">link</a></p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </body>
        </html>
      `;
			const result = sanitizeTextForSSML(html);

			expect(result).not.toContain("<");
			expect(result).not.toContain(">");
			expect(result).toContain("Title");
			expect(result).toContain("Paragraph");
			expect(result).toContain("link");
			expect(result).toContain("Item 1");
			expect(result).toContain("Item 2");
		});
	});
});
