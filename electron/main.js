const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const dataFilePath = path.join(app.getPath('userData'), 'data.json');

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

    mainWindow.loadURL('http://localhost:3000'); // React Frontend
});

// 📌 Function to Read Data from JSON File
const readData = () => {
    if (!fs.existsSync(dataFilePath)) {
        return { message: "No data found" };
    }
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
};

// 📌 Function to Write Data to JSON File
const writeData = (newData) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), 'utf-8');
};

// 📌 IPC: React asks for data
ipcMain.handle('read-json', async () => {
    return readData();
});

// 📌 IPC: React sends data to save
ipcMain.handle('write-json', async (event, newData) => {
    writeData(newData);
    return { status: "success", message: "Data saved successfully!" };
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
