const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

const SHARED_DIR = 'C:\\ProgramData\\FruitBasket';

const createWindow = () => {
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
  win.webContents.openDevTools(); // This is crucial for debugging
};

const createSharedDir = () => {
  if (!fs.existsSync(SHARED_DIR)) {
    console.log(`Creating directory: ${SHARED_DIR}`);
    fs.mkdirSync(SHARED_DIR, { recursive: true });
  }
};

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

ipcMain.on('start-file-watcher', (event) => {
  console.log('Starting file watcher...');

  fs.readdir(SHARED_DIR, (err, files) => {
    if (err) {
      console.error('Error reading shared directory:', err);
      return;
    }
    event.sender.send('initial-file-list', files);
  });

  const watcher = chokidar.watch(SHARED_DIR, { ignoreInitial: true });
  watcher.on('add', (filePath) => {
    const filename = path.basename(filePath);
    event.sender.send('new-file-added', filename);
  });

  console.log(`Watching directory: ${SHARED_DIR}`);
});
