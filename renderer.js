const fileList = document.getElementById('fileList');

const refreshFileList = (files) => {
    fileList.innerHTML = ''; // Clear existing list
    files.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file;
        fileList.appendChild(listItem);
    });
};

const addNewFileToList = (filename) => {
    const listItem = document.createElement('li');
    listItem.textContent = filename;
    fileList.appendChild(listItem);
};

// Listen for messages from the main process
window.electronAPI.onInitialFileList(files => {
    console.log('Initial file list received:', files);
    refreshFileList(files);
});

window.electronAPI.onNewFileAdded(filename => {
    console.log('New file added:', filename);
    addNewFileToList(filename);
});

// Tell the main process to start watching the directory
window.addEventListener('DOMContentLoaded', () => {
    window.electronAPI.startFileWatcher();
});
