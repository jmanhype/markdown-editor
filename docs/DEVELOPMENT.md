## Development Guide

### Project Structure

```
markdown-editor/
├── src/
│   ├── main/
│   │   ├── main.ts           # Electron main process
│   │   └── preload.ts        # Preload script (context bridge)
│   │
│   └── renderer/
│       ├── components/       # React components
│       │   ├── Editor.tsx
│       │   ├── Preview.tsx
│       │   ├── Toolbar.tsx
│       │   ├── TabBar.tsx
│       │   ├── SplitPane.tsx
│       │   ├── StatusBar.tsx
│       │   ├── ThemeToggle.tsx
│       │   └── ThemeBuilder.tsx
│       │
│       ├── hooks/            # Custom React hooks
│       │   ├── useTheme.ts
│       │   ├── useKeybindingMode.ts
│       │   ├── useMarkdown.ts
│       │   └── useCustomThemes.ts
│       │
│       ├── styles/           # CSS files
│       │   ├── variables.css  # Design tokens
│       │   ├── themes.css     # Theme definitions
│       │   ├── editor.css
│       │   ├── preview.css
│       │   └── *.css          # Component styles
│       │
│       ├── utils/
│       │   └── buildExportHtml.ts
│       │
│       ├── types/            # TypeScript type definitions
│       │   ├── markdown-it-task-lists.d.ts
│       │   └── vite-raw.d.ts
│       │
│       ├── electron-api.d.ts # Global type declarations
│       ├── App.tsx           # Root component
│       └── main.tsx          # React entry point
│
├── dist/                     # Built renderer code (Vite output)
├── dist-electron/            # Built Electron code (TypeScript output)
├── release/                  # Packaged apps (electron-builder output)
│
├── tsconfig.json             # Renderer TypeScript config
├── tsconfig.electron.json    # Main process TypeScript config
├── tsconfig.preload.json     # Preload script TypeScript config
├── tsconfig.node.json        # Node.js TypeScript config
├── vite.config.ts            # Vite configuration
└── package.json              # Dependencies and scripts
```

### Build Commands

#### Development

```bash
# Start Vite dev server + Electron in watch mode
npm run electron:dev

# Components:
# - Vite dev server (http://localhost:5173)
# - TypeScript compiler (main.ts) in watch mode
# - Preload script compilation
# - Electron launches when all ready
```

#### Production Build

```bash
# Build everything
npm run build

# Steps:
# 1. Compile renderer (vite build) → dist/
# 2. Compile main process (tsc) → dist-electron/main.js
# 3. Compile preload (tsc) → dist-electron/preload.cjs
```

#### Package Application

```bash
# Build and package for current platform
npm run electron:build

# Output: release/
# - macOS: .dmg, .app
# - Windows: .exe (NSIS installer)
# - Linux: .AppImage
```

#### Individual Build Steps

```bash
npm run build:renderer   # Vite build (React app)
npm run build:main       # Compile main.ts
npm run build:preload    # Compile preload.ts
npm run build:electron   # main + preload
```

### Dependencies

#### Production Dependencies
- **React** (`react`, `react-dom`) - UI framework
- **CodeMirror 6** - Code editor
  - `@codemirror/state`, `@codemirror/view` - Core
  - `@codemirror/lang-markdown` - Markdown support
  - `@codemirror/theme-one-dark` - Dark theme
  - `@codemirror/commands`, `@codemirror/search` - Features
  - `@replit/codemirror-vim`, `@replit/codemirror-emacs` - Keybindings
- **Markdown** - Parser and rendering
  - `markdown-it` - Markdown to HTML
  - `markdown-it-task-lists` - Task list support
  - `dompurify` - HTML sanitization

#### Development Dependencies
- **TypeScript** (`typescript`) - Type checking
- **Vite** (`vite`) - Build tool and dev server
- **Electron** (`electron`) - Desktop framework
- **electron-builder** - Application packaging
- **concurrently** - Run multiple commands
- **wait-on** - Wait for dev server

### Adding New Features

#### 1. Adding a New Component

```typescript
// src/renderer/components/MyComponent.tsx
import React from 'react';
import './MyComponent.css';

interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ value, onChange }) => {
  return (
    <div className="my-component">
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};
```

```css
/* src/renderer/components/MyComponent.css */
.my-component {
  padding: var(--space-md);
  background: var(--bg-secondary);
  color: var(--fg-primary);
}
```

#### 2. Adding a New IPC Handler

**Main Process** (`src/main/main.ts`):
```typescript
type MyCustomArgs = {
  data: string;
};

type MyCustomResult = {
  success: boolean;
};

// Register in registerIpcHandlers()
ipcMain.handle('custom:action', async (_event, args: MyCustomArgs): Promise<MyCustomResult> => {
  // Do work
  return { success: true };
});
```

**Preload** (`src/main/preload.ts`):
```typescript
const electronAPI = {
  // ... existing methods
  customAction: (args: MyCustomArgs): Promise<MyCustomResult> =>
    ipcRenderer.invoke('custom:action', args),
};
```

**Type Declaration** (`src/renderer/electron-api.d.ts`):
```typescript
declare global {
  interface Window {
    electronAPI?: {
      // ... existing methods
      customAction: (args: MyCustomArgs) => Promise<MyCustomResult>;
    };
  }
}
```

**Usage in Renderer**:
```typescript
const result = await window.electronAPI?.customAction({ data: 'test' });
```

#### 3. Adding a New Hook

```typescript
// src/renderer/hooks/useMyFeature.ts
import { useState, useEffect } from 'react';

export function useMyFeature(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // Side effects
    localStorage.setItem('my-feature', value);
  }, [value]);

  return { value, setValue };
}
```

#### 4. Adding a New Keyboard Shortcut

In `App.tsx`:
```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const modKey = event.metaKey || event.ctrlKey;

    // Add new shortcut
    if (modKey && event.key === 'e') {
      event.preventDefault();
      handleMyCustomAction();
    }
  };

  window.addEventListener('keydown', handleKeyDown, true);
  return () => window.removeEventListener('keydown', handleKeyDown, true);
}, [handleMyCustomAction]);
```

### TypeScript Configuration

Three separate TypeScript configs for different contexts:

#### Renderer (`tsconfig.json`)
- Target: ES2020
- Module: ESNext
- JSX: react-jsx
- Lib: ES2020, DOM

#### Main Process (`tsconfig.electron.json`)
- Target: ES2022
- Module: ESNext (for Electron 28+)
- No DOM types

#### Preload (`tsconfig.preload.json`)
- Similar to main but outputs to `preload.cjs` (CommonJS)

### Testing

Currently no automated tests. Manual testing checklist:

- [ ] File operations (open, save, save as)
- [ ] Multi-tab support (create, switch, close)
- [ ] Markdown rendering (all syntax)
- [ ] Export (HTML, PDF)
- [ ] Theme switching (light/dark)
- [ ] Custom themes (create, apply, delete)
- [ ] Keybinding modes (default, vim, emacs)
- [ ] Focus mode and distraction-free mode
- [ ] Keyboard shortcuts
- [ ] Split pane resizing
- [ ] Status bar accuracy

### Debugging

#### Renderer Process
1. Run `npm run electron:dev`
2. Press `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)
3. Use Chrome DevTools

#### Main Process
1. Add `--inspect` flag to electron command
2. Open `chrome://inspect` in Chrome
3. Click "inspect" on the remote target

Add to `package.json`:
```json
"electron:debug": "electron . --inspect=5858"
```

### Performance Considerations

- **Markdown Rendering:** Uses memoization (`useMemo`) to avoid re-rendering preview
- **CodeMirror:** Updates are debounced via React state
- **Split Pane:** Throttled mouse move events during resize
- **Theme Changes:** CSS custom properties update without re-render
- **File Saving:** Async operations don't block UI

### Security Best Practices

1. **Never disable security features:**
   - Keep `contextIsolation: true`
   - Keep `nodeIntegration: false`
   - Keep `sandbox: true`

2. **Sanitize all user input:**
   - DOMPurify for markdown HTML
   - Validate file paths
   - Escape HTML in exports

3. **IPC Security:**
   - Validate sender in sensitive handlers
   - Use typed arguments
   - Don't expose Node.js APIs to renderer

4. **Link Handling:**
   - External links open in system browser
   - Prevent navigation in renderer window
   - Add `rel="noopener noreferrer"` to links

---

## License

See LICENSE file in repository root.

## Contributing

This is the comprehensive technical documentation. For development setup and contribution guidelines, see README.md.

---

[← Back to Documentation Index](./README.md)
