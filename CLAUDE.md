# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Azure Speech for Chrome is a Chrome extension that converts text to speech using Azure Cognitive Services. It supports
140+ languages and 400+ voices with multilingual interface support. The project includes both the extension and a
marketing website.

## Build System

This project uses **Bun** as the package manager and runtime. The build system is custom-built using
`scripts/bun.config.js` with esbuild under the hood.

### Common Commands

```bash
# Install dependencies
bun install

# Build extension and website (runs validation first)
bun run build

# Development mode with file watching
bun run dev

# Type checking
bun run typecheck

# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run tests with UI
bun run test:ui

# Linting
bun run lint

# Validate translation files
bun run validate-translations

# Generate extension icons
bun run generate-icons

# Bump version number
bun run bump-version
```

### Running Individual Tests

```bash
# Run a specific test file
bun test tests/helpers/text-helpers.test.ts

# Run tests matching a pattern
bun test --grep "translation"
```

## Extension Architecture

This is a Manifest V3 Chrome extension with a service worker architecture.

### Core Components

1. **Service Worker** (`src/service-worker.ts`):
    - Entry point that imports bootstrap and listener registration
    - Runs in the background to handle extension lifecycle

2. **Bootstrap** (`src/background/bootstrap.ts`):
    - Initializes the extension on startup
    - Runs storage migration, fetches voices, sets defaults, creates context menus

3. **Handlers** (`src/background/handlers/`):
    - `read-aloud.ts`: Text-to-speech playback handlers for different speeds (1x, 1.5x, 2x)
    - `synthesis.ts`: Core Azure TTS synthesis logic
    - `voices.ts`: Fetches available voices from Azure
    - `download.ts`: Audio file download handlers

4. **Listeners** (`src/background/listeners/`):
    - `messages.ts`: Chrome runtime message handling
    - `commands.ts`: Keyboard shortcut handlers
    - `context-menu.ts`: Right-click context menu handlers
    - `storage.ts`: Chrome storage change listeners
    - `runtime.ts`: Extension install/update lifecycle

5. **Offscreen Document** (`src/offscreen.ts`):
    - Required for audio playback in Manifest V3
    - Handles play/stop commands via message passing
    - Uses Audio element for playback

6. **Content Script** (`src/content-script.tsx`):
    - Injected into all web pages
    - Handles text selection and messaging with background

7. **Popup** (`src/popup.tsx`):
    - React-based extension popup UI
    - Settings, preferences, and voice selection

### Message Passing Architecture

The extension uses Chrome's message passing system:

- **Background ↔ Offscreen**: For audio playback (required in MV3)
- **Background ↔ Content Script**: For text selection and TTS triggers
- **Background ↔ Popup**: For settings and voice data

Key utility: `src/background/utils/messaging.ts` handles offscreen document creation and message routing.

## Localization System

Translation system in `src/localization/`:

- YAML files for each locale: `en.yaml`, `zh-CN.yaml`, `zh-TW.yaml`, `hi.yaml`
- `translation.ts`: React hook-based translation system with global state
- Uses `useTranslation()` hook in components
- Translation validation script ensures consistency across locales
- Format: nested keys with `{{variable}}` interpolation

## Build Process Details

The custom build system (`scripts/bun.config.js`):

1. **Validates translations** before building
2. **Generates icons** from source
3. **Compiles TypeScript/TSX** with Babel and React Compiler
    - Uses `babel-plugin-react-compiler` with annotation mode
    - Supports JSX automatic runtime
4. **Processes Tailwind CSS** via PostCSS
5. **Loads YAML** files as JS modules
6. **Copies assets** (HTML, images) to dist/
7. **Updates manifest.json** with version from package.json
8. **Creates packages**: ZIP and CRX (if key.pem exists)

Build outputs:

- `dist/`: Unpacked extension for development
- `builds/`: Versioned ZIP and CRX packages

## Testing

- **Framework**: Vitest with happy-dom environment
- **Setup**: `tests/setup.ts` configures global test utilities
- **Coverage thresholds**: 60% for lines, functions, branches, statements
- **Path alias**: `@/` maps to `src/`

The test suite includes coverage for:

- Components (buttons, inputs)
- Helpers (text processing, file handling)
- Hooks (debounce, storage)
- Localization system

## Type System

- `src/types/global.d.ts`: Global type declarations
- `src/types/index.ts`: Shared type definitions
- `src/types/yaml.d.ts`: YAML module declarations
- TypeScript config uses `strict: false` but enforces consistent casing

## Chrome Storage

The extension uses both:

- **chrome.storage.sync**: User settings (API key, region, voice preferences)
- **chrome.storage.local**: Cached data (voice lists)

Storage utilities in `src/background/utils/storage.ts` handle migration and defaults.

## Azure Speech Services Integration

The extension integrates with Azure Cognitive Services Speech SDK:

- SDK imported from `microsoft-cognitiveservices-speech-sdk`
- Synthesis happens in background handlers
- Requires user-provided subscription key and region
- Supports SSML for advanced speech control

## Text Processing

Text helpers (`src/helpers/text-helpers.ts`):

- HTML sanitization using `sanitize-html`
- Entity decoding with `he` library
- NLP processing with `wink-nlp` for sentence breaking
- Fuzzy search with `fuse.js` for voice filtering

## Pre-commit Hooks

The project uses Husky and lint-staged:

- Runs Prettier on staged files
- Runs ESLint with auto-fix
- Configured in `package.json` under `lint-staged`

## Git and Commit Guidelines

- **Do NOT add "Co-Authored-By: Claude" or similar attributions** to commit messages
- **Do NOT add "Generated by" or AI attribution messages** to pull request descriptions or commits
- Keep commit messages clean and focused on the actual changes

## Important Notes

- **Never modify Chrome storage config directly** - use migration system in `storage.ts`
- **Always validate translations** after adding new keys - run `bun run validate-translations`
- **React Compiler is in annotation mode** - only components with `"use memo"` directive are compiled
- **Offscreen document is critical** - MV3 service workers cannot use Audio API directly
- **TypeScript path alias** `@/` is configured in both tsconfig and build system
