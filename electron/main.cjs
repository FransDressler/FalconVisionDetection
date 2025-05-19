const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');


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

  // win.webContents.openDevTools(); // optional für Debug
}

app.whenReady().then(() => {
  const backendPath = path.join(__dirname, '..', 'backend', 'build', 'app.exe');
  try {
    const backend = spawn(backendPath, {
      detached: true,
      stdio: 'ignore',
      shell: true
    });
    backend.unref();
  } catch (err) {
    console.error('❌ Backend start failed:', err);
  }

  createWindow();
  console.log("✅ Electron Main gestartet");
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
