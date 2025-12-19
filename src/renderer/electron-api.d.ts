export {};

declare global {
  interface Window {
    electronAPI?: {
      openFile: () => Promise<{ filePath: string; content: string } | null>;
      saveFile: (args: { filePath: string; content: string }) => Promise<{ filePath: string } | null>;
      saveFileAs: (args: { content: string; suggestedName?: string }) => Promise<{ filePath: string } | null>;
      setTitle: (args: { filePath: string | null; dirty: boolean }) => Promise<void>;
      onMenu: (event: 'menu:open' | 'menu:save' | 'menu:saveAs', callback: () => void) => () => void;
    };
  }
}
