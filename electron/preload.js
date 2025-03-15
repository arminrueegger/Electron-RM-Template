const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    getData: () => ipcRenderer.invoke("getData"),
    saveData: (data) => ipcRenderer.invoke("saveData", data),
});
