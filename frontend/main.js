const { app, BrowserWindow, dialog, ipcMain } = require('electron');

ipcMain.handle('dialog:openWeights', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'YOLO Weights', extensions: ['pt'] }]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]; // absoluter Pfad
  }
  return null;
});
