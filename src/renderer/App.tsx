import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { SplitPane } from './components/SplitPane';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { useTheme } from './hooks/useTheme';
import { useMarkdown } from './hooks/useMarkdown';
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

function fileNameFromPath(filePath: string | null): string {
  if (!filePath) return 'Untitled';
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] || 'Untitled';
}

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { content, html, updateContent } = useMarkdown(SAMPLE_CONTENT);

  const [filePath, setFilePath] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const fileName = useMemo(() => fileNameFromPath(filePath), [filePath]);

  const updateWindowTitle = useCallback(async (nextFilePath: string | null, nextDirty: boolean) => {
    await window.electronAPI?.setTitle({ filePath: nextFilePath, dirty: nextDirty });
  }, []);

  useEffect(() => {
    void updateWindowTitle(filePath, dirty);
  }, [dirty, filePath, updateWindowTitle]);

  const handleOpen = useCallback(async () => {
    const result = await window.electronAPI?.openFile();
    if (!result) return;

    setFilePath(result.filePath);
    setDirty(false);
    updateContent(result.content);
  }, [updateContent]);

  const handleSave = useCallback(async () => {
    if (!window.electronAPI) return;

    if (filePath) {
      const result = await window.electronAPI.saveFile({ filePath, content });
      if (!result) return;
      setDirty(false);
      return;
    }

    const result = await window.electronAPI.saveFileAs({ content, suggestedName: 'Untitled.md' });
    if (!result) return;

    setFilePath(result.filePath);
    setDirty(false);
  }, [content, filePath]);

  const handleSaveAs = useCallback(async () => {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.saveFileAs({
      content,
      suggestedName: filePath ? fileName : 'Untitled.md'
    });

    if (!result) return;

    setFilePath(result.filePath);
    setDirty(false);
  }, [content, fileName, filePath]);

  const handleContentChange = useCallback(
    (nextContent: string) => {
      updateContent(nextContent);
      setDirty(true);
    },
    [updateContent]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const modKey = isMac ? event.metaKey : event.ctrlKey;
      if (!modKey) return;

      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        void (event.shiftKey ? handleSaveAs() : handleSave());
      }

      if (event.key.toLowerCase() === 'o') {
        event.preventDefault();
        void handleOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleOpen, handleSave, handleSaveAs]);

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

  return (
    <>
      <Toolbar
        theme={theme}
        fileName={fileName}
        dirty={dirty}
        onToggleTheme={toggleTheme}
        onOpen={handleOpen}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
      />
      <SplitPane
        left={
          <Editor
            initialContent={content}
            onChange={handleContentChange}
            onRequestOpen={handleOpen}
            onRequestSave={handleSave}
            theme={theme}
          />
        }
        right={<Preview html={html} />}
      />
    </>
  );
};
