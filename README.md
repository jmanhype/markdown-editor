# Markdown Editor

Electron-based markdown editor with live preview, exposing editorial minimalism aesthetics to writers and developers.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/electron-28.0.0-47848F.svg)
![React](https://img.shields.io/badge/react-18.2.0-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.3-3178C6.svg)

## Overview

This application provides a distraction-free markdown editing experience with real-time preview, multiple editor modes, and extensive theming support.

**Key Features:**
- Split-pane interface with resizable CodeMirror editor and live preview
- Multi-tab document management with file system integration
- Vim and Emacs keybinding modes
- Custom theme builder with CSS variable customization
- Focus mode and distraction-free mode
- Export to HTML and PDF

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Electron Main Process                     │
│                            (main.ts)                             │
├─────────────────────────────────────────────────────────────────┤
│  File System    │    Dialog APIs    │    Window Management       │
│  (fs/path)      │    (open/save)    │    (BrowserWindow)         │
└────────┬────────┴─────────┬─────────┴───────────┬───────────────┘
         │                  │                     │
         │          IPC Bridge (preload.ts)       │
         │         contextBridge.exposeInMainWorld│
         │                  │                     │
┌────────▼──────────────────▼─────────────────────▼───────────────┐
│                      Renderer Process                            │
│                         (React App)                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌─────────────────┐   │
│  │ TabBar  │  │ Toolbar │  │ StatusBar│  │  ThemeBuilder   │   │
│  └────┬────┘  └────┬────┘  └────┬─────┘  └────────┬────────┘   │
│       │            │            │                  │            │
│  ┌────▼────────────▼────────────▼──────────────────▼────────┐  │
│  │                         App.tsx                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │                    SplitPane                         │ │  │
│  │  │  ┌─────────────────┐    ┌─────────────────────────┐ │ │  │
│  │  │  │     Editor      │    │        Preview          │ │ │  │
│  │  │  │  (CodeMirror)   │◄──►│   (Rendered Markdown)   │ │ │  │
│  │  │  └─────────────────┘    └─────────────────────────┘ │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Hooks: useTheme │ useKeybindingMode │ useMarkdown │ useCustom  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone and setup
cd markdown-editor

# Install dependencies
npm install
```

### Configuration

No configuration required for development. The app uses sensible defaults.

## Running

```bash
# Development (Vite dev server only)
npm run dev

# Development (Full Electron app with hot reload)
npm run electron:dev
```

## Building

```bash
# Build renderer (Vite)
npm run build

# Build Electron (TypeScript compilation)
npm run electron:build

# Package for distribution
npm run package
```

### Build Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Renderer | `dist/` | Vite-compiled React app |
| Electron | `dist-electron/` | Compiled main/preload |
| Package | `release/` | Distributable app |

## IPC Channels

| Channel | Direction | Description | Status |
|---------|-----------|-------------|--------|
| `file:new` | Main→Renderer | Create new document | Implemented |
| `file:open` | Main→Renderer | Open file dialog | Implemented |
| `file:save` | Renderer→Main | Save current document | Implemented |
| `file:save-as` | Renderer→Main | Save with new name | Implemented |
| `export:html` | Renderer→Main | Export as HTML file | Implemented |
| `export:pdf` | Renderer→Main | Export as PDF file | Implemented |
| `app:getTheme` | Renderer→Main | Get system theme | Implemented |
| `dialog:open` | Renderer→Main | Show open dialog | Implemented |
| `dialog:save` | Renderer→Main | Show save dialog | Implemented |

## Components

| Component | Location | Description |
|-----------|----------|-------------|
| `Editor` | `components/Editor.tsx` | CodeMirror wrapper with Vim/Emacs support |
| `Preview` | `components/Preview.tsx` | Sanitized markdown preview |
| `SplitPane` | `components/SplitPane.tsx` | Resizable split container |
| `Toolbar` | `components/Toolbar.tsx` | Action buttons and controls |
| `TabBar` | `components/TabBar.tsx` | Multi-document tab management |
| `StatusBar` | `components/StatusBar.tsx` | Word count and reading time |
| `ThemeToggle` | `components/ThemeToggle.tsx` | Light/dark theme switcher |
| `ThemeBuilder` | `components/ThemeBuilder.tsx` | Custom theme creator |

## Hooks

| Hook | Location | Description |
|------|----------|-------------|
| `useTheme` | `hooks/useTheme.ts` | Theme state + localStorage persistence |
| `useKeybindingMode` | `hooks/useKeybindingMode.ts` | Vim/Emacs/Default mode management |
| `useMarkdown` | `hooks/useMarkdown.ts` | Markdown parsing + sanitization |
| `useCustomThemes` | `hooks/useCustomThemes.ts` | Custom theme storage and application |

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New File | `Ctrl+N` | `⌘N` |
| Open File | `Ctrl+O` | `⌘O` |
| Save File | `Ctrl+S` | `⌘S` |
| Export HTML | `Ctrl+E` | `⌘E` |
| Export PDF | `Ctrl+Shift+E` | `⌘⇧E` |
| Toggle Theme | `Ctrl+Shift+T` | `⌘⇧T` |
| Focus Mode | `Ctrl+Shift+F` | `⌘⇧F` |
| Distraction-Free | `Ctrl+Shift+D` | `⌘⇧D` |

## Configuration

### Environment Variables

No environment variables required. All configuration is handled through the UI.

### localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `markdown-editor-theme` | `'light' \| 'dark'` | User's theme preference |
| `markdown-editor-keybinding-mode` | `'default' \| 'vim' \| 'emacs'` | Editor keybinding mode |
| `markdown-editor-custom-themes` | `CustomTheme[]` | Saved custom themes (JSON) |
| `markdown-editor-active-custom-theme` | `string` | Active custom theme ID |
| `markdown-editor-focus-mode` | `'true' \| 'false'` | Focus mode state |
| `markdown-editor-distraction-free-mode` | `'true' \| 'false'` | Distraction-free state |
| `split-position` | `string` | Split pane position (0-100) |

### CSS Variables

See [DOCUMENTATION.md](./DOCUMENTATION.md#theming-system) for the complete list of customizable CSS variables.

## Development

### Project Structure

```
markdown-editor/
├── src/
│   ├── main/
│   │   ├── main.ts              # Electron main process
│   │   └── preload.ts           # Context bridge (IPC)
│   │
│   └── renderer/
│       ├── components/          # React components
│       │   ├── Editor.tsx       # CodeMirror wrapper
│       │   ├── Preview.tsx      # Markdown preview
│       │   ├── SplitPane.tsx    # Resizable container
│       │   ├── Toolbar.tsx      # Action buttons
│       │   ├── TabBar.tsx       # Document tabs
│       │   ├── StatusBar.tsx    # Word count display
│       │   ├── ThemeToggle.tsx  # Theme switcher
│       │   └── ThemeBuilder.tsx # Custom themes
│       │
│       ├── hooks/               # Custom React hooks
│       │   ├── useTheme.ts
│       │   ├── useKeybindingMode.ts
│       │   ├── useMarkdown.ts
│       │   └── useCustomThemes.ts
│       │
│       ├── styles/              # CSS files
│       │   ├── variables.css    # Design tokens
│       │   ├── themes.css       # Theme definitions
│       │   └── *.css            # Component styles
│       │
│       ├── utils/
│       │   └── buildExportHtml.ts
│       │
│       ├── types/               # TypeScript declarations
│       ├── electron-api.d.ts    # IPC type definitions
│       ├── App.tsx              # Root component
│       └── main.tsx             # React entry point
│
├── dist/                        # Built renderer (Vite)
├── dist-electron/               # Built Electron code
├── release/                     # Packaged applications
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── electron-builder.json5
└── README.md
```

### Development Workflow

1. Start Vite dev server: `npm run dev`
2. In another terminal: `npm run electron:dev`
3. Make changes - hot reload applies automatically
4. Test in the running Electron app

### Adding New Features

1. **New Component**: Create in `src/renderer/components/`
2. **New Hook**: Create in `src/renderer/hooks/`
3. **New IPC Channel**: Register in `main.ts`, expose in `preload.ts`
4. **New Style**: Create CSS file, import in component

## Roadmap

- [ ] Find & Replace
- [ ] Markdown table editor
- [ ] Image paste/drag-drop
- [ ] Spell checking
- [ ] Auto-save
- [ ] Recent files menu

## References

- [DOCUMENTATION.md](./DOCUMENTATION.md) - Full API documentation
- [Electron Documentation](https://www.electronjs.org/docs)
- [CodeMirror 6](https://codemirror.net/)
- [Marked.js](https://marked.js.org/)
- [DOMPurify](https://github.com/cure53/DOMPurify)

## License

MIT
