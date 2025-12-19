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
- Estimated reading time (200 WPM, rounded up with `Math.ceil`)

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


---

[← Back to Documentation Index](./README.md)
