---
title: Electron 启动动画实现
top_img: false
date: 2021-03-11
categories: 
- 前端
tags:
- Electron
cover: https://img0.baidu.com/it/u=1589470868,4145284120&fm=253&fmt=auto&app=138&f=PNG?w=720&h=241
---

## 背景
Electron是通过Chromium和Node.js集成来达到这一开发体验的, 我们可以用React / Vue 很轻松的搭建一个桌面应用程序。应用启动时就避免不了短暂的白屏或者需要启动时加载基础数据。

那么怎样解决这一问题呢?

有APP开发经验的同学肯定立马就想到了 启动动画(开屏广告)。


## 思路

1. 应用启动额外创建 Loading窗口 ,并且主窗口默认隐藏
2. 主窗口加载完毕通过 ipcRenderer 通知主窗口显示, Loading窗口关闭

## 实现

- 准备开屏动画

- 配置主进程main.js文件

``` js
const createWindow = async () => {
  mainWindow = new BrowserWindow({
    minHeight: 600,
    minWidth: 1024, width: 1280, height: 720, titleBarStyle: 'hidden', frame: false, show: false
  });
    ……
};
```

- 创建loading窗口

``` js
// loading
const createLoadingWindow = async () => {   
  loadingWindow = new BrowserWindow({
    height: 260,
    width: 650,
    show: true,
    transparent: true,  // 透明窗口
    maximizable: false,  //禁止双击放大
    frame: false   // 去掉顶部操作栏
  })

  loadingWindow.loadURL(url.format({
    // loading.html 加载动画
    pathname: path.join(__dirname, './lib/loading/loading.html'),
    protocol: 'file:',
    slashes: true
  }))
    ……
}
```

- 动画展示隐藏

``` js
import { ipcRenderer } from "electron";
const ipcMain = require('electron').ipcMain;

// 页面加载完毕时调用 通知关闭loading
ipcRenderer.send("close-loading-window");

app.on('ready', () => {
  // 创建加载动画 
  createLoadingWindow();
  // 创建主窗口
  createWindow();
  // 监听页面加载完毕事件
  ipcMain.on('close-loading-window', () => {
    
    if(loadingWindow) {
      loadingWindow.close();
    }
    mainWindow.show();
  })

});
```

## 完成

![animation](https://user-images.githubusercontent.com/70128222/194988437-76bc5bcf-6abe-4419-8303-0e7e72f7bf5e.gif)


## 不足

transparent: true,  // 透明窗口

在win7下不起作用

解决方案: [禁用硬件加速(未尝试)](https://github.com/electron/electron/issues/2170#ref-issue-623539865)

``` js
app.disableHardwareAcceleration();

app.on('ready', () => {
  setTimeout(() => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
    createMenu();
  }, 50);
});
```