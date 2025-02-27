//main.js

const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const path = require("path");
const { useEmits } = require("./emits");
const { getBaseUrl, getConfig } = require("./methods");

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

async function createWindow() {
  const config = await getConfig();
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow(
    Object.assign(
      {
        width: 375,
        height: 667,
        webPreferences: {
          preload: path.join(__dirname, "preload.js"), //渲染进程文件
          sandbox: false, //不启用沙盒，为了能够在主进程和渲染进程间通信
        },
        frame: false, // 隐藏工具栏和外框架
        // titleBarStyle:'hidden',
        // titleBarOverlay: {
        //   color: '#2f3241',
        //   symbolColor: '#74b1be',
        //   height: 28
        // },
        // trafficLightPosition: { x: 10, y: 10 }
        fullscreen: true,
        autoHideMenuBar: true,
      },
      config.window || {}
    )
  );
  // 更改 User-Agent
  config.isInMobile &&
    mainWindow.webContents.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Mobile/14A346 Safari/537.51.2"
    );
  // mainWindow.loadURL(`file://${path.join(__dirname, "../dist/index.html")}`)
  const baseUrl = await getBaseUrl();
    //设置应用的访问地址
  mainWindow.loadURL(baseUrl);

  // mainWindow.loadURL('http://localhost:3000');

  // 打开开发工具
  // if (NODE_ENV === "development") {
  //   mainWindow.webContents.openDevTools()
  // }

  // 拦截所有试图打开新窗口的操作
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // 让 Electron 内部处理，而不是新建窗口
    config.windowOpenToUrlReplace && mainWindow.loadURL(url);

    // 阻止打开新窗口
    return { action: config.windowOpen || "deny" };
  });

  /**添加通信方法 */
  useEmits(mainWindow);

  const trayIconPath = path.join(__dirname, "", "", "logo.png");
  tray = new Tray(trayIconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "打开",
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ]);
  // 点击图标展示
  tray.on("click", () => {
    mainWindow.show();
  });
  // 鼠标放置上去显示的文本
  tray.setToolTip(config.appName || "鸿恩寺公园");
  tray.setContextMenu(contextMenu);
}

let tray = null;
// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
