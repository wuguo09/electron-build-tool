// 所有Node.js API都可以在预加载过程中使用。
// 它拥有与Chrome扩展一样的沙盒。
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
  const style = document.createElement('style');
  style.textContent = "::-webkit-scrollbar {display: none;}";
  document.head.appendChild(style);
});

const { contextBridge, shell, ipcRenderer } = require('electron');

const electronAPI = {
  shellAPI: shell,
  ipcRendererAPI: ipcRenderer,
  // 添加其他 Electron 模块或功能
  openSceneEditor: (data) => {
    console.log('open-scene-editor-invoke', data);
    return electronAPI.ipcRendererAPI.invoke('open-scene-editor', data);
  },
};

// 在 contextBridge 中暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
