# Markdown Editor

A clean, minimal Electron-based markdown editor with live preview, featuring an editorial minimalism aesthetic.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/electron-28.0.0-47848F.svg)
![React](https://img.shields.io/badge/react-18.2.0-61DAFB.svg)

## Features

### Core Editor
- **Split-Pane Interface**: Resizable CodeMirror editor on the left, live preview on the right
- **Live Preview**: Real-time markdown rendering with syntax highlighting
- **Multi-Tab Support**: Work on multiple documents simultaneously
- **File Operations**: Open, save, and create new files via native dialogs

### Themes & Customization
- **Dark/Light Themes**: Beautiful editorial themes with smooth transitions
  - Light: Cool grays with sage green accent
  - Dark: Warm neutrals with amber accent
- **Custom Theme Builder**: Create and save your own color schemes
- **System Preference Detection**: Automatically matches OS theme

### Editor Modes
- **Vim Mode**: Full Vim keybindings support
- **Emacs Mode**: Emacs keybindings support
- **Default Mode**: Standard editor behavior

### Focus Features
- **Focus Mode**: Hide preview pane to concentrate on writing
- **Distraction-Free Mode**: Hide toolbar for minimal interface

### Export
- **Export to HTML**: Standalone HTML files with embedded styles
- **Export to PDF**: Print-ready PDF documents

### Statistics
- **Word Count**: Real-time word count in status bar
- **Character Count**: Live character tracking
- **Reading Time**: Estimated reading time (200 WPM)

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Build for production
npm run build && npm run electron:build
```

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New File | Ctrl+N | ⌘N |
| Open File | Ctrl+O | ⌘O |
| Save File | Ctrl+S | ⌘S |
| Export HTML | Ctrl+E | ⌘E |
| Export PDF | Ctrl+Shift+E | ⌘⇧E |
| Toggle Theme | Ctrl+Shift+T | ⌘⇧T |
| Focus Mode | Ctrl+Shift+F | ⌘⇧F |
| Distraction-Free | Ctrl+Shift+D | ⌘⇧D |

## Architecture

```
src/
├── main/
│   ├── main.ts           # Electron main process
│   └── preload.ts        # Context bridge (IPC)
│
└── renderer/
    ├── components/
    │   ├── Editor.tsx        # CodeMirror wrapper
    │   ├── Preview.tsx       # Markdown preview
    │   ├── SplitPane.tsx     # Resizable split container
    │   ├── Toolbar.tsx       # Top bar with actions
    │   ├── TabBar.tsx        # Multi-document tabs
    │   ├── StatusBar.tsx     # Word count & stats
    │   ├── ThemeToggle.tsx   # Theme switcher
    │   └── ThemeBuilder.tsx  # Custom theme creator
    │
    ├── hooks/
    │   ├── useTheme.ts           # Theme state management
    │   ├── useKeybindingMode.ts  # Vim/Emacs/Default modes
    │   ├── useMarkdown.ts        # Markdown parsing
    │   └── useCustomThemes.ts    # Custom theme storage
    │
    ├── styles/
    │   ├── variables.css     # Design tokens
    │   ├── themes.css        # Light/dark themes
    │   └── *.css             # Component styles
    │
    ├── utils/
    │   └── buildExportHtml.ts  # Export HTML builder
    │
    ├── App.tsx
    └── main.tsx
```

## Documentation

For comprehensive API documentation, component references, and customization guides, see **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

Topics covered:
- IPC Channel Reference
- Component API Reference
- Custom Hooks API
- Theming System
- CSS Variables
- Storage Keys
- Development Guide

## Dependencies

**Core:**
- `react` + `react-dom` - UI framework
- `@codemirror/*` - Editor (view, state, commands, vim, emacs)
- `marked` - Markdown parser
- `dompurify` - HTML sanitization
- `highlight.js` - Syntax highlighting

**Build:**
- `vite` - Build tool + dev server
- `typescript` - Type safety
- `electron` + `electron-builder` - Desktop packaging

## Customization

### Creating Custom Themes

Use the built-in Theme Builder (paintbrush icon in toolbar) to create custom themes, or add them programmatically:

```typescript
import { useCustomThemes } from './hooks/useCustomThemes';

const { saveTheme } = useCustomThemes();

saveTheme({
  id: 'my-theme',
  name: 'My Custom Theme',
  baseTheme: 'dark',
  variables: {
    '--bg-primary': '#1a1a2e',
    '--accent-primary': '#e94560'
  }
});
```

### Changing Fonts

Update font imports in `index.html` and variables in `variables.css`:

```css
:root {
  --font-mono: 'YourMono', monospace;
  --font-serif: 'YourSerif', serif;
}
```

## Roadmap

- [ ] Find & Replace
- [ ] Markdown table editor
- [ ] Image paste/drag-drop
- [ ] Spell checking
- [ ] Auto-save
- [ ] Recent files menu

## License

MIT
