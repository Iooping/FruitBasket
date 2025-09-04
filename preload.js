const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startFileWatcher: () => ipcRenderer.send('start-file-watcher'),
    onInitialFileList: (callback) => ipcRenderer.on('initial-file-list', (_event, files) => callback(files)),
    onNewFileAdded: (callback) => ipcRenderer.on('new-file-added', (_event, filename) => callback(filename))
});
