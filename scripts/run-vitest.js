#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const vitestPath = path.join(rootDir, "node_modules", "vitest", "vitest.mjs");
const args = process.argv.slice(2);

const child = spawn(process.execPath, [vitestPath, ...args], {
	cwd: rootDir,
	stdio: ["inherit", "pipe", "pipe"],
});

child.stdout.on("data", (chunk) => {
	process.stdout.write(chunk);
});

let pendingStderr = "";

const flushStderr = (buffer, final = false) => {
	const lines = buffer.split(/\r?\n/u);
	const completeLines = final ? lines : lines.slice(0, -1);

	for (const line of completeLines) {
		if (line.includes("`--localstorage-file` was provided without a valid path")) continue;
		if (line.includes("Use `node --trace-warnings ...` to show where the warning was created")) continue;
		process.stderr.write(`${line}\n`);
	}

	return final ? "" : (lines.at(-1) ?? "");
};

child.stderr.on("data", (chunk) => {
	pendingStderr += chunk.toString();
	pendingStderr = flushStderr(pendingStderr);
});

child.stderr.on("end", () => {
	pendingStderr = flushStderr(pendingStderr, true);
});

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}

	process.exit(code ?? 1);
});
