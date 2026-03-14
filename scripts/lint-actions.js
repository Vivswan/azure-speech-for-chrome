#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const binaryName = process.platform === "win32" ? "node-actionlint.cmd" : "node-actionlint";
const actionlintPath = path.join(rootDir, "node_modules", ".bin", binaryName);
const workflowGlob = ".github/workflows/*.{yml,yaml}";

if (!fs.existsSync(actionlintPath)) {
	console.error("actionlint is not installed. Run `bun install` first.");
	process.exit(1);
}

const result = spawnSync(actionlintPath, [workflowGlob], {
	cwd: rootDir,
	stdio: "inherit",
});

if (result.error) {
	console.error(result.error.message);
	process.exit(1);
}

process.exit(result.status ?? 1);
