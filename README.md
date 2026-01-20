# Azure Speech For Chrome

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/dkkdafmbplibmfajcdlfpicngpnkaloc.svg)](https://chromewebstore.google.com/detail/dkkdafmbplibmfajcdlfpicngpnkaloc)
[![GitHub Pages](https://img.shields.io/badge/website-azure--speech--for--chrome-blue)](https://vivswan.github.io/azure-speech-for-chrome/)
[![GitHub](https://img.shields.io/github/license/vivswan/azure-speech-for-chrome)](LICENSE)

A premium Chrome extension that transforms any text on the web into high-quality, natural-sounding speech using Azure
Speech Services' advanced AI voices. Support for 140+ languages and 400+ professional voices with multilingual interface
support.

**[Visit Website](https://vivswan.github.io/azure-speech-for-chrome/)** |
**[Chrome Web Store](https://chromewebstore.google.com/detail/dkkdafmbplibmfajcdlfpicngpnkaloc)**

## Key Features

* **140+ Languages & 400+ Voices** - Choose from Neural voice engines with natural-sounding AI voices
* **Multi-Language Interface** - Available in English, Chinese (Simplified & Traditional), and Hindi
* **Multiple Speed Options** - Context menu with 1x, 1.5x, and 2x playback speeds
* **Smart Text Processing** - Automatically sanitizes HTML content using sanitize-html library
* **Keyboard Shortcuts** - Quick access with Ctrl+Shift+S (read aloud) and Ctrl+Shift+E (download)
* **Audio Downloads** - Save as high-quality MP3 files for offline use
* **SSML Support** - Advanced markup for precise speech control
* **Secure & Private** - Your Azure credentials stay local and private

## Quick Start

1. **Install Extension**: Add
   from [Chrome Web Store](https://chromewebstore.google.com/detail/dkkdafmbplibmfajcdlfpicngpnkaloc)
2. **Setup Azure**: Create Azure account and configure Speech Services
   ([detailed guide](https://vivswan.github.io/azure-speech-for-chrome/#install))
3. **Start Converting**: Highlight any text, right-click, and choose your preferred speed

## Pricing

- **Extension**: Completely FREE
- **Azure Free Tier**: 500,000 characters per month free for neural voices
- **Neural voices**: $16 per million characters

[View detailed pricing →](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/)

## Azure Setup

### Quick Setup

1. Create an Azure account at [azure.microsoft.com](https://azure.microsoft.com)
2. Go to Azure Portal and create a Speech Services resource
3. Copy your subscription key from "Keys and Endpoint"
4. Enter the subscription key and region in the extension settings

For detailed setup instructions with screenshots, visit our [help guide](https://vivswan.github.io/azure-speech-for-chrome/).

## Development

### Extension Development

```bash
npm install
npm run build
```

Load the unpacked extension from the `dist` folder.

### Website Development

```bash
npm install
npm run build
```

Website files are generated in the `public` folder.

### Available Scripts

- `npm run build` - Build Chrome extension and website
- `npm run dev` - Development mode with file watching
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run validate-translations` - Validate translation files consistency

## Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── helpers/            # Utility functions
│   ├── localization/       # Translation files and system
│   │   ├── en.yaml         # English translations
│   │   ├── zh-CN.yaml      # Chinese Simplified translations
│   │   ├── zh-TW.yaml      # Chinese Traditional translations
│   │   ├── hi.yaml         # Hindi translations
│   │   └── translation.ts  # Translation infrastructure
│   ├── assets/             # Images, CSS, HTML files
│   │   └── images/
│   │       └── screenshots/ # Website screenshots
│   ├── index.ts           # Website homepage
│   ├── popup.tsx           # Extension popup
│   ├── help.tsx            # Help page
│   └── changelog.tsx       # Changelog page
├── dist/                   # Built extension files
├── scripts/                # Build scripts
└── .github/workflows/      # GitHub Actions
```

## Website

The project includes a marketing website built with React and Tailwind CSS:

- **URL**: [https://vivswan.github.io/azure-speech-for-chrome/](https://vivswan.github.io/azure-speech-for-chrome/)
- **Auto-deployed** via GitHub Actions on every push to main
- **Build command**: `npm run build`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to
discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is based on [Wavenet for Chrome](https://github.com/pgmichael/wavenet-for-chrome) and licensed under
the [MIT License](LICENSE).

## Links

- **Website**: [https://vivswan.github.io/azure-speech-for-chrome/](https://vivswan.github.io/azure-speech-for-chrome/)
- **Chrome Web Store**: [Install Extension](https://chromewebstore.google.com/detail/dkkdafmbplibmfajcdlfpicngpnkaloc)
- **Issues**: [Report Bugs](https://github.com/vivswan/azure-speech-for-chrome/issues)
- **Azure Speech Docs**: [Documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/)

---

**Star this repository if you find it helpful!**
