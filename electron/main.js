const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // Security best practice
            contextIsolation: true,
        }
    });

    mainWindow.loadURL('http://localhost:3000'); // React Dev Server
});

ipcMain.handle('ping', async () => {
    return 'Pong from Electron!';
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
