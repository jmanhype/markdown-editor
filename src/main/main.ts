import { BrowserWindow, Menu, app, dialog, ipcMain, shell } from 'electron';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Theme = 'light' | 'dark';

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

function getAppTitle({ filePath, dirty }: SetTitleArgs): string {
  const baseName = filePath ? path.basename(filePath) : 'Untitled';
  const dirtyMark = dirty ? '• ' : '';
  return `${dirtyMark}${baseName} — Markdown Editor`;
}

function getRendererUrl(): string | null {
  if (process.env.ELECTRON_RENDERER_URL) return process.env.ELECTRON_RENDERER_URL;
  if (process.env.VITE_DEV_SERVER_URL) return process.env.VITE_DEV_SERVER_URL;
  return app.isPackaged ? null : 'http://localhost:5173';
}

async function createMainWindow(): Promise<BrowserWindow> {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    title: getAppTitle({ filePath: null, dirty: false }),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });

  const rendererUrl = getRendererUrl();
  if (rendererUrl) {
    await mainWindow.loadURL(rendererUrl);
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return mainWindow;
}

function buildMenu(mainWindow: BrowserWindow): Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open…',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu:open')
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu:save')
        },
        {
          label: 'Save As…',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow.webContents.send('menu:saveAs')
        },
        { type: 'separator' },
        { role: process.platform === 'darwin' ? 'close' : 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
}

function registerIpcHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle('file:open', async (): Promise<OpenFileResult> => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'mdx', 'txt'] }]
    });

    if (result.canceled || result.filePaths.length === 0) return null;

    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, 'utf8');

    mainWindow.setTitle(getAppTitle({ filePath, dirty: false }));
    return { filePath, content };
  });

  ipcMain.handle('file:save', async (_event, args: SaveFileArgs): Promise<SaveFileResult> => {
    await fs.writeFile(args.filePath, args.content, 'utf8');
    mainWindow.setTitle(getAppTitle({ filePath: args.filePath, dirty: false }));
    return { filePath: args.filePath };
  });

  ipcMain.handle('file:saveAs', async (_event, args: SaveFileAsArgs): Promise<SaveFileResult> => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: args.suggestedName ?? 'Untitled.md',
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'mdx', 'txt'] }]
    });

    if (result.canceled || !result.filePath) return null;

    await fs.writeFile(result.filePath, args.content, 'utf8');
    mainWindow.setTitle(getAppTitle({ filePath: result.filePath, dirty: false }));
    return { filePath: result.filePath };
  });

  ipcMain.handle('app:setTitle', async (_event, args: SetTitleArgs) => {
    mainWindow.setTitle(getAppTitle(args));
  });

  ipcMain.handle('app:setTheme', async (_event, theme: Theme) => {
    mainWindow.webContents.send('theme:changed', theme);
  });
}

app.whenReady().then(async () => {
  const mainWindow = await createMainWindow();
  registerIpcHandlers(mainWindow);

  const menu = buildMenu(mainWindow);
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
