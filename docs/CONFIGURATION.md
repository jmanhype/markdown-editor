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

#### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

#### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

#### Border Radius
```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-full: 9999px;  /* Fully rounded */
```

### Theme Color Variables

**Location:** `/src/renderer/styles/themes.css`

#### Light Theme
Cool grays with sage green accent:
```css
[data-theme='light'] {
  /* Backgrounds */
  --bg-primary: #fafaf9;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f5f5f4;
  --bg-elevated: #ffffff;

  /* Foreground */
  --fg-primary: #1c1917;
  --fg-secondary: #57534e;
  --fg-tertiary: #78716c;
  --fg-muted: #a8a29e;

  /* Accent - Sage */
  --accent-primary: #65735b;
  --accent-secondary: #7f8c75;
  --accent-muted: #9ca899;

  /* Borders */
  --border-subtle: #e7e5e4;
  --border-default: #d6d3d1;
  --border-strong: #a8a29e;

  /* Editor Specific */
  --editor-bg: #ffffff;
  --editor-fg: #1c1917;
  --editor-line-number: #a8a29e;
  --editor-selection: rgba(101, 115, 91, 0.15);
  --editor-cursor: #65735b;
  --editor-gutter-bg: #fafaf9;

  /* Preview Specific */
  --preview-bg: #fafaf9;
  --preview-fg: #1c1917;
  --preview-heading: #0c0a09;
  --preview-link: #65735b;
  --preview-code-bg: #f5f5f4;
  --preview-code-fg: #44403c;
  --preview-blockquote-border: #d6d3d1;

  /* UI Elements */
  --divider-color: #e7e5e4;
  --divider-hover: #d6d3d1;
  --toolbar-bg: #ffffff;
  --toolbar-border: #e7e5e4;

  /* Interactive */
  --hover-bg: #f5f5f4;
  --active-bg: #e7e5e4;
}
```

#### Dark Theme
Warm neutrals with amber accent:
```css
[data-theme='dark'] {
  /* Backgrounds */
  --bg-primary: #1a1816;
  --bg-secondary: #221f1d;
  --bg-tertiary: #2a2624;
  --bg-elevated: #2a2624;

  /* Foreground */
  --fg-primary: #f5f1ed;
  --fg-secondary: #d4cfc9;
  --fg-tertiary: #a39e98;
  --fg-muted: #78736e;

  /* Accent - Warm Amber */
  --accent-primary: #d4a574;
  --accent-secondary: #c09660;
  --accent-muted: #a8824e;

  /* Borders */
  --border-subtle: #2a2624;
  --border-default: #3a3632;
  --border-strong: #4a453f;

  /* Editor Specific */
  --editor-bg: #221f1d;
  --editor-fg: #f5f1ed;
  --editor-line-number: #78736e;
  --editor-selection: rgba(212, 165, 116, 0.15);
  --editor-cursor: #d4a574;
  --editor-gutter-bg: #1a1816;

  /* Preview Specific */
  --preview-bg: #1a1816;
  --preview-fg: #e8e4df;
  --preview-heading: #f5f1ed;
  --preview-link: #d4a574;
  --preview-code-bg: #2a2624;
  --preview-code-fg: #d4cfc9;
  --preview-blockquote-border: #3a3632;

  /* UI Elements */
  --divider-color: #2a2624;
  --divider-hover: #3a3632;
  --toolbar-bg: #221f1d;
  --toolbar-border: #2a2624;

  /* Interactive */
  --hover-bg: #2a2624;
  --active-bg: #3a3632;
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
| **Backgrounds** | |
| `--bg-primary` | Main background |
| `--bg-secondary` | Secondary background (toolbar, elevated) |
| `--bg-tertiary` | Tertiary background |
| `--bg-elevated` | Elevated surfaces (modals, dropdowns) |
| **Foreground** | |
| `--fg-primary` | Primary text |
| `--fg-secondary` | Secondary text (muted) |
| `--fg-tertiary` | Tertiary text (very muted) |
| `--fg-muted` | Most muted text (placeholders) |
| **Accent** | |
| `--accent-primary` | Primary accent (links, highlights) |
| `--accent-secondary` | Secondary accent |
| `--accent-muted` | Muted accent |
| **Borders** | |
| `--border-subtle` | Subtle borders |
| `--border-default` | Default borders |
| `--border-strong` | Strong/emphasized borders |
| **Editor** | |
| `--editor-bg` | Editor background |
| `--editor-fg` | Editor text |
| `--editor-line-number` | Line number color |
| `--editor-selection` | Selection highlight |
| `--editor-cursor` | Cursor color |
| `--editor-gutter-bg` | Gutter background |
| **Preview** | |
| `--preview-bg` | Preview pane background |
| `--preview-fg` | Preview pane text |
| `--preview-heading` | Heading color in preview |
| `--preview-link` | Link color in preview |
| `--preview-code-bg` | Code block background |
| `--preview-code-fg` | Code block text |
| `--preview-blockquote-border` | Blockquote left border |
| **UI Elements** | |
| `--divider-color` | Split pane divider |
| `--divider-hover` | Divider hover state |
| `--toolbar-bg` | Toolbar background |
| `--toolbar-border` | Toolbar bottom border |
| **Interactive** | |
| `--hover-bg` | Hover background |
| `--active-bg` | Active/pressed background |

---

## Storage Keys Reference

The application uses `localStorage` for persisting user preferences:

| Key | Used By | Type | Description |
|-----|---------|------|-------------|
| `markdown-editor-theme` | `useTheme` | `'light' \| 'dark'` | User's theme preference |
| `markdown-editor-keybinding-mode` | `useKeybindingMode` | `'default' \| 'vim' \| 'emacs'` | Editor keybinding mode |
| `markdown-editor-custom-themes` | `useCustomThemes` | `CustomTheme[]` (JSON) | Array of saved custom themes |
| `markdown-editor-active-custom-theme` | `useCustomThemes` | `string` | ID of currently active custom theme |
| `markdown-editor-focus-mode` | `App` | `'true' \| 'false'` | Focus mode enabled state |
| `markdown-editor-distraction-free-mode` | `App` | `'true' \| 'false'` | Distraction-free mode enabled state |
| `split-position` | `SplitPane` | `string` (e.g., `'50'`) | Split pane divider position percentage (parsed as number 0-100) |

**Note:** The `split-position` key does not follow the `markdown-editor-` prefix convention for historical reasons.

---

## Utilities Reference

### buildExportHtml

Generates standalone HTML for export (HTML file or PDF).

**Location:** `/src/renderer/utils/buildExportHtml.ts`

**Signature:**
```typescript
function buildExportHtml(args: {
  title: string;
  theme: 'light' | 'dark';
  bodyHtml: string;
  cssVariablesOverride?: Record<string, string>;
}): string;
```

**Parameters:**
- `title` - Document title (escaped for HTML)
- `theme` - Theme to apply (`'light'` or `'dark'`)
- `bodyHtml` - Rendered markdown HTML content
- `cssVariablesOverride` - Optional CSS variable overrides for custom themes

**Returns:** Complete HTML document string with embedded CSS.

**Behavior:**
1. Escapes the title for safe HTML insertion
2. Embeds all CSS (variables.css, themes.css, preview.css)
3. Applies custom theme variables if provided
4. Wraps content in preview container structure

**Example:**
```typescript
import { buildExportHtml } from './utils/buildExportHtml';
// Note: renderMarkdown is a pure function, NOT a React hook
import { renderMarkdown } from './hooks/useMarkdown';

const markdown = '# Hello World';
const renderedHtml = renderMarkdown(markdown); // Can be called anywhere

const html = buildExportHtml({
  title: 'My Document',
  theme: 'dark',
  bodyHtml: renderedHtml,
  cssVariablesOverride: {
    '--bg-primary': '#000000'
  }
});

// html is now a complete standalone HTML document
```

---


---

[← Back to Documentation Index](./README.md)
