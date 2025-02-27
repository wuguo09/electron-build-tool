## 直接用本工具打包
### 本地启动
在入口文件修改应用的访问地址

```typescript
// electron/main.js

...
const baseUrl = await getBaseUrl();
mainWindow.loadURL(baseUrl);
...
```

运行命令即可启动

```typescript
yarn start
```

### 打包
执行命令

```typescript
yarn build
```

#### 打包中可能遇到的问题
+ 下载electron报错，点击日志中的下载链接去浏览器下载
    - 下载完成后放到以下目录
    - ![](https://cdn.nlark.com/yuque/0/2023/png/25636330/1689840873076-2b592476-e441-417c-adc6-e6014194def4.png)
+ 下载winCodeSign报错，点击日志中的下载链接去浏览器下载
    - 下载完成后解压到以下目录
    - ![](https://cdn.nlark.com/yuque/0/2023/png/25636330/1689841034649-d128fd62-96db-43d1-9ceb-dd71a51b56c5.png)
    - 里面长这样
    - ![](https://cdn.nlark.com/yuque/0/2023/png/25636330/1689841051345-10ce6a38-c9f0-4a53-b71e-2a90e4a5d2b9.png)
+ 下载nsis和nsis-resources报错，点击日志中的下载链接去浏览器下载
    - 下载完成后解压到以下目录
    - ![](https://cdn.nlark.com/yuque/0/2023/png/25636330/1689841146711-08bdc0d0-f46d-4b28-805b-5abc45af7d4d.png)
    - 里面长这样
    - ![](https://cdn.nlark.com/yuque/0/2023/png/25636330/1689841209274-6f07cd18-ad45-48cf-a07f-670a3e8c7e8a.png)
    - ![](https://cdn.nlark.com/yuque/0/2023/png/25636330/1689841225662-65b77bf4-7037-4384-9432-78e3f241d0e2.png)

解决以上问题，再重新执行打包命令，不出意外的话你就成功了



### 配置
应用安装后可通过配置文件(/resource/config.json)对应用配置，包括终端类型，窗口等等



## 接入已有的vite项目
### 先看看官方文档
[官方文档](https://www.electronjs.org/zh/docs/latest/api/browser-window#class-browserwindow)很详细



### 安装electronjs
```plain
yarn add electron@26.0.0 --registry=https://registry.npmmirror.com/ -d
```

如果安装不上，不妨看看官方的[安装指导](https://www.electronjs.org/zh/docs/latest/tutorial/installation)



### 配置paskage.json
首先是应用信息，每一项都是必须的，不然会报错

```plain
{
  "name": "landscape-bigscreen",
  "version": "0.0.4",
  "main": "electron/main.js",
  "description": "landscape-bigscreen",
  "author": "guo guo",
}
```

其中main是electronjs的主进程文件

加一条命令用来启动electronjs

```plain
 "scripts": {
    "start": "electron .",
}
```



### 主进程文件
在根目录下新建文件夹并添加main.js

这个文件是在node环境执行

```plain
//main.js

const {
  app,
  BrowserWindow,
} = require("electron")
const path = require("path")

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
     preload: path.join(__dirname, "preload.js"),//渲染进程文件
      sandbox: false,//不启用沙盒，为了能够在主进程和渲染进程间通信
      frame: false, // 隐藏工具栏和外框架
    }
  })

	//本地开发启的服务
  mainWindow.loadURL("http://localhost:3000")

  // 打开开发工具
  mainWindow.webContents.openDevTools()
}

let tray = null
// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow()

  app.on("activate", function () {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit()
})
```



### 渲染进程文件
在electron目录添加preload.js

这个文件会在windows环境执行

```javascript
// 所有Node.js API都可以在预加载过程中使用。
// 它拥有与Chrome扩展一样的沙盒。
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
```



### 启动
```json
"scripts": {
    "start": "electron .",
    "dev": "vite",
}
```

1.y**arn dev启动项目**

**2.yarn start运行electron**

### **打包**
官方提供的打包脚手架为@electron-forge/cli，但我用了不行，打包后打开是白屏，所以采用了热门的electron打包工具[electron-builder](https://www.electron.build/)



#### 安装
```json
yarn add electron-builder -d
```



#### 配置package.json
**配置命令**

```json
"scripts": {
  "build": "vue-tsc --noEmit --skipLibCheck & vite build --mode sit",
  "electron:build": "npm run build & electron-builder"
},
```

**打包配置**

打包后会生成dist目录存放应用代码，和dist_electron目录存放桌面应用相关文件，包括桌面程序和安装包

```json
"build": {
    "appId": "landscape-bigscreen",
    "productName": "landscape-bigscreen",
    "copyright": "Copyright © 2021 <your-name>",
    "mac": {
      "category": "public.app-category.utilities"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "directories": {
      "buildResources": "assets",
      "output": "dist_electron"
    }
  },
```

默认打包成.exe程序，如果要打包到多平台，可以在build中配置，例如

```json
"build": { 
    // windows相关的配置
    "win": {  
      "icon": "xxx/icon.ico"//图标路径 
    }  
```

我也没有仔细研究，所以在此不多赘述



#### 配置主进程文件main.js


```javascript
//main.js

const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  dialog,
  shell
} = require("electron")
const path = require("path")

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),//渲染进程文件
      sandbox: false,//不启用沙盒，为了能够在主进程和渲染进程间通信
      frame: true, // 隐藏工具栏和外框架
    }
  })
  //加载项目打包后的入口文件
  mainWindow.loadURL(`file://${path.join(__dirname, "../dist/index.html")}`)

  // 打开开发工具
  // if (NODE_ENV === "development") {
  //   mainWindow.webContents.openDevTools()
  // }


  //加入系统托盘
  const trayIconPath = path.join(__dirname, "", "", "icon.png")
  tray = new Tray(trayIconPath)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "打开",
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: "退出",
      click: () => {
        app.quit()
      }
    }
  ])
  // 点击图标展示
  tray.on("click", () => {
    mainWindow.show()
  })
  // 鼠标放置上去显示的文本
  tray.setToolTip("果果一号")
  tray.setContextMenu(contextMenu)
}

let tray = null
// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow()

  app.on("activate", function () {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit()
})
```

+ new BrowserWindow创建窗口时加入配置option.webPreferences.frame = true去掉外框和工具栏
+ 修改窗口执行的项目入口文件
    - mainWindow.loadURL(`file://${path.join(__dirname, "../dist/index.html")}`)
+ 使用Tray 和Menu模块将程序放到系统托盘，并添加右键时的目录



#### 打包
执行 yarn electron:build命令开始打包



