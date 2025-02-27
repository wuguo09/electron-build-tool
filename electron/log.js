const path = require('path');
const { app } = require('electron');

async function addLog(name, str) {
  const { fsWriteFile, fsReadFile,checkFilePath } = require('./methods');
  const logPath = path.join(app.getAppPath(), '../log.txt');
  const check = await checkFilePath(logPath)
  let log = ''
  console.log('logPath',logPath,check)
  if (check) {
    log = await fsReadFile(logPath);
  }
  const newLog = (log ? log : '') + '\n\n' + '---' + name + '-' + Date.now() + ': ' + str;
  await fsWriteFile(logPath, newLog);
}

module.exports = {
  addLog,
};
