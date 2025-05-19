const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectWeights: () => ipcRenderer.invoke('dialog:openWeights')
});
