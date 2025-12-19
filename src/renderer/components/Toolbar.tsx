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
}

export const Toolbar: React.FC<ToolbarProps> = ({
  theme,
  fileName,
  dirty,
  onToggleTheme,
  onOpen,
  onSave,
  onSaveAs
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

        <div className="toolbar-divider" />

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </div>
  );
};
