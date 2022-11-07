---
title: Luckysheet 初体验
top_img: false
date: 2022-09-10
categories: 
- 前端
tags:
- Luckysheet
cover: https://mengshukeji.gitee.io/luckysheetdocs/img/LuckysheetDemo.gif
---

## 介绍
[Luckysheet](https://github.com/mengshukeji/Luckysheet) ，一款纯前端类似excel的在线表格，功能强大、配置简单、完全开源。

## 开始

### 下载vue示例
``` sh
git clone https://github.com/hjwforever/luckysheet-vue3-vite.git
// 安装依赖
npm install 
// 启动
npm run dev
```

运行后如下:
![1](https://user-images.githubusercontent.com/70128222/194989058-d0a282cb-965e-439d-92c1-cf7b1411b3ae.jpg)



文件目录:

``` md
├── src
│   └── assets
|   └── components
|       └── LuckySheet.vue 
├── ...
└── package.json
```

打开 LuckySheet.vue 

为了看起来更简洁 移除暂时用不到的方法

``` vue
<template>
  <div id="luckysheet"></div>
</template>

<script setup>
import {onMounted } from 'vue'

onMounted(() => {
  // 创建luckysheet 表格
  luckysheet.create({
    container: 'luckysheet'
  })
})
</script>

<style  scoped>
#luckysheet {
  margin: 0px;
  padding: 0px;
  position: absolute;
  width: 100%;
  left: 0px;
  top: 30px;
  bottom: 0px;
}
</style>

```

### 下载源码

版本: "2.1.13"
``` sh
git clone https://github.com/mengshukeji/Luckysheet.git
// 安装依赖
npm install 
// 启动
npm run dev
```

``` md
├── docs // vuepress 文档
├── src
|   |── assets
|   |── controllers
|   |── css
|   |── data
|   └── ...
├── config.js // 表格配置文件
├── core.js // 入口
├── index.html 
├── index.js
└── package.json
```


