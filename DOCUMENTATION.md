# Markdown Editor Documentation

A clean, minimal markdown editor built with Electron, React, and TypeScript featuring live preview, custom themes, multiple document tabs, and export capabilities.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [IPC API Reference](#ipc-api-reference)
3. [Component API](#component-api)
4. [Hooks Reference](#hooks-reference)
5. [Theming System](#theming-system)
6. [Development Guide](#development-guide)

---

## Architecture Overview

### Process Architecture

The application follows Electron's multi-process architecture with strict security boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                       Main Process                          │
│  - Window management                                        │
│  - File system operations (fs/promises)                     │
│  - Native dialogs (open/save)                               │
│  - Menu bar                                                 │
│  - IPC handlers                                             │
│  - PDF/HTML export                                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Context Bridge (electronAPI)
                 │
┌────────────────▼────────────────────────────────────────────┐
│                     Preload Script                          │
│  - Exposes safe IPC methods to renderer                    │
│  - Type-safe API (contextBridge.exposeInMainWorld)          │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   Renderer Process                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   App Component                      │  │
│  │  - Document management (tabs)                        │  │
│  │  - State management                                  │  │
│  │  - Keyboard shortcuts                                │  │
│  └──┬───────────────────────────────────────────────────┘  │
│     │                                                       │
│  ┌──▼────────┬──────────┬──────────┬───────────┐          │
│  │ Toolbar   │ TabBar   │SplitPane │StatusBar  │          │
│  └───────────┴──────────┴────┬─────┴───────────┘          │
│                               │                            │
│                    ┌──────────▼──────────┐                 │
│                    │  Editor  │ Preview  │                 │
│                    │(CodeMirror)│(HTML) │                 │
│                    └─────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Toolbar
│   └── ThemeToggle
├── TabBar
├── SplitPane
│   ├── Editor (CodeMirror 6)
│   └── Preview (Sanitized HTML)
├── StatusBar
└── ThemeBuilder (Modal)
```

### Data Flow

1. **User Input** → Editor component receives text changes
2. **State Update** → `handleContentChange` updates document state
3. **Markdown Rendering** → `renderMarkdown` converts to HTML
4. **Preview Update** → Preview component displays sanitized HTML
5. **Export** → `buildExportHtml` generates standalone HTML/PDF

### Security Model

- **Context Isolation**: Enabled (prevents renderer from accessing Node.js)
- **Node Integration**: Disabled
- **Sandbox**: Enabled
- **Content Security**: DOMPurify sanitizes all markdown output
- **Link Handling**: External links open in system browser
- **IPC Validation**: Sender validation for sensitive operations

---

## IPC API Reference

### Communication Channels

All IPC communication flows through the preload script's `electronAPI` interface exposed via `contextBridge`.

### Invoke Handlers (Renderer → Main)

#### `file:open`

Opens a file dialog and reads the selected markdown file.

**Request:**
```typescript
window.electronAPI.openFile(): Promise<OpenFileResult>
```

**Response:**
```typescript
type OpenFileResult = {
  filePath: string;
  content: string;
} | null;
```

**Returns:** File path and content, or `null` if canceled.

**Example:**
```typescript
const result = await window.electronAPI.openFile();
if (result) {
  console.log(`Opened: ${result.filePath}`);
  console.log(`Content: ${result.content}`);
}
```

---

#### `file:save`

Saves content to an existing file path.

**Request:**
```typescript
window.electronAPI.saveFile(args: SaveFileArgs): Promise<SaveFileResult>

type SaveFileArgs = {
  filePath: string;
  content: string;
}
```

**Response:**
```typescript
type SaveFileResult = {
  filePath: string;
} | null;
```

**Example:**
```typescript
await window.electronAPI.saveFile({
  filePath: '/path/to/document.md',
  content: '# Hello World'
});
```

---

#### `file:saveAs`

Shows save dialog and saves content to selected path.

**Request:**
```typescript
window.electronAPI.saveFileAs(args: SaveFileAsArgs): Promise<SaveFileResult>

type SaveFileAsArgs = {
  content: string;
  suggestedName?: string;
}
```

**Response:**
```typescript
type SaveFileResult = {
  filePath: string;
} | null;
```

**Example:**
```typescript
const result = await window.electronAPI.saveFileAs({
  content: '# My Document',
  suggestedName: 'my-doc.md'
});
```

---

#### `export:html`

Exports markdown as standalone HTML file.

**Request:**
```typescript
window.electronAPI.exportHtml(args: ExportArgs): Promise<ExportResult>

type ExportArgs = {
  html: string;
  suggestedName?: string;
}
```

**Response:**
```typescript
type ExportResult = {
  filePath: string;
} | null;
```

**Security:** Validates sender is the main window to prevent unauthorized exports.

---

#### `export:pdf`

Exports markdown as PDF using Electron's print-to-PDF.

**Request:**
```typescript
window.electronAPI.exportPdf(args: ExportArgs): Promise<ExportResult>
```

**Response:** Same as `export:html`

**Implementation:** Creates hidden BrowserWindow, loads HTML, generates PDF with `printToPDF`.

---

#### `app:setTitle`

Updates the window title to reflect current file and dirty state.

**Request:**
```typescript
window.electronAPI.setTitle(args: SetTitleArgs): Promise<void>

type SetTitleArgs = {
  filePath: string | null;
  dirty: boolean;
}
```

**Title Format:** `[• ]filename — Markdown Editor`
- `•` prefix indicates unsaved changes (dirty state)
- `filename` is basename of filePath or "Untitled"

---

### Event Listeners (Main → Renderer)

#### Menu Events

Subscribe to menu bar events (File menu items).

**Usage:**
```typescript
const unsubscribe = window.electronAPI.onMenu(
  event: 'menu:open' | 'menu:save' | 'menu:saveAs',
  callback: () => void
): () => void
```

**Events:**
- `menu:open` - File → Open (Cmd/Ctrl+O)
- `menu:save` - File → Save (Cmd/Ctrl+S)
- `menu:saveAs` - File → Save As (Cmd/Ctrl+Shift+S)

**Example:**
```typescript
useEffect(() => {
  const offOpen = window.electronAPI.onMenu('menu:open', handleOpen);
  const offSave = window.electronAPI.onMenu('menu:save', handleSave);

  return () => {
    offOpen();
    offSave();
  };
}, [handleOpen, handleSave]);
```

---

## Component API

### App

Main application component managing document state, tabs, and keyboard shortcuts.

**Location:** `/src/renderer/App.tsx`

**State:**
- `documents: DocumentTab[]` - Array of open documents
- `activeId: string` - ID of currently active document
- `focusMode: boolean` - Hides preview pane (editor-only)
- `distractionFree: boolean` - Hides toolbar
- `themeBuilderOpen: boolean` - Theme customization modal

**Type Definitions:**
```typescript
type DocumentTab = {
  id: string;
  filePath: string | null;
  content: string;
  dirty: boolean;
};
```

**Key Methods:**
- `createNewDocument()` - Creates blank tab
- `closeDocument(id)` - Closes tab with unsaved warning
- `handleOpen()` - Opens file via dialog
- `handleSave()` - Saves current document
- `handleSaveAs()` - Save as new file
- `handleExportHtml()` - Export to HTML
- `handleExportPdf()` - Export to PDF

**Keyboard Shortcuts:**
| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl+O | Open file |
| Cmd/Ctrl+S | Save |
| Cmd/Ctrl+Shift+S | Save As |
| Cmd/Ctrl+T | New tab |
| Cmd/Ctrl+W | Close tab |
| Cmd/Ctrl+Shift+L | Toggle focus mode |
| Cmd/Ctrl+Shift+D | Toggle distraction-free |
| Cmd/Ctrl+, | Open theme builder |

---

### Toolbar

Top application toolbar with file operations and settings.

**Location:** `/src/renderer/components/Toolbar.tsx`

**Props:**
```typescript
interface ToolbarProps {
  theme: Theme;
  fileName: string;
  dirty: boolean;
  onToggleTheme: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExportPdf: () => void;
  onExportHtml: () => void;
  keybindingMode: 'default' | 'vim' | 'emacs';
  onToggleKeybindingMode: () => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  onToggleDistractionFree: () => void;
  onOpenThemeBuilder: () => void;
}
```

**Usage:**
```tsx
<Toolbar
  theme={theme}
  fileName="document.md"
  dirty={true}
  onToggleTheme={toggleTheme}
  onSave={handleSave}
  // ... other props
/>
```

---

### Editor

CodeMirror 6 based markdown editor with syntax highlighting and keybinding modes.

**Location:** `/src/renderer/components/Editor.tsx`

**Props:**
```typescript
interface EditorProps {
  content: string;
  onChange?: (content: string) => void;
  onCursorChange?: (position: CursorPosition) => void;
  onRequestSave?: () => void;
  onRequestOpen?: () => void;
  keybindingMode: KeybindingMode;
  theme: 'light' | 'dark';
}

interface CursorPosition {
  line: number;
  column: number;
}

type KeybindingMode = 'default' | 'vim' | 'emacs';
```

**Features:**
- Markdown syntax highlighting
- Line wrapping
- Search/replace (Cmd+F / Cmd+H)
- Vim/Emacs keybindings
- Selection matching
- History (undo/redo)

**CodeMirror Extensions:**
- `@codemirror/lang-markdown` - Markdown language support
- `@codemirror/theme-one-dark` - Dark theme
- `@replit/codemirror-vim` - Vim keybindings
- `@replit/codemirror-emacs` - Emacs keybindings

**Example:**
```tsx
<Editor
  content={markdown}
  onChange={setMarkdown}
  keybindingMode="vim"
  theme="dark"
  onRequestSave={handleSave}
/>
```

---

### Preview

Displays rendered markdown with sanitized HTML.

**Location:** `/src/renderer/components/Preview.tsx`

**Props:**
```typescript
interface PreviewProps {
  html: string;
}
```

**Security:** Renders HTML using `dangerouslySetInnerHTML` but content is pre-sanitized by DOMPurify.

**Example:**
```tsx
const html = renderMarkdown('# Hello World');
<Preview html={html} />
```

---

### TabBar

Document tab management with close buttons and new tab action.

**Location:** `/src/renderer/components/TabBar.tsx`

**Props:**
```typescript
interface TabBarProps {
  documents: TabDocument[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
}

interface TabDocument {
  id: string;
  title: string;
  dirty: boolean;
}
```

**Features:**
- Dirty indicator (bullet point)
- Keyboard navigation
- Click to select
- Close button per tab
- New tab button

**Example:**
```tsx
<TabBar
  documents={[
    { id: '1', title: 'document.md', dirty: true },
    { id: '2', title: 'notes.md', dirty: false }
  ]}
  activeId="1"
  onSelect={setActiveId}
  onClose={closeDocument}
  onNew={createNewDocument}
/>
```

---

### SplitPane

Resizable split view with draggable divider.

**Location:** `/src/renderer/components/SplitPane.tsx`

**Props:**
```typescript
interface SplitPaneProps {
  left: React.ReactNode;
  right?: React.ReactNode;
  showRight?: boolean;
  defaultSplit?: number; // Percentage (0-100)
  minSize?: number; // Minimum pane size in pixels
}
```

**Features:**
- Mouse drag to resize
- Keyboard navigation (Arrow keys)
- Persists split position to localStorage
- Minimum pane size constraints
- Hide right pane for focus mode

**Example:**
```tsx
<SplitPane
  left={<Editor content={text} onChange={setText} />}
  right={<Preview html={html} />}
  showRight={!focusMode}
  defaultSplit={50}
  minSize={200}
/>
```

---

### StatusBar

Bottom status bar showing document statistics.

**Location:** `/src/renderer/components/StatusBar.tsx`

**Props:**
```typescript
interface StatusBarProps {
  words: number;
  characters: number;
  readingTimeMinutes: number;
}
```

**Display:**
- Word count
- Character count
- Estimated reading time (200 WPM)

**Example:**
```tsx
<StatusBar
  words={152}
  characters={843}
  readingTimeMinutes={1}
/>
```

---

### ThemeToggle

Toggle button for light/dark theme switching.

**Location:** `/src/renderer/components/ThemeToggle.tsx`

**Props:**
```typescript
interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

type Theme = 'light' | 'dark';
```

**Example:**
```tsx
<ThemeToggle theme="dark" onToggle={toggleTheme} />
```

---

### ThemeBuilder

Modal dialog for creating and managing custom color themes.

**Location:** `/src/renderer/components/ThemeBuilder.tsx`

**Props:**
```typescript
interface ThemeBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  themes: CustomTheme[];
  activeThemeId: string | null;
  activeTheme: CustomTheme | null;
  onSelectTheme: (id: string | null) => void;
  onDeleteTheme: (id: string) => void;
  onSaveTheme: (name: string, variables: Record<string, string>) => void;
  onPreviewVariables: (variables: Record<string, string>) => void;
}

interface CustomTheme {
  id: string;
  name: string;
  variables: Record<string, string>;
}
```

**Features:**
- Live preview of color changes
- Save/load custom themes
- Color picker for each CSS variable
- Reset to default theme
- Delete saved themes

**Customizable Variables:**
- Background colors (primary, secondary, tertiary)
- Text colors (primary, secondary, tertiary)
- Accent colors
- Border colors
- Editor-specific colors
- Preview-specific colors

**Example:**
```tsx
<ThemeBuilder
  isOpen={isOpen}
  onClose={handleClose}
  themes={customThemes}
  activeThemeId={activeThemeId}
  onSaveTheme={(name, vars) => addTheme({ name, variables: vars })}
  onPreviewVariables={previewVars}
/>
```

---

## Hooks Reference

### useTheme

Manages light/dark theme state with localStorage persistence and system preference detection.

**Location:** `/src/renderer/hooks/useTheme.ts`

**Signature:**
```typescript
function useTheme(): {
  theme: Theme;
  toggleTheme: () => void;
}

type Theme = 'light' | 'dark';
```

**Behavior:**
1. Checks `localStorage` for saved preference
2. Falls back to `prefers-color-scheme` media query
3. Defaults to `light` if no preference
4. Persists changes to `localStorage`
5. Listens for system theme changes (only affects if no manual preference)
6. Sets `data-theme` attribute on `<html>` element

**Storage Key:** `markdown-editor-theme`

**Example:**
```typescript
const { theme, toggleTheme } = useTheme();

return (
  <button onClick={toggleTheme}>
    Current: {theme}
  </button>
);
```

---

### useKeybindingMode

Manages editor keybinding mode (default/vim/emacs).

**Location:** `/src/renderer/hooks/useKeybindingMode.ts`

**Signature:**
```typescript
function useKeybindingMode(): {
  keybindingMode: KeybindingMode;
  setKeybindingMode: (mode: KeybindingMode) => void;
  cycleKeybindingMode: () => void;
}

type KeybindingMode = 'default' | 'vim' | 'emacs';
```

**Cycle Order:** default → vim → emacs → default

**Storage Key:** `markdown-editor-keybinding-mode`

**Example:**
```typescript
const { keybindingMode, cycleKeybindingMode } = useKeybindingMode();

return (
  <button onClick={cycleKeybindingMode}>
    Mode: {keybindingMode}
  </button>
);
```

---

### useMarkdown

Converts markdown to sanitized HTML (deprecated - use `renderMarkdown` directly).

**Location:** `/src/renderer/hooks/useMarkdown.ts`

**Signature:**
```typescript
function useMarkdown(initialContent?: string): {
  content: string;
  html: string;
  updateContent: (newContent: string) => void;
}

function renderMarkdown(markdown: string): string;
```

**Configuration:**
- **Parser:** markdown-it
- **Extensions:** tables, strikethrough, task lists
- **Sanitizer:** DOMPurify
- **Settings:** linkify enabled, HTML disabled, breaks enabled

**Allowed HTML Tags:**
h1-h6, p, br, hr, strong, em, u, s, code, pre, a, img, ul, ol, li, blockquote, table, thead, tbody, tr, th, td, input, label, sup, sub, div, span

**Allowed Attributes:**
href, src, alt, title, class, id, type, checked, disabled, align, colspan, rowspan, rel

**Security:** All links get `rel="noopener noreferrer"` automatically

**Example:**
```typescript
import { renderMarkdown } from './hooks/useMarkdown';

const html = renderMarkdown('# Hello **World**');
// Returns: '<h1>Hello <strong>World</strong></h1>\n'
```

---

### useCustomThemes

Manages custom color themes with localStorage persistence and live preview.

**Location:** `/src/renderer/hooks/useCustomThemes.ts`

**Signature:**
```typescript
function useCustomThemes(): {
  themes: CustomTheme[];
  activeTheme: CustomTheme | null;
  activeThemeId: string | null;
  addTheme: (args: { name: string; variables: Record<string, string> }) => CustomTheme;
  updateTheme: (id: string, updates: Partial<Pick<CustomTheme, 'name' | 'variables'>>) => void;
  deleteTheme: (id: string) => void;
  setActiveTheme: (id: string | null) => void;
  previewVariables: (variables: Record<string, string>) => void;
}

interface CustomTheme {
  id: string;
  name: string;
  variables: Record<string, string>;
}
```

**Storage Keys:**
- `markdown-editor-custom-themes` - Array of saved themes
- `markdown-editor-active-custom-theme` - Currently active theme ID

**Behavior:**
- Applies theme by setting CSS custom properties on `:root`
- Clears previous theme variables before applying new ones
- Preview mode temporarily applies variables without saving

**Example:**
```typescript
const {
  themes,
  activeTheme,
  addTheme,
  setActiveTheme,
  previewVariables
} = useCustomThemes();

// Save new theme
const theme = addTheme({
  name: 'My Theme',
  variables: {
    '--bg-primary': '#1a1a1a',
    '--fg-primary': '#ffffff'
  }
});

// Activate theme
setActiveTheme(theme.id);

// Preview without saving
previewVariables({
  '--bg-primary': '#ff0000'
});
```

---

## Theming System

### CSS Architecture

The theming system uses CSS custom properties (variables) with a three-layer approach:

1. **Design Tokens** (`variables.css`) - Layout, spacing, typography
2. **Theme Variables** (`themes.css`) - Color palettes per theme
3. **Component Styles** - Reference theme variables

### Core Design Tokens

**Location:** `/src/renderer/styles/variables.css`

#### Spacing Scale (8px grid)
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

#### Typography
```css
--font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace;
--font-serif: 'Crimson Pro', 'Lyon Text', 'Charter', 'Georgia', serif;
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
```

#### Layout
```css
--toolbar-height: 3rem;        /* 48px */
--tabbar-height: 2.25rem;
--statusbar-height: 1.75rem;
--divider-width: 1px;
--divider-handle-width: 12px;
```

#### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Theme Color Variables

**Location:** `/src/renderer/styles/themes.css`

#### Light Theme
Cool grays with sage green accent:
```css
[data-theme='light'] {
  --bg-primary: #fafaf9;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f5f5f4;

  --fg-primary: #1c1917;
  --fg-secondary: #57534e;
  --fg-tertiary: #78716c;

  --accent-primary: #65735b;
  --accent-secondary: #7f8c75;

  --border-subtle: #e7e5e4;
  --border-default: #d6d3d1;

  --editor-bg: #ffffff;
  --editor-fg: #1c1917;
  --editor-selection: rgba(101, 115, 91, 0.15);
  --editor-cursor: #65735b;

  --preview-bg: #fafaf9;
  --preview-fg: #1c1917;
  --preview-heading: #0c0a09;
  --preview-link: #65735b;
  --preview-code-bg: #f5f5f4;
}
```

#### Dark Theme
Warm neutrals with amber accent:
```css
[data-theme='dark'] {
  --bg-primary: #1a1816;
  --bg-secondary: #221f1d;
  --bg-tertiary: #2a2624;

  --fg-primary: #f5f1ed;
  --fg-secondary: #d4cfc9;
  --fg-tertiary: #a39e98;

  --accent-primary: #d4a574;
  --accent-secondary: #c09660;

  --border-subtle: #2a2624;
  --border-default: #3a3632;

  --editor-bg: #221f1d;
  --editor-fg: #f5f1ed;
  --editor-selection: rgba(212, 165, 116, 0.15);
  --editor-cursor: #d4a574;

  --preview-bg: #1a1816;
  --preview-fg: #e8e4df;
  --preview-heading: #f5f1ed;
  --preview-link: #d4a574;
  --preview-code-bg: #2a2624;
}
```

### Creating Custom Themes

#### Via Theme Builder UI

1. Press `Cmd/Ctrl+,` to open Theme Builder
2. Modify colors using color pickers
3. Preview changes in real-time
4. Enter theme name and click "Save"
5. Theme persists to localStorage

#### Programmatically

```typescript
const { addTheme, setActiveTheme } = useCustomThemes();

const myTheme = addTheme({
  name: 'Solarized Dark',
  variables: {
    '--bg-primary': '#002b36',
    '--bg-secondary': '#073642',
    '--fg-primary': '#839496',
    '--fg-secondary': '#586e75',
    '--accent-primary': '#268bd2',
    '--editor-bg': '#002b36',
    '--editor-fg': '#839496',
    '--preview-bg': '#002b36',
    '--preview-fg': '#839496',
    '--preview-link': '#268bd2',
    // ... other variables
  }
});

setActiveTheme(myTheme.id);
```

#### Via CSS

Add custom theme in a CSS file:

```css
[data-theme='custom'] {
  --bg-primary: #your-color;
  --fg-primary: #your-color;
  /* ... all required variables */
}
```

Then set programmatically:
```typescript
document.documentElement.setAttribute('data-theme', 'custom');
```

### Customizable Theme Variables

| Variable | Purpose |
|----------|---------|
| `--bg-primary` | Main background |
| `--bg-secondary` | Secondary background (toolbar, elevated) |
| `--bg-tertiary` | Tertiary background |
| `--fg-primary` | Primary text |
| `--fg-secondary` | Secondary text (muted) |
| `--fg-tertiary` | Tertiary text (very muted) |
| `--accent-primary` | Primary accent (links, highlights) |
| `--accent-secondary` | Secondary accent |
| `--border-subtle` | Subtle borders |
| `--border-default` | Default borders |
| `--editor-bg` | Editor background |
| `--editor-fg` | Editor text |
| `--preview-bg` | Preview pane background |
| `--preview-fg` | Preview pane text |
| `--preview-heading` | Heading color in preview |
| `--preview-link` | Link color in preview |

---

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
