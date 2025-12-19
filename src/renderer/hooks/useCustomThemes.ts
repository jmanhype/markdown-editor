import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface CustomTheme {
  id: string;
  name: string;
  variables: Record<string, string>;
}

const CUSTOM_THEMES_STORAGE_KEY = 'markdown-editor-custom-themes';
const ACTIVE_CUSTOM_THEME_STORAGE_KEY = 'markdown-editor-active-custom-theme';

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useCustomThemes() {
  const [themes, setThemes] = useState<CustomTheme[]>(() => {
    const parsed = safeParseJson<CustomTheme[]>(localStorage.getItem(CUSTOM_THEMES_STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  });

  const [activeThemeId, setActiveThemeId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_CUSTOM_THEME_STORAGE_KEY);
  });

  const appliedKeysRef = useRef<Set<string>>(new Set());

  const activeTheme = useMemo(() => {
    if (!activeThemeId) return null;
    return themes.find((t) => t.id === activeThemeId) ?? null;
  }, [activeThemeId, themes]);

  const clearAppliedVariables = useCallback(() => {
    const root = document.documentElement;
    for (const key of appliedKeysRef.current) {
      root.style.removeProperty(key);
    }
    appliedKeysRef.current.clear();
  }, []);

  const applyVariables = useCallback((variables: Record<string, string>) => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(variables)) {
      if (!key.startsWith('--')) continue;
      if (!value) continue;
      root.style.setProperty(key, value);
      appliedKeysRef.current.add(key);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(themes));
  }, [themes]);

  useEffect(() => {
    if (activeThemeId) localStorage.setItem(ACTIVE_CUSTOM_THEME_STORAGE_KEY, activeThemeId);
    else localStorage.removeItem(ACTIVE_CUSTOM_THEME_STORAGE_KEY);
  }, [activeThemeId]);

  useEffect(() => {
    clearAppliedVariables();
    if (activeTheme) {
      applyVariables(activeTheme.variables);
    }
  }, [activeTheme, applyVariables, clearAppliedVariables]);

  const addTheme = useCallback((args: { name: string; variables: Record<string, string> }) => {
    const theme: CustomTheme = {
      id: createId(),
      name: args.name,
      variables: args.variables
    };

    setThemes((prev) => [theme, ...prev]);
    setActiveThemeId(theme.id);
    return theme;
  }, []);

  const updateTheme = useCallback((id: string, updates: Partial<Pick<CustomTheme, 'name' | 'variables'>>) => {
    setThemes((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTheme = useCallback((id: string) => {
    setThemes((prev) => prev.filter((t) => t.id !== id));
    setActiveThemeId((prev) => (prev === id ? null : prev));
  }, []);

  const setActiveTheme = useCallback((id: string | null) => {
    setActiveThemeId(id);
  }, []);

  const previewVariables = useCallback(
    (variables: Record<string, string>) => {
      clearAppliedVariables();
      applyVariables(variables);
    },
    [applyVariables, clearAppliedVariables]
  );

  return {
    themes,
    activeTheme,
    activeThemeId,
    addTheme,
    updateTheme,
    deleteTheme,
    setActiveTheme,
    previewVariables
  };
}
