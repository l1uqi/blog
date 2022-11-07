---
title: Electron自动更新or手动触发更新
top_img: false
date: 2021-01-20
categories: 
- 前端
tags:
- Electron
cover: https://img0.baidu.com/it/u=1589470868,4145284120&fm=253&fmt=auto&app=138&f=PNG?w=720&h=241
---

## 背景

我们用Electron开发了桌面应用, 项目同时也在不断更新迭代。我们希望只要发布了最新的版本，用户就能够收到更新提示从而进行升级。调研了市面上的实现方式后决定采取[electron-updater](https://www.npmjs.com/package/electron-updater)插件来实现更新功能。[electron-updater](https://www.npmjs.com/package/electron-updater)只需要简单的文件托管，不需要专用的服务器就能实现更新。

## 开始

我们先用脚手架新建一个空项目(vue)
``` bash
vue create electron-vue-demo // 新建项目
vue add electron-builder // 安装electron v11.0.0
npm run electron:serve // 运行项目
npm i electron-updater // 安装electron-updater
```

## 配置
publish 发布地址

```json
"build": {
    "productName": "demo",
    "appId": "demo.fspace.com",
    "directories": {
      "output": "release"
    },
    "publish": [
      {
        "provider": "generic",  // 服务器提供商 也可以是GitHub等等
        "url": "http://114.115.142.127:8989/download/", // 更新文件存放位置
        "channel": "latest",
        "useMultipleRangeRequest": false
      }
    ],
}
```
如果是vue-cli-plugin-electron-builder打包则会报错如下:
<span style="display:block;color:red;">
    Question||'build' in the application package.json is not supported since 3.0
</span>
因为3.0后不支持json的方式, 需要移除package.json “build” 

<span style="display:block;color:green;">vue.config.js </span>添加builderOptions
后续需要在vue中使用ipcRenderer(主进程与渲染进程通信)
所以需要设置 
//  nodeIntegration: true

``` json
module.exports = {
	...
  pluginOptions: {
    electronBuilder: {
    	nodeIntegration: true, // ipcRenderer
      builderOptions: {
        productName: "demo",
        appId: "demo.fspace.com",
        directories: {
          "output": "release"
        },
        publish: [
          {
            "provider": "generic",  // 服务器提供商 也可以是GitHub等等
            "url": "http://localhost:3006/", // 更新文件存放位置
            "channel": "latest",
            "useMultipleRangeRequest": false
          }
        ]
      }
    }
  }
}
```

<span style="display:block;color:green;">background.js </span>
初始化 autoUpdater

``` javascript
'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import * as path from 'path';
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

const isDevelopment = process.env.NODE_ENV !== 'production';
const DOWNLOAD_URL = 'http://localhost:3006/';

var package_json = require('../package.json');
var mainWindow = null;


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  console.log('ready')
  createWindow()
  updateHandle();
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


function updateHandle() {
  autoUpdater.currentVersion = package_json.version;

  autoUpdater.setFeedURL(DOWNLOAD_URL);

  // 取消自动更新
  autoUpdater.autoDownload = false;
  
  autoUpdater.on('checking-for-update', (info) => {
    // 开始检查是否有新版本
    // 可以在这里提醒用户正在查找新版本
    console.log('checking-for-update')
  })

  autoUpdater.on('update-available', (info) => {
    // 检查到有新版本
    // 提醒用户已经找到了新版本
    console.log('检查到有新版本')
  })
  
  autoUpdater.on('error', (err) => {
    // 自动升级遇到错误
  })
  
}
```


## 打包测试
<span style="display:block;color:green;">package.json</span>

版本号 1.0.1
``` json
{
  "name": "electron-vue-demo",
  "version": "1.0.1",
  ...
}
```
执行打包

``` shell
vue-cli-service electron:build
```

打包后release目录 (当前为mac打包)

``` md
├── release
│   ├── demo-1.0.1-mac.zip
│   ├── demo-1.0.1.dmg 					 // 安装文件
│   ├── demo-1.0.1.dmg.blockmap // 用于差异更新, mac好像无效 
│   ├── latest-mac.yml 					// 更新相关文件
│   └── mac
├── ...
└── package.json
```

## 搭建静态服务

这里使用koa koa-static 配置静态目录

``` md
├── server
│   ├── public  // 存放更新文件			
│   └── server.js 	
├── ...
└── package.json
```

我们把demo-1.0.1-mac.zip / latest-mac.yml / 更新日志 放入更新目录public

``` json
{
  "version": "V1.0.1",
  "content": [
  "-🎉  v1.0.1版本盛大发布。"
  ]
}
```

<span style="display:block;color:green;">server.js</span>


``` js
const Koa = require('koa');
const app = new Koa();
const path = require('path');
const serve = require('koa-static');
 
const main = serve(path.join(__dirname+'/public'));
app.use(main);
 
app.listen(3006,function(){
  console.log("监听3006端口")
});
```

回到项目

<span style="display:block;color:green;">background.js</span>


``` js
import { ipcMain } from 'electron'

// ipcMain 监听渲染进程checkForUpdate 事件
ipcMain.on("checkForUpdate",() => {
  autoUpdater.currentVersion = package_json.version;
  //执行更新检查
  autoUpdater.checkForUpdates();
})

function updateHandle() {
	...
  autoUpdater.on('update-available', (info) => {
    // 检查到有新版本
    // 提醒用户已经找到了新版本
    console.log('检查到有新版本', info)
  })
  ...
}
```

<span style="display:block;color:green;">app.vue</span>

``` vue
<template>
  <div id="app">
    <button @click="checkForUpdates">检查更新</button>
  </div>
</template>
<script>
import { ipcRenderer } from "electron";
export default {
  name: 'App',
  methods: {
    checkForUpdates() {
      // 通知主进程检查更新
      ipcRenderer.send('checkForUpdate')
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
```

点击按钮, 控制台打印如下

``` json
检查到有新版本 {
  version: '1.0.1',
  files: [
    {
      url: 'demo-1.0.1-mac.zip',
      sha512: 'PJeIr6HilOlNrcR8HEimQQuJHjEiK7x2PHhOGnmul5tTI2n0R7+6PP8S5j3+bwfZzSkjBWWWYnlR8WNoQ17YBQ==',
      size: 77708593,
      blockMapSize: 82077
    },
    {
      url: 'demo-1.0.1.dmg',
      sha512: 'i++/bWJ7pxIkShS+WehKkP8rLMjbKtHvFV/aLmDDj8lEqeyKP8cnVpSSlNNbqOwcqbxSzR5t07QMIUIVf0AMYw==',
      size: 80015179
    }
  ],
  path: 'demo-1.0.1-mac.zip',
  sha512: 'PJeIr6HilOlNrcR8HEimQQuJHjEiK7x2PHhOGnmul5tTI2n0R7+6PP8S5j3+bwfZzSkjBWWWYnlR8WNoQ17YBQ==',
  releaseDate: '2021-04-21T05:38:20.929Z'
}
```

autoUpdater.downloadUpdate(); // 下载更新
autoUpdater.quitAndInstall(); // 执行推出安装更新
依次执行后实现了更新操作, 当然这对用户来说非常不友好，需要把更新流程交给用户去控制。

autoUpdater给我们提供 download-progress(更新进度)、update-downloaded(更新完成) 监听。

<span style="display:block;color:green;">app.vue</span>

``` vue
<template>
  <div id="app">
    <a-button @click="checkForUpdates">检查更新</a-button>
    <!-- 更新提示框 -->
    <div class="main-container__upgrade-panel" v-if="show">
      <div class="main-container__upgrade-panel-title">
        {{`发现新版本${versionInfo.version}`}}
        <span @click="() => { show = !show }"><a-tooltip title="最小化" placement="top"><a-icon type="down-circle" /></a-tooltip></span>
      </div>
      <div class="main-container__upgrade-panel-body">
        <div class="main-container__pd1t">
          更新日志:
          </div>
          <div v-for="(item, index) in versionInfo.content" :key="index">{{item}}</div>
      </div>
      <div class="main-container__upgrade-panel-footer">
        <div style="width: 305px;">
          <a-progress
            :stroke-color="{
              from: '#108ee9',
              to: '#87d068',
            }"
            :percent="progress.percent"
            status="active"
          />
        </div>
        <a-button style="margin-right: 10px;" v-if="canInstall" type="primary" @click="() => icpSend('quitAndInstall')">安装</a-button>

        <a-button style="margin-right: 10px;" v-else type="primary" :loading="loading"  @click="() => { loading = true, icpSend('downloadUpdate') }"> <a-icon v-if="!loading" type="down-square" /> 更新</a-button>

        <a-button :disabled="progress.percent > 0" type="dashed" @click="() => { show = !show }">下次再说</a-button>

      </div>
    </div>
    
  </div>
</template>
<script>
import { ipcRenderer } from "electron";
export default {
  name: 'App',
  data() {
    return {
      DOWNLOAD_URL: 'http://localhost:3006/',
      canInstall: false,
      show: false,
      progress: {
        bytesPerSecond: 0,
        delta: 0,
        percent: 0,
        total: 0,
        transferred: 0
      },
      loading: false,
      versionInfo: {
        version: '',
        content: [
          '123',
          '456'
        ]
      }
    }
  },
  created() {
    // 版本有更新时提示
    ipcRenderer.on("updateAvailable", async (event, info) => {
      const verInfo = await this.getVersionInfo(info);
      if (verInfo) {
        try {
          this.versionInfo.version = JSON.parse(verInfo).version;
          this.versionInfo.content = JSON.parse(verInfo).content;
        } catch (e) {
          console.log(e)
        }
        this.show = true;
      }

    });
    // 下载进度条
    ipcRenderer.on("downloadProgress", (event, progressObj) => {
      progressObj.percent = Number(progressObj.percent.toFixed(1));
      this.progress = {
        ...progressObj
      };
    });

    ipcRenderer.on("isUpdateNow", () => {
      this.canInstall = true;
      this.show = true;
    });
  },
  methods: {
    async getVersionInfo(info) {
      return new Promise((resolve) => {
        let xhr = new XMLHttpRequest();
        xhr.open('get', this.DOWNLOAD_URL + info.version + '.json', true);
        xhr.send(null);
        xhr.onreadystatechange = function () {
          
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              
              resolve(xhr.responseText)
            } else {
              resolve(null)
            }
          }
        };

      });
    },
    icpSend(name) {
      ipcRenderer.send(name);
    },
    checkForUpdates() {
      ipcRenderer.send('checkForUpdate')
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

.main-container {
  width: 100%;
  position: relative;
  // display: flex;
  background: #f7f7f7;

  &__drag {
    position: absolute;
    width: calc(100% - 100px);
    height: 25px;
    -webkit-app-region: drag;
    .overlay {
      pointer-events: none;
    }
  }

  &__controls {
    position: absolute;
    right: 0;
    -webkit-app-region: no-drag;
    top: 0;
    z-index: 200;
    border-radius: 0 0 3px 3px;
    padding: 0;
    background: #bfbfbf21;
    :hover {
      color: white;
      background: gray;
    }
    :nth-child(3):hover{
      background-color: red;
    }

    &-item {
      display: inline-block;
      padding: 5px 10px;
      color: #ccc;
      font-size: 12px;
      -webkit-app-region: no-drag;
    }
  }

  &__upgrade-panel {
    position: fixed;
    z-index: 9999;
    right: 10px;
    bottom: 25px;
    width: 340px;
    background-color: #34373c;
    color: white;
    border-radius: 3px;
    font-size: 12px;
    box-shadow: 0px 0px 5px 5px rgba(133,133,133,0.25);

    ::-webkit-scrollbar {
      display: none; /* Chrome Safari */
    }

    &-title {
      padding: 10px 15px;
      width: 100%;
      height: 40px;
      border-bottom: 1px solid white;

      span {
        position: absolute;
        font-size: 14px;
        right: 10px;
      }

      span:hover {
        color:#FFFFFF;
        background-color:#6dd214;
        text-shadow:none;
      }
    }

    &-body {
      overflow-y: auto;
      padding: 10px 15px;
      max-height: 100px;
    }
    &-footer {
      padding-left: 10px;
      padding-bottom: 10px;

      a-button {
        margin-right: 15px;
      }
    }
  }

  &__pd1t {
    padding-top: 5px;
  }
}

.ant-progress-text {
  color: white !important;
}
</style>

```

<span style="display:block;color:green;">background.js</span>

``` js
'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

const isDevelopment = process.env.NODE_ENV !== 'production';
const DOWNLOAD_URL = 'http://localhost:3006/';

var package_json = require('../package.json');
var mainWindow = null;


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  console.log('ready')
  createWindow()
  updateHandle();
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


const deleteFile = (path) => {
  var files = [];
  if( fs.existsSync(path) ) {
      files = fs.readdirSync(path);
      files.forEach(function(file){
          var curPath = path + "/" + file;
          if(fs.statSync(curPath).isDirectory()) {
              deleteFile(curPath);
          } else {
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
  }
};

function updateHandle() {
  autoUpdater.currentVersion = package_json.version;

  autoUpdater.setFeedURL(DOWNLOAD_URL);

  // 取消自动更新
  autoUpdater.autoDownload = false;
  
  autoUpdater.on('checking-for-update', (info) => {
    // 开始检查是否有新版本
    // 可以在这里提醒用户正在查找新版本
  })

  autoUpdater.on('update-available', (info) => {
    // 检查到有新版本
    // 提醒用户已经找到了新版本
    console.log(info)
    mainWindow.webContents.send('updateAvailable', info)
  })
  
  autoUpdater.on('update-not-available', (info) => {
    // 检查到无新版本
    // 提醒用户当前版本已经是最新版，无需更新
  })

  autoUpdater.on('download-progress', function (progressObj) {
    // 更新进度条
    mainWindow.webContents.send('downloadProgress', progressObj)
  })
  
  autoUpdater.on('error', (err) => {
    // 自动升级遇到错误
  })
  
  autoUpdater.on('update-downloaded', (ev, releaseNotes, releaseName) => {
    // 自动升级下载完成
    // 可以询问用户是否重启应用更新，用户如果同意就可以执行 autoUpdater.quitAndInstall()
    mainWindow.webContents.send('isUpdateNow')
  })
}

ipcMain.on("checkForUpdate",() => {
  console.log(autoUpdater.currentVersion)
  autoUpdater.currentVersion = package_json.version;
  //执行自动更新检查
  autoUpdater.checkForUpdates();
})

ipcMain.on("downloadUpdate",() => {
  try {
    // 更新前删除本地更新包
    deleteFile(autoUpdater.app.baseCachePath)
  }catch {
    
  }
  //执行自动更新检查
  autoUpdater.downloadUpdate();
})

ipcMain.on("quitAndInstall",() => {
  //执行自动更新检查
  autoUpdater.quitAndInstall();
})
```

## 最终效果

![preview](https://user-images.githubusercontent.com/70128222/194988621-0040f2df-fa6c-45b7-adfe-98fe6a639bc9.gif)
