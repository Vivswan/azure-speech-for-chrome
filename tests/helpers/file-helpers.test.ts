import { describe, it, expect } from "vitest";
import { fileExtMap } from "@/helpers/file-helpers";

describe("file-helpers", () => {
	describe("fileExtMap", () => {
		it("should map MP3 to mp3 extension", () => {
			expect(fileExtMap.MP3).toBe("mp3");
		});

		it("should map MP3_64_KBPS to mp3 extension", () => {
			expect(fileExtMap.MP3_64_KBPS).toBe("mp3");
		});

		it("should map OGG_OPUS to ogg extension", () => {
			expect(fileExtMap.OGG_OPUS).toBe("ogg");
		});

		it("should have exactly 3 mappings", () => {
			const keys = Object.keys(fileExtMap);
			expect(keys).toHaveLength(3);
		});

		it("should only contain valid audio extensions", () => {
			const values = Object.values(fileExtMap);
			const validExtensions = ["mp3", "ogg"];

			values.forEach((ext) => {
				expect(validExtensions).toContain(ext);
			});
		});

		it("should have consistent MP3 mappings", () => {
			expect(fileExtMap.MP3).toBe(fileExtMap.MP3_64_KBPS);
		});
	});
});
