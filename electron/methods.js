const { dialog, shell } = require('electron');
const fs = require('fs');
const { addLog } = require('./log');
const path = require('path');
const { app } = require('electron');

/**使用shell模块打开应用程序（文件） */
function shellOpenSysFile(exePath) {
  return new Promise((resolve, reject) => {
    shell
      .openPath(exePath)
      .then((res) => {
        if (res && res.includes('Failed')) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch((err) => {
        console.error(err);
        resolve(false);
      });
  });
}

/**使用dialog模块让用户选择文件 */
function dialogExternalProgram(types = ['exe']) {
  return new Promise((resolve, reject) => {
    dialog
      .showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Executable Files', extensions: types }],
      })
      .then((result) => {
        if (!result.canceled && result.filePaths.length > 0) {
          // 用户选择了文件
          //   const exePath = result.filePaths[0];
          resolve(result);
        }
      })
      .catch((err) => {
        reject(false);
        console.error('打开文件选择对话框时出错:', err);
      });
  });
}

/**使用fs读文件 */
function fsReadFile(filePath) {
  // 读取文件内容
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        console.error(err);
        reject(false);
        return;
      }
      resolve(data);
    });
  });
}
/**使用fs写文件 */
function fsWriteFile(filePath, content) {
  // 写入文件内容
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, 'utf-8', (err) => {
      if (err) {
        console.error(err);
        reject(false);
        return;
      }
      resolve(true);
    });
  });
}

/**使用fs创建一个目录 */
function fsMkdir(dirPath) {
  return new Promise((resole, reject) => {
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) {
        console.error('无法创建目录:', dirPath, err);
        addLog('fsMkdir', dirPath + '--' + err);
        resole(false);
        return;
      }
      console.log('目录已创建');
      resole(true);
    });
  });
}

// 使用 fs.access() 来判断路径是否存在
function checkFilePath(path) {
  return new Promise((resolve) => {
    fs.access(path, fs.constants.F_OK, (error) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function getBaseUrl() {
  const filePath = path.join(app.getAppPath(), '../config.json');
  const check = await checkFilePath(filePath);
  let baseUrl = 'https://www.hongensipark.cn';
  if (check) {
    const res = await fsReadFile(filePath);
    const json = JSON.parse(res);
    return json.baseUrl || baseUrl;
  } else {
    const re = await fsWriteFile(
      filePath,
      JSON.stringify({
        baseUrl,
      })
    );
    return baseUrl;
  }
}

async function getConfig() {
  const filePath = path.join(app.getAppPath(), '../config.json');
  const check = await checkFilePath(filePath);
  if (check) {
    const res = await fsReadFile(filePath);
    const json = JSON.parse(res);
    return json || {};
  }
  return {}
}


module.exports = {
  shellOpenSysFile,
  dialogExternalProgram,
  fsReadFile,
  fsWriteFile,
  fsMkdir,
  checkFilePath,
  getBaseUrl,
  getConfig
};
