# Markdown Editor

A clean, minimal Electron-based markdown editor with live preview, featuring an editorial minimalism aesthetic.

## Features

- **Split-Pane Interface**: Resizable CodeMirror editor on the left, live preview on the right
- **Dark/Light Themes**: Beautiful editorial themes with smooth transitions
  - Light: Cool grays with sage accent
  - Dark: Warm neutrals with amber accent
- **Live Preview**: Real-time markdown rendering with syntax highlighting
- **Responsive Layout**: Adapts to different window sizes (stacks vertically on mobile)
- **Clean Typography**: 
  - Editor: JetBrains Mono (monospace)
  - Preview: Crimson Pro (serif)
- **Keyboard Shortcuts**: Standard CodeMirror shortcuts (Ctrl+Z undo, etc.)

## Architecture

### Component Structure

```
src/renderer/
├── components/
│   ├── Editor.tsx          # CodeMirror wrapper
│   ├── Preview.tsx         # Markdown preview
│   ├── SplitPane.tsx       # Resizable split container
│   ├── Toolbar.tsx         # Top bar with actions
│   └── ThemeToggle.tsx     # Theme switcher
├── hooks/
│   ├── useTheme.ts         # Theme state + localStorage
│   └── useMarkdown.ts      # Markdown parsing + sanitization
├── styles/
│   ├── variables.css       # Design tokens
│   ├── themes.css          # Light/dark themes
│   ├── editor.css          # CodeMirror customization
│   └── preview.css         # Preview styling
├── App.tsx
└── main.tsx
```

### CSS Strategy

**Design System Approach:**

1. **CSS Custom Properties (Variables)**: All colors, spacing, typography defined as CSS variables in `variables.css`
2. **Theme Switching**: `[data-theme='light|dark']` attribute on `<html>` toggles entire theme
3. **Smooth Transitions**: All theme changes animate smoothly (250ms cubic-bezier)
4. **Component-Scoped Styles**: Each component has its own CSS file, imported alongside the component
5. **No CSS-in-JS**: Pure CSS for maximum performance and simplicity

**Key Patterns:**

- **Design Tokens**: Spacing scale (8px grid), typography scale, semantic color names
- **Theme Variables**: Different values per theme (e.g., `--bg-primary`, `--fg-primary`)
- **Component Variables**: Component-specific values (e.g., `--toolbar-height`, `--divider-width`)
- **Responsive**: Mobile-first with `@media (max-width: 768px)` for tablet/mobile

### State Management

- **Theme**: `useTheme` hook manages theme state, persists to localStorage, listens to system preference
- **Content**: `useMarkdown` hook manages editor content and parsed HTML
- **Split Position**: Saved to localStorage, loaded on mount

### Dependencies

**Core:**
- `react` + `react-dom`: UI framework
- `@codemirror/*`: Editor (view, state, commands, language, theme)
- `marked`: Markdown parser
- `dompurify`: HTML sanitization

**Dev:**
- `vite`: Build tool + dev server
- `typescript`: Type safety
- `electron`: Desktop app wrapper

## Installation

```bash
npm install
```

## Development

```bash
# Run Vite dev server
npm run dev

# Run Electron app with hot reload
npm run electron:dev
```

## Building

```bash
# Build for production
npm run build

# Package Electron app
npm run electron:build
```

## Customization

### Adding New Themes

1. Add theme colors in `src/renderer/styles/themes.css`:
```css
[data-theme='custom'] {
  --bg-primary: ...;
  --fg-primary: ...;
  /* etc */
}
```

2. Update `Theme` type in `useTheme.ts`

### Changing Fonts

Update font imports in `index.html` and font variables in `variables.css`:
```css
:root {
  --font-mono: 'YourMono', monospace;
  --font-serif: 'YourSerif', serif;
}
```

### Adjusting Layout

- **Split ratio**: Change `defaultSplit` prop in `App.tsx`
- **Min pane size**: Change `minSize` prop in `App.tsx`
- **Toolbar height**: Adjust `--toolbar-height` in `variables.css`

## Responsive Behavior

- **Desktop (>768px)**: Side-by-side split panes
- **Mobile (≤768px)**: Vertical stack (50/50 height split)
- **Divider**: Horizontal on desktop, vertical on mobile

## Accessibility

- **Keyboard Navigation**: Full keyboard support for editor, theme toggle, and split pane
- **ARIA Labels**: All interactive elements have proper labels
- **Focus Indicators**: Clear focus states for all controls
- **Color Contrast**: WCAG AA compliant color combinations

## Performance

- **No Runtime CSS-in-JS**: Pure CSS for zero JS overhead
- **Optimized Transitions**: Only animating transform and opacity where possible
- **Lazy Markdown Parsing**: Only parses on content change
- **HTML Sanitization**: Prevents XSS while allowing rich formatting

## Future Enhancements

- [ ] File system integration (open/save via Electron IPC)
- [ ] Export to PDF/HTML
- [ ] Vim/Emacs keybindings toggle
- [ ] Custom themes builder
- [ ] Focus mode (hide preview)
- [ ] Distraction-free mode (hide toolbar)
- [ ] Word count statistics
- [ ] Find & replace
- [ ] Multi-document tabs

## License

MIT
