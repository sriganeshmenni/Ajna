const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

// Auto-grant media streaming & camera/mic device permissions
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#07050e',
    center: true,
    title: 'Ajna — Multimodal Human Evaluation Intelligence',
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false
    }
  });

  mainWindow.show();
  mainWindow.focus();

  const devUrl = 'http://localhost:5173';
  const distPath = path.join(__dirname, '../frontend/dist/index.html');

  // Try loading Vite dev server first; on any failure immediately load prebuilt dist
  mainWindow.loadURL(devUrl).then(() => {
    console.log('[Ajna] Connected to Vite on ' + devUrl);
    mainWindow.show();
    mainWindow.focus();
  }).catch((err) => {
    console.log('[Ajna] Loading local production bundle: ' + distPath);
    mainWindow.loadFile(distPath).then(() => {
      mainWindow.show();
      mainWindow.focus();
    }).catch((e) => {
      console.error('[Ajna] Failed to load dist bundle:', e);
    });
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Ajna] UI rendered and displayed.');
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized-state', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized-state', false);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window control IPC handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

app.whenReady().then(() => {
  if (session && session.defaultSession) {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      callback(true);
    });
    session.defaultSession.setPermissionCheckHandler(() => true);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
