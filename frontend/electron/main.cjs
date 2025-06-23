const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile(path.join(__dirname, '..', 'dist-render', 'index.html'));
  // win.webContents.openDevTools(); // optional for debugging
}

app.whenReady().then(() => {
  // Start backend
  const backendPath = path.join(__dirname, '..', 'backend', 'build', 'app.exe');
  try {
    const backend = spawn(backendPath, {
      detached: true,
      stdio: 'ignore',
      shell: true
    });
    backend.unref();
    console.log("✅ Backend gestartet");
  } catch (err) {
    console.error('❌ Backend start failed:', err);
  }

  // IPC handler for weight file selection
  ipcMain.handle('dialog:openWeights', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'YOLO Weights', extensions: ['pt'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0];
      const fileName = path.basename(selectedPath);
      const targetDir = path.join(__dirname, '../../', 'falcon-vision-models');
      const targetPath = path.join(targetDir, fileName);

      try {
        fs.mkdirSync(targetDir, { recursive: true });
        fs.copyFileSync(selectedPath, targetPath);
        console.log("✅ Copied model to:", targetPath);
        return targetPath;
      } catch (err) {
        console.error("❌ Failed to copy weights file:", err);
        return null;
      }
    }

    return null;
  });

  createWindow();
  console.log("✅ Electron Main gestartet");
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
