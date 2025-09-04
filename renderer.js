const fileList = document.getElementById('fileList');

// Function to populate the list with an array of filenames
const refreshFileList = (files) => {
  fileList.innerHTML = '';
  files.forEach(file => {
    const listItem = document.createElement('li');
    listItem.textContent = file;
    fileList.appendChild(listItem);
  });
};

// Function to add a single new file to the list
const addNewFileToList = (filename) => {
  const listItem = document.createElement('li');
  listItem.textContent = filename;
  fileList.appendChild(listItem);
};

// Listen for the initial list of files from the main process
window.electronAPI.onInitialFileList(files => {
  console.log('Initial file list received:', files);
  refreshFileList(files);
});

// Listen for newly added files from the main process
window.electronAPI.onNewFileAdded(filename => {
  console.log('New file added:', filename);
  addNewFileToList(filename);
});

// Tell the main process to start watching the directory when the UI is ready
window.addEventListener('DOMContentLoaded', () => {
  window.electronAPI.startFileWatcher();
});
