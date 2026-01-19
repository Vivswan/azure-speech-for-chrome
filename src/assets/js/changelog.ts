// Changelog functionality
console.log('Azure Speech for Chrome changelog loaded')

// Types
interface Change {
  type: 'feature' | 'improvement' | 'fix' | 'security' | 'breaking'
  title: string
  description: string
  details?: string[]
}

interface Version {
  version: string
  type: 'major' | 'minor' | 'patch'
  title: string
  changes: Change[]
}

// Changelog data
const versions: Version[] = [
  {
    version: '1.0.0',
    type: 'major',
    title: '🎉 Initial Release',
    changes: [
      {
        type: 'feature',
        title: 'Azure Speech Services Integration',
        description: 'High-quality text-to-speech using Microsoft Azure Speech Services',
        details: [
          'Access to 400+ neural voices across 140+ languages',
          'Natural-sounding speech synthesis',
          'Customizable speed, pitch, and volume controls',
          'SSML markup support for advanced speech control'
        ]
      },
      {
        type: 'feature',
        title: 'Multi-Language Interface',
        description: 'Extension interface available in multiple languages',
        details: [
          'English, Chinese (Simplified/Traditional), and Hindi support',
          'Dynamic language switching in all UI components',
          'Localized help documentation and settings'
        ]
      },
      {
        type: 'feature',
        title: 'Multiple Speed Options',
        description: 'Context menu with different playback speeds',
        details: [
          'Read Aloud (1x) - Normal speed playback',
          'Read Aloud (1.5x) - 1.5x speed playback',
          'Read Aloud (2x) - 2x speed playback',
          'Speed options temporarily override global settings'
        ]
      },
      {
        type: 'feature',
        title: 'Context Menu Integration',
        description: 'Easy text-to-speech from any webpage',
        details: [
          'Right-click selected text to read aloud',
          'Download audio as MP3 files',
          'Works with any text content on the web'
        ]
      },
      {
        type: 'feature',
        title: 'Keyboard Shortcuts',
        description: 'Quick access via customizable hotkeys',
        details: [
          'Ctrl+Shift+S (Cmd+Shift+S on Mac) for read aloud',
          'Ctrl+Shift+E (Cmd+Shift+E on Mac) for download',
          'Configurable shortcuts in extension settings'
        ]
      },
      {
        type: 'feature',
        title: 'Smart Text Processing',
        description: 'Comprehensive text processing for safe speech synthesis',
        details: [
          'Automatically removes HTML tags while preserving content',
          'Safely escapes XML special characters',
          'Preserves valid SSML markup for advanced users'
        ]
      },
      {
        type: 'feature',
        title: 'Audio Format Options',
        description: 'Multiple audio formats for different needs',
        details: [
          'OGG Opus for efficient streaming playback',
          'MP3 for downloads and compatibility',
          'Configurable quality settings'
        ]
      },
      {
        type: 'feature',
        title: 'Secure Credential Management',
        description: 'Safe storage of Azure credentials',
        details: [
          'Local storage of subscription key',
          'Credential validation with helpful error messages',
          'Support for all Azure Speech regions'
        ]
      }
    ]
  }
]

// Helper functions
function getTypeColor(type: string): string {
  switch (type) {
    case 'major':
      return 'bg-green-500 text-white'
    case 'minor':
      return 'bg-blue-500 text-white'
    case 'patch':
      return 'bg-amber-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

function getTypeStyle(type: string): string {
  switch (type) {
    case 'major':
      return 'background-color: #10b981; color: white;'
    case 'minor':
      return 'background-color: #3b82f6; color: white;'
    case 'patch':
      return 'background-color: #f59e0b; color: white;'
    default:
      return 'background-color: #6b7280; color: white;'
  }
}

function getChangeIcon(type: string): string {
  switch (type) {
    case 'feature':
      return '✨'
    case 'improvement':
      return '🔧'
    case 'fix':
      return '🐛'
    case 'security':
      return '🛡️'
    case 'breaking':
      return '⚠️'
    default:
      return '📝'
  }
}

function getChangeColor(type: string): string {
  switch (type) {
    case 'feature':
      return 'border-green-400 bg-green-50'
    case 'improvement':
      return 'border-blue-400 bg-blue-50'
    case 'fix':
      return 'border-red-400 bg-red-50'
    case 'security':
      return 'border-indigo-400 bg-indigo-50'
    case 'breaking':
      return 'border-orange-400 bg-orange-50'
    default:
      return 'border-gray-400 bg-gray-50'
  }
}

function getChangeStyle(type: string): string {
  switch (type) {
    case 'feature':
      return 'border-left-color: #4ade80; background-color: #f0fdf4;'
    case 'improvement':
      return 'border-left-color: #60a5fa; background-color: #eff6ff;'
    case 'fix':
      return 'border-left-color: #f87171; background-color: #fef2f2;'
    case 'security':
      return 'border-left-color: #818cf8; background-color: #eef2ff;'
    case 'breaking':
      return 'border-left-color: #fb923c; background-color: #fff7ed;'
    default:
      return 'border-left-color: #9ca3af; background-color: #f9fafb;'
  }
}

// DOM manipulation functions
function createChangeItem(change: Change): HTMLElement {
  const changeDiv = document.createElement('div')
  changeDiv.className = `border-l-4 p-4 ${getChangeColor(change.type)}`
  changeDiv.style.cssText = getChangeStyle(change.type)

  const title = document.createElement('h4')
  title.className = 'font-semibold text-gray-800 mb-2'
  title.textContent = `${getChangeIcon(change.type)} ${change.title}`

  const description = document.createElement('p')
  description.className = 'text-gray-700 mb-2'
  description.textContent = change.description

  changeDiv.appendChild(title)
  changeDiv.appendChild(description)

  if (change.details && change.details.length > 0) {
    const detailsList = document.createElement('ul')
    detailsList.className = 'list-disc list-inside text-gray-600 space-y-1 text-sm'

    change.details.forEach(detail => {
      const listItem = document.createElement('li')
      listItem.textContent = detail
      detailsList.appendChild(listItem)
    })

    changeDiv.appendChild(detailsList)
  }

  return changeDiv
}

function createVersionElement(version: Version): HTMLElement {
  const versionDiv = document.createElement('div')
  versionDiv.className = 'bg-white rounded-lg shadow-sm border p-6'

  // Version header
  const header = document.createElement('div')
  header.className = 'flex items-center gap-3 mb-4'

  const versionBadge = document.createElement('span')
  versionBadge.className = `px-3 py-1 rounded-full text-sm font-bold ${getTypeColor(version.type)}`
  versionBadge.style.cssText = getTypeStyle(version.type)
  versionBadge.textContent = `v${version.version}`

  header.appendChild(versionBadge)

  // Version title
  const title = document.createElement('h2')
  title.className = 'text-2xl font-bold text-gray-800 mb-4'
  title.textContent = version.title

  // Changes container
  const changesContainer = document.createElement('div')
  changesContainer.className = 'space-y-4'

  version.changes.forEach(change => {
    const changeElement = createChangeItem(change)
    changesContainer.appendChild(changeElement)
  })

  versionDiv.appendChild(header)
  versionDiv.appendChild(title)
  versionDiv.appendChild(changesContainer)

  return versionDiv
}

// Initialize changelog
function initializeChangelog(): void {
  console.log('Initializing changelog...')

  const container = document.getElementById('changelog-container')
  if (!container) {
    console.error('Changelog container not found')
    return
  }

  // Clear existing content
  container.innerHTML = ''

  // Add all versions
  versions.forEach(version => {
    const versionElement = createVersionElement(version)
    container.appendChild(versionElement)
  })

  console.log(`Changelog initialized with ${versions.length} versions`)
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeChangelog)
