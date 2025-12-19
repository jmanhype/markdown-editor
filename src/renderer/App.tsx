import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { TabBar } from './components/TabBar';
import { SplitPane } from './components/SplitPane';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { StatusBar } from './components/StatusBar';
import { ThemeBuilder } from './components/ThemeBuilder';
import { useTheme } from './hooks/useTheme';
import { useKeybindingMode } from './hooks/useKeybindingMode';
import { renderMarkdown } from './hooks/useMarkdown';
import { useCustomThemes } from './hooks/useCustomThemes';
import { buildExportHtml } from './utils/buildExportHtml';
import './styles/variables.css';
import './styles/themes.css';

const SAMPLE_CONTENT = `# Welcome to Markdown Editor

Start writing your markdown here...

## Features

- **Live Preview**: See your changes in real-time
- **Dark/Light Theme**: Toggle between themes
- **Resizable Panes**: Drag the divider to adjust sizes
- **Clean Interface**: Focus on your content
- **File Open/Save**: Desktop dialogs + keyboard shortcuts

## Code Example

\`\`\`typescript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> This is a blockquote. It can contain *emphasis* and **strong** text.

---

Happy writing!
`;

type DocumentTab = {
  id: string;
  filePath: string | null;
  content: string;
  dirty: boolean;
};

const FOCUS_MODE_STORAGE_KEY = 'markdown-editor-focus-mode';
const DISTRACTION_FREE_STORAGE_KEY = 'markdown-editor-distraction-free-mode';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fileNameFromPath(filePath: string | null): string {
  if (!filePath) return 'Untitled';
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] || 'Untitled';
}

function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function readingTimeMinutes(words: number): number {
  const WPM = 200;
  return Math.ceil(words / WPM);
}

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { keybindingMode, cycleKeybindingMode } = useKeybindingMode();

  const {
    themes: customThemes,
    activeTheme,
    activeThemeId,
    addTheme,
    deleteTheme,
    setActiveTheme,
    previewVariables
  } = useCustomThemes();

  const [documents, setDocuments] = useState<DocumentTab[]>(() => [
    { id: createId(), filePath: null, content: SAMPLE_CONTENT, dirty: false }
  ]);
  const [activeId, setActiveId] = useState<string>(() => documents[0].id);

  const [focusMode, setFocusMode] = useState<boolean>(() => localStorage.getItem(FOCUS_MODE_STORAGE_KEY) === 'true');
  const [distractionFree, setDistractionFree] = useState<boolean>(
    () => localStorage.getItem(DISTRACTION_FREE_STORAGE_KEY) === 'true'
  );

  const [themeBuilderOpen, setThemeBuilderOpen] = useState(false);

  const activeDocument = useMemo(() => documents.find((d) => d.id === activeId) ?? documents[0], [activeId, documents]);

  const activeHtml = useMemo(() => renderMarkdown(activeDocument.content), [activeDocument.content]);

  const fileName = useMemo(() => fileNameFromPath(activeDocument.filePath), [activeDocument.filePath]);

  const stats = useMemo(() => {
    const words = wordCount(activeDocument.content);
    return {
      words,
      characters: activeDocument.content.length,
      readingMinutes: readingTimeMinutes(words)
    };
  }, [activeDocument.content]);

  useEffect(() => {
    localStorage.setItem(FOCUS_MODE_STORAGE_KEY, focusMode ? 'true' : 'false');
  }, [focusMode]);

  useEffect(() => {
    localStorage.setItem(DISTRACTION_FREE_STORAGE_KEY, distractionFree ? 'true' : 'false');
  }, [distractionFree]);

  const updateWindowTitle = useCallback(async (nextFilePath: string | null, nextDirty: boolean) => {
    await window.electronAPI?.setTitle({ filePath: nextFilePath, dirty: nextDirty });
  }, []);

  useEffect(() => {
    void updateWindowTitle(activeDocument.filePath, activeDocument.dirty);
  }, [activeDocument.dirty, activeDocument.filePath, updateWindowTitle]);

  const setActiveDocument = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const createNewDocument = useCallback(() => {
    const doc: DocumentTab = { id: createId(), filePath: null, content: '', dirty: false };
    setDocuments((prev) => [doc, ...prev]);
    setActiveId(doc.id);
  }, []);

  const closeDocument = useCallback(
    (id: string) => {
      const doc = documents.find((d) => d.id === id);
      if (!doc) return;

      if (doc.dirty) {
        const ok = window.confirm(`Close \"${fileNameFromPath(doc.filePath)}\" without saving?`);
        if (!ok) return;
      }

      let nextActiveId: string | null = null;

      setDocuments((prev) => {
        const next = prev.filter((d) => d.id !== id);
        if (next.length === 0) {
          const fresh = { id: createId(), filePath: null, content: '', dirty: false };
          nextActiveId = fresh.id;
          return [fresh];
        }

        nextActiveId = next[0].id;
        return next;
      });

      setActiveId((prev) => (prev === id ? nextActiveId ?? prev : prev));
    },
    [documents]
  );


  const handleOpen = useCallback(async () => {
    const result = await window.electronAPI?.openFile();
    if (!result) return;

    setDocuments((prev) => {
      const existing = prev.find((d) => d.filePath === result.filePath);
      if (existing) {
        setActiveId(existing.id);
        return prev;
      }

      const canReuseActive =
        activeDocument.filePath == null &&
        !activeDocument.dirty &&
        (activeDocument.content === '' || activeDocument.content === SAMPLE_CONTENT);

      if (canReuseActive) {
        return prev.map((d) =>
          d.id === activeDocument.id
            ? { ...d, filePath: result.filePath, content: result.content, dirty: false }
            : d
        );
      }

      const doc: DocumentTab = { id: createId(), filePath: result.filePath, content: result.content, dirty: false };
      setActiveId(doc.id);
      return [doc, ...prev];
    });
  }, [activeDocument]);

  const handleSave = useCallback(async () => {
    if (!window.electronAPI) return;

    const doc = activeDocument;
    if (doc.filePath) {
      const result = await window.electronAPI.saveFile({ filePath: doc.filePath, content: doc.content });
      if (!result) return;
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, dirty: false } : d)));
      return;
    }

    const result = await window.electronAPI.saveFileAs({ content: doc.content, suggestedName: `${fileName}.md` });
    if (!result) return;

    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, filePath: result.filePath, dirty: false } : d))
    );
  }, [activeDocument, fileName]);

  const handleSaveAs = useCallback(async () => {
    if (!window.electronAPI) return;

    const doc = activeDocument;
    const suggestedName = doc.filePath ? fileNameFromPath(doc.filePath) : `${fileName}.md`;

    const result = await window.electronAPI.saveFileAs({
      content: doc.content,
      suggestedName
    });

    if (!result) return;

    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, filePath: result.filePath, dirty: false } : d))
    );
  }, [activeDocument, fileName]);

  const exportBaseName = useMemo(() => {
    return fileName.replace(/\.(md|markdown|mdx|txt)$/i, '') || 'Untitled';
  }, [fileName]);

  const exportOverrides = useMemo(() => activeTheme?.variables ?? undefined, [activeTheme]);

  const handleExportHtml = useCallback(async () => {
    if (!window.electronAPI) return;

    const exportHtml = buildExportHtml({
      title: exportBaseName,
      theme,
      bodyHtml: activeHtml,
      cssVariablesOverride: exportOverrides
    });

    await window.electronAPI.exportHtml({
      html: exportHtml,
      suggestedName: `${exportBaseName}.html`
    });
  }, [activeHtml, exportBaseName, exportOverrides, theme]);

  const handleExportPdf = useCallback(async () => {
    if (!window.electronAPI) return;

    const exportHtml = buildExportHtml({
      title: exportBaseName,
      theme,
      bodyHtml: activeHtml,
      cssVariablesOverride: exportOverrides
    });

    await window.electronAPI.exportPdf({
      html: exportHtml,
      suggestedName: `${exportBaseName}.pdf`
    });
  }, [activeHtml, exportBaseName, exportOverrides, theme]);

  const handleContentChange = useCallback((nextContent: string) => {
    setDocuments((prev) => prev.map((d) => (d.id === activeDocument.id ? { ...d, content: nextContent, dirty: true } : d)));
  }, [activeDocument.id]);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => !prev);
  }, []);

  const toggleDistractionFree = useCallback(() => {
    setDistractionFree((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modKey = event.metaKey || event.ctrlKey;

      if (modKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void (event.shiftKey ? handleSaveAs() : handleSave());
      }

      if (modKey && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        void handleOpen();
      }

      if (modKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        createNewDocument();
      }

      if (modKey && event.key.toLowerCase() === 'w') {
        event.preventDefault();
        closeDocument(activeDocument.id);
      }

      if (modKey && event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        toggleFocusMode();
      }

      if (modKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        toggleDistractionFree();
      }

      if (modKey && event.key === ',') {
        event.preventDefault();
        setThemeBuilderOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [activeDocument.id, closeDocument, createNewDocument, handleOpen, handleSave, handleSaveAs, toggleDistractionFree, toggleFocusMode]);

  useEffect(() => {
    if (!window.electronAPI) return;

    const offOpen = window.electronAPI.onMenu('menu:open', () => void handleOpen());
    const offSave = window.electronAPI.onMenu('menu:save', () => void handleSave());
    const offSaveAs = window.electronAPI.onMenu('menu:saveAs', () => void handleSaveAs());

    return () => {
      offOpen();
      offSave();
      offSaveAs();
    };
  }, [handleOpen, handleSave, handleSaveAs]);

  const tabDocs = useMemo(() => {
    return documents.map((d) => ({ id: d.id, title: fileNameFromPath(d.filePath), dirty: d.dirty }));
  }, [documents]);

  return (
    <>
      {!distractionFree ? (
        <Toolbar
          theme={theme}
          fileName={fileName}
          dirty={activeDocument.dirty}
          onToggleTheme={toggleTheme}
          onOpen={handleOpen}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onExportHtml={handleExportHtml}
          onExportPdf={handleExportPdf}
          keybindingMode={keybindingMode}
          onToggleKeybindingMode={cycleKeybindingMode}
          focusMode={focusMode}
          onToggleFocusMode={toggleFocusMode}
          onToggleDistractionFree={toggleDistractionFree}
          onOpenThemeBuilder={() => setThemeBuilderOpen(true)}
        />
      ) : null}

      <TabBar
        documents={tabDocs}
        activeId={activeDocument.id}
        onSelect={setActiveDocument}
        onClose={closeDocument}
        onNew={createNewDocument}
      />

      <SplitPane
        showRight={!focusMode}
        left={
          <Editor
            content={activeDocument.content}
            onChange={handleContentChange}
            onRequestOpen={handleOpen}
            onRequestSave={handleSave}
            keybindingMode={keybindingMode}
            theme={theme}
          />
        }
        right={<Preview html={activeHtml} />}
      />

      <StatusBar words={stats.words} characters={stats.characters} readingTimeMinutes={stats.readingMinutes} />

      <ThemeBuilder
        isOpen={themeBuilderOpen}
        onClose={() => {
          setThemeBuilderOpen(false);
          previewVariables(activeTheme?.variables ?? {});
        }}
        themes={customThemes}
        activeThemeId={activeThemeId}
        activeTheme={activeTheme}
        onSelectTheme={setActiveTheme}
        onDeleteTheme={deleteTheme}
        onSaveTheme={(name, variables) => {
          addTheme({ name, variables });
        }}
        onPreviewVariables={previewVariables}
      />
    </>
  );
};
