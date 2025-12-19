import { useCallback, useEffect, useState } from 'react';

export type KeybindingMode = 'default' | 'vim' | 'emacs';

const KEYBINDING_MODE_STORAGE_KEY = 'markdown-editor-keybinding-mode';

export function useKeybindingMode() {
  const [keybindingMode, setKeybindingMode] = useState<KeybindingMode>(() => {
    const stored = localStorage.getItem(KEYBINDING_MODE_STORAGE_KEY) as KeybindingMode | null;
    if (stored === 'vim' || stored === 'emacs' || stored === 'default') return stored;
    return 'default';
  });

  useEffect(() => {
    localStorage.setItem(KEYBINDING_MODE_STORAGE_KEY, keybindingMode);
  }, [keybindingMode]);

  const cycleKeybindingMode = useCallback(() => {
    setKeybindingMode((prev) => {
      if (prev === 'default') return 'vim';
      if (prev === 'vim') return 'emacs';
      return 'default';
    });
  }, []);

  return { keybindingMode, setKeybindingMode, cycleKeybindingMode };
}
