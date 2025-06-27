const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn }                      = require('child_process');
const path                           = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration:  false,
      preload:          path.join(__dirname, 'preload.js'),
    }
  });
  win.loadFile(path.join(__dirname, '..', 'dist-render', 'index.html'));
}

app.whenReady().then(() => {
  // 1) compute where your backend script really lives after packaging:
  const backendScript = path.join(
    process.resourcesPath,
    'app.asar.unpacked',  // <--- note, unpacked
    'backend',
    'app.py'
  );

  // 2) spawn python3 with that script
  try {
    console.log('▶️  Spawning backend:', backendScript);
    const pythonExe = 'python3'; // or an absolute path if you bundle one
    const backend = spawn(pythonExe, [backendScript], {
      detached: true,
      stdio:   'ignore',
      shell:   false
    });
    backend.unref();
    console.log('✅ Backend started');
  } catch (err) {
    console.error('❌ Backend start failed:', err);
  }

  // 3) register your IPC handler for weight selection
  ipcMain.handle('dialog:openWeights', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters:    [{ name: 'YOLO Weights', extensions: ['pt'] }]
    });
    return (!canceled && filePaths[0]) || null;
  });

  // 4) finally launch the UI
  createWindow();
  console.log('✅ Electron Main started');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
