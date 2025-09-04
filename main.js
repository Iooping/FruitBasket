const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs'), path = require('path');
const SHARED_DIR = 'C:\\ProgramData\\FruitBasket';

function ensureSharedDir() {
  if (!fs.existsSync(SHARED_DIR)) {
    fs.mkdirSync(SHARED_DIR, { recursive: true });
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 60, height: 60,
    frame: false, transparent: true, alwaysOnTop: true,
    resizable: false, skipTaskbar: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  ensureSharedDir();
  createWindow();
});

ipcMain.handle('copy-file', async (event, srcPath) => {
  const fileName = path.basename(srcPath);
  const dest = path.join(SHARED_DIR, fileName);
  await copyWithProgress(srcPath, dest, pct => {
    event.sender.send('copy-progress', { fileName, pct });
  });
  return { success: true, fileName };
});

function copyWithProgress(src, dest, onProgress) {
  return new Promise((resolve, reject) => {
    const total = fs.statSync(src).size;
    let transferred = 0;
    const reader = fs.createReadStream(src);
    const writer = fs.createWriteStream(dest);
    reader.on('data', chunk => {
      transferred += chunk.length;
      onProgress(transferred / total);
    });
    reader.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
