const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  // WICHTIG: dein preload.js wird hier geladen
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);

// IPC Handler für Weights-Dialog
ipcMain.handle('dialog:openWeights', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'YOLO Weights', extensions: ['pt'] }]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// App schließen wenn alle Fenster zu sind
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
