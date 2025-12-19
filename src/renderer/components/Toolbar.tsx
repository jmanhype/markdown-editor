import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Theme } from '../hooks/useTheme';
import './Toolbar.css';

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

export const Toolbar: React.FC<ToolbarProps> = ({
  theme,
  fileName,
  dirty,
  onToggleTheme,
  onOpen,
  onSave,
  onSaveAs,
  onExportPdf,
  onExportHtml,
  keybindingMode,
  onToggleKeybindingMode,
  focusMode,
  onToggleFocusMode,
  onToggleDistractionFree,
  onOpenThemeBuilder
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-section toolbar-left">
        <div className="toolbar-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="toolbar-app-name">Markdown Editor</span>
          <span className="toolbar-file-name" title={fileName}>
            {dirty ? '• ' : ''}{fileName}
          </span>
        </div>
      </div>

      <div className="toolbar-section toolbar-center"></div>

      <div className="toolbar-section toolbar-right">
        <button className="toolbar-button" onClick={onOpen} title="Open (Cmd/Ctrl+O)" aria-label="Open file">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button className="toolbar-button" onClick={onSave} title="Save (Cmd/Ctrl+S)" aria-label="Save file">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 21v-8H7v8M7 3v5h8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button className="toolbar-button" onClick={onSaveAs} title="Save As (Cmd/Ctrl+Shift+S)" aria-label="Save file as">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 20h9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button className="toolbar-button" onClick={onExportHtml} title="Export HTML" aria-label="Export HTML">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2v6h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 15h6M9 19h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button className="toolbar-button" onClick={onExportPdf} title="Export PDF" aria-label="Export PDF">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2v6h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 16h2.5a1.5 1.5 0 1 0 0-3H8v6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13 13h2a1 1 0 0 1 1 1v4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className="toolbar-button"
          onClick={onToggleKeybindingMode}
          title={`Keybindings: ${keybindingMode} (click to cycle)`}
          aria-label="Cycle keybinding mode"
        >
          <span className="toolbar-keymap-badge">
            {keybindingMode === 'default' ? 'Std' : keybindingMode === 'vim' ? 'Vim' : 'Emacs'}
          </span>
        </button>

        <button
          className="toolbar-button"
          onClick={onToggleFocusMode}
          title="Focus mode (Cmd/Ctrl+Shift+L)"
          aria-label="Toggle focus mode"
          aria-pressed={focusMode}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className="toolbar-button"
          onClick={onToggleDistractionFree}
          title="Distraction-free (Cmd/Ctrl+Shift+D)"
          aria-label="Toggle distraction-free mode"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M7 7h10M7 17h10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          className="toolbar-button"
          onClick={onOpenThemeBuilder}
          title="Theme builder (Cmd/Ctrl+,)"
          aria-label="Open theme builder"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3a9 9 0 1 0 9 9c0-.55-.06-1.09-.18-1.61a3 3 0 0 0-3.7-3.7A6 6 0 0 1 12 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8.5" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="7.5" r="1" fill="currentColor" />
            <circle cx="15.5" cy="10" r="1" fill="currentColor" />
            <circle cx="10" cy="14.5" r="1" fill="currentColor" />
          </svg>
        </button>

        <div className="toolbar-divider" />

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </div>
  );
};
