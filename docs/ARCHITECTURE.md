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
---

[← Back to Documentation Index](./README.md)
