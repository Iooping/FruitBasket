const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

// Define the shared directory path
const SHARED_DIR = 'C:\\ProgramData\\FruitBasket';

// Function to create the main application window
const createWindow = () => {
//    const win = new BrowserWindow({
//        width: 400,
//        height: 300,
 //       frame: false,
 //       transparent: true,
 //       alwaysOnTop: true,
 //       resizable: true,
//        skipTaskbar: true,
//        webPreferences: {
 //           preload: path.join(__dirname, 'preload.js'),
 //           nodeIntegration: false,
 //           contextIsolation: true
  //      }
  //  });
    // In main.js
const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true
    }
});

    win.loadFile('index.html');
    win.center();
    // Open DevTools for debugging
    // win.webContents.openDevTools();
};

// Create the shared directory if it doesn't exist
const createSharedDir = () => {
    if (!fs.existsSync(SHARED_DIR)) {
        console.log(`Creating directory: ${SHARED_DIR}`);
        fs.mkdirSync(SHARED_DIR, { recursive: true });
    }
};

// Application lifecycle events
app.whenReady().then(() => {
    createSharedDir();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Set up IPC for file watching
ipcMain.on('start-file-watcher', (event) => {
    console.log('Starting file watcher...');

    // Initial file scan
    fs.readdir(SHARED_DIR, (err, files) => {
        if (err) {
            console.error('Error reading shared directory:', err);
            return;
        }
        event.sender.send('initial-file-list', files);
    });

    // Watch for new files
    const watcher = chokidar.watch(SHARED_DIR, { ignoreInitial: true });
    watcher.on('add', (filePath) => {
        const filename = path.basename(filePath);
        event.sender.send('new-file-added', filename);
    });

    console.log(`Watching directory: ${SHARED_DIR}`);
});
