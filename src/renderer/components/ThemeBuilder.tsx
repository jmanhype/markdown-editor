import React, { useEffect, useMemo, useState } from 'react';
import { CustomTheme } from '../hooks/useCustomThemes';
import './ThemeBuilder.css';

const THEME_VARIABLES: Array<{ key: string; label: string }> = [
  { key: '--bg-primary', label: 'Background (primary)' },
  { key: '--bg-secondary', label: 'Background (secondary)' },
  { key: '--bg-tertiary', label: 'Background (tertiary)' },
  { key: '--fg-primary', label: 'Text (primary)' },
  { key: '--fg-secondary', label: 'Text (secondary)' },
  { key: '--fg-tertiary', label: 'Text (tertiary)' },
  { key: '--accent-primary', label: 'Accent (primary)' },
  { key: '--accent-secondary', label: 'Accent (secondary)' },
  { key: '--border-subtle', label: 'Border (subtle)' },
  { key: '--border-default', label: 'Border (default)' },
  { key: '--editor-bg', label: 'Editor background' },
  { key: '--editor-fg', label: 'Editor text' },
  { key: '--preview-bg', label: 'Preview background' },
  { key: '--preview-fg', label: 'Preview text' },
  { key: '--preview-heading', label: 'Preview headings' },
  { key: '--preview-link', label: 'Preview links' }
];

function readCurrentVariables(): Record<string, string> {
  const style = getComputedStyle(document.documentElement);
  const result: Record<string, string> = {};
  for (const { key } of THEME_VARIABLES) {
    result[key] = style.getPropertyValue(key).trim();
  }
  return result;
}

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

export const ThemeBuilder: React.FC<ThemeBuilderProps> = ({
  isOpen,
  onClose,
  themes,
  activeThemeId,
  activeTheme,
  onSelectTheme,
  onDeleteTheme,
  onSaveTheme,
  onPreviewVariables
}) => {
  const [name, setName] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});

  const selectedPreset = useMemo(() => {
    if (!activeThemeId) return null;
    return themes.find((t) => t.id === activeThemeId) ?? null;
  }, [activeThemeId, themes]);

  useEffect(() => {
    if (!isOpen) return;

    const base = selectedPreset?.variables ?? readCurrentVariables();
    setName(selectedPreset?.name ?? '');
    setVariables(base);
  }, [isOpen, selectedPreset]);

  useEffect(() => {
    if (!isOpen) return;
    onPreviewVariables(variables);
  }, [isOpen, onPreviewVariables, variables]);

  if (!isOpen) return null;

  return (
    <div className="theme-builder-overlay" role="dialog" aria-label="Theme builder">
      <div className="theme-builder">
        <div className="theme-builder-header">
          <div className="theme-builder-title">
            <div className="theme-builder-heading">Theme</div>
            <div className="theme-builder-subtitle">Customize colors via CSS variables</div>
          </div>
          <button className="theme-builder-close" onClick={onClose} aria-label="Close theme builder">
            ×
          </button>
        </div>

        <div className="theme-builder-section">
          <label className="theme-builder-label">Saved</label>
          <div className="theme-builder-row">
            <select
              className="theme-builder-select"
              value={activeThemeId ?? ''}
              onChange={(e) => onSelectTheme(e.target.value ? e.target.value : null)}
              aria-label="Select saved theme"
            >
              <option value="">None (default)</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <button
              className="theme-builder-button"
              onClick={() => {
                setName('');
                setVariables(readCurrentVariables());
                onSelectTheme(null);
              }}
            >
              Reset
            </button>

            <button
              className="theme-builder-button danger"
              disabled={!activeTheme}
              onClick={() => {
                if (!activeTheme) return;
                const ok = window.confirm(`Delete theme "${activeTheme.name}"?`);
                if (!ok) return;
                onDeleteTheme(activeTheme.id);
              }}
            >
              Delete
            </button>
          </div>
        </div>

        <div className="theme-builder-section">
          <label className="theme-builder-label">Save as</label>
          <div className="theme-builder-row">
            <input
              className="theme-builder-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Theme name"
              aria-label="Theme name"
            />
            <button
              className="theme-builder-button primary"
              disabled={!name.trim()}
              onClick={() => {
                const nextName = name.trim();
                if (!nextName) return;
                onSaveTheme(nextName, variables);
              }}
            >
              Save
            </button>
          </div>
        </div>

        <div className="theme-builder-variables">
          {THEME_VARIABLES.map(({ key, label }) => (
            <div key={key} className="theme-variable">
              <div className="theme-variable-label">{label}</div>
              <div className="theme-variable-controls">
                <input
                  className="theme-variable-color"
                  type="color"
                  value={variables[key] || '#000000'}
                  onChange={(e) =>
                    setVariables((prev) => ({
                      ...prev,
                      [key]: e.target.value
                    }))
                  }
                  aria-label={`${label} color`}
                />
                <input
                  className="theme-variable-text"
                  value={variables[key] ?? ''}
                  onChange={(e) =>
                    setVariables((prev) => ({
                      ...prev,
                      [key]: e.target.value
                    }))
                  }
                  spellCheck={false}
                  aria-label={`${label} value`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
