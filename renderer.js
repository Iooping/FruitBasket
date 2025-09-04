const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const SHARED_DIR = 'C:\\ProgramData\\FruitBasket';
const { ipcRenderer } = require('electron');
const icon = document.getElementById('basket-icon');
const panel = document.getElementById('basket-panel');
const dropZone = document.getElementById('drop-zone');
const fileList = document.getElementById('file-list');

icon.addEventListener('click', () => {
  panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
});

dropZone.addEventListener('dragover', e => e.preventDefault());
dropZone.addEventListener('drop', async e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file || file.size > 50 * 1024 ** 3) {
    return alert('File must be ≤ 50 GB.');
  }
  const li = document.createElement('li');
  li.textContent = `Uploading ${file.name}…`;
  fileList.appendChild(li);

  const result = await ipcRenderer.invoke('copy-file', file.path);
  li.textContent = result.success ? file.name : `Failed: ${file.name}`;
});

ipcRenderer.on('copy-progress', (_, { fileName, pct }) => {
  console.log(`${fileName}: ${Math.round(pct * 100)}%`);
});
function refreshFileList() {
  fileList.innerHTML = '';
  const files = fs.readdirSync(SHARED_DIR);
  files.forEach(file => {
    const li = document.createElement('li');
    li.textContent = file;
    fileList.appendChild(li);
  });
}

// Initial load
refreshFileList();

// Watch for new files
chokidar.watch(SHARED_DIR, { ignoreInitial: true }).on('add', filePath => {
  const fileName = path.basename(filePath);
  const li = document.createElement('li');
  li.textContent = fileName;
  fileList.appendChild(li);
});
