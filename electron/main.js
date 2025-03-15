const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;
const dataFile = path.join(__dirname, "data.json");

// Ensure the JSON file exists
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ workouts: [], templates: [], exercises: [] }, null, 2));
}

// Function to load data
const loadData = () => {
    try {
        const fileData = fs.readFileSync(dataFile);
        return JSON.parse(fileData);
    } catch (error) {
        console.error("⚠️ Error reading JSON file:", error);
        return { workouts: [], templates: [], exercises: [] };
    }
};

// Function to save data
const saveData = (data) => {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadURL("http://localhost:3000");
});

// ✅ Register IPC handlers properly
ipcMain.handle("getData", () => loadData());
ipcMain.handle("saveData", (_, newData) => saveData(newData));
