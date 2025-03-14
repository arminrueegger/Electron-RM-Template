const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    readJson: () => ipcRenderer.invoke('read-json'),
    writeJson: (data) => ipcRenderer.invoke('write-json', data)
});
