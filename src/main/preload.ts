import { contextBridge, ipcRenderer } from 'electron';

type OpenFileResult = {
  filePath: string;
  content: string;
} | null;

type SaveFileArgs = {
  filePath: string;
  content: string;
};

type SaveFileAsArgs = {
  content: string;
  suggestedName?: string;
};

type SaveFileResult = {
  filePath: string;
} | null;

type SetTitleArgs = {
  filePath: string | null;
  dirty: boolean;
};

type MenuEvent = 'menu:open' | 'menu:save' | 'menu:saveAs';

type Unsubscribe = () => void;

const electronAPI = {
  openFile: (): Promise<OpenFileResult> => ipcRenderer.invoke('file:open'),
  saveFile: (args: SaveFileArgs): Promise<SaveFileResult> => ipcRenderer.invoke('file:save', args),
  saveFileAs: (args: SaveFileAsArgs): Promise<SaveFileResult> => ipcRenderer.invoke('file:saveAs', args),
  setTitle: (args: SetTitleArgs): Promise<void> => ipcRenderer.invoke('app:setTitle', args),
  onMenu: (event: MenuEvent, callback: () => void): Unsubscribe => {
    const handler = () => callback();
    ipcRenderer.on(event, handler);
    return () => ipcRenderer.removeListener(event, handler);
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
