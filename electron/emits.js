const { ipcMain, app } = require('electron');
const { fsWriteFile, shellOpenSysFile, fsMkdir, checkFilePath, fsReadFile } = require('./methods');
const path = require('path');
const { addLog } = require('./log');

function useEmits(mainWindow) {
  ipcMain.handle('open-scene-editor', async (e, data) => {
    console.log('收到打开编辑器的信息，场景数据为', data);
    await addLog('收到打开编辑器的信息，场景数据为', JSON.stringify(data));
    // 获取用户目录
    const userPath = app.getAppPath();
    const exePath = path.join(userPath, '../../start_cim.bat');
    // 配置文件的目录路径
    const newFolderPath = path.join(userPath, '../../paramcim/ParamCIM/Scripts/CIMConfig.json');
    //先检查目录路径存不存在
    const check = await checkFilePath(newFolderPath);
    await addLog('检查路径存不存在', check);
    await addLog('路径为', '---exePathpath' + exePath + '---CIMConfigPath' + newFolderPath);
    //向配置文件写入参数
    if (!check) {
      //没有目标文件，先创建一个
      const mkRes = await fsMkdir(path.join(userPath, '../../paramcim/ParamCIM/Scripts'));
      await addLog('创建目录', mkRes);
      if (!mkRes) return false;
      await addLog(
        '写入参数',
        newFolderPath +
          '-' +
          JSON.stringify({
            SceneId: data.id,
          })
      );
      const re = await fsWriteFile(
        newFolderPath,
        JSON.stringify({
          SceneId: data.id,
        })
      );
      await addLog('写入参数返回', re);
      if (!re) return false;
    } else {
      const jsonStr = await fsReadFile(newFolderPath);
      console.log('read',jsonStr,typeof jsonStr)
      await addLog('读取配置文件', newFolderPath + '-' + jsonStr);
      const json = JSON.parse(jsonStr);
      await addLog('解析配置文件');
      json['SceneId'] = data.id;
      await addLog('写入参数', newFolderPath + '-' + JSON.stringify(json));
      const re = await fsWriteFile(newFolderPath, JSON.stringify(json));
      if (!re) return false;
    }
    //打开场景编辑器
    const res = await shellOpenSysFile(exePath);
    return res;
  });
}

module.exports = {
  useEmits,
};
