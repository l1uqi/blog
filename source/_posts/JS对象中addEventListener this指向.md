---
title: JS对象中addEventListener this指向
top_img: false
date: 2023-02-03
categories: 
- 前端
tags:
- JS
cover: https://img0.baidu.com/it/u=2395867072,4290056404&fm=253&fmt=auto&app=120&f=JPEG?w=798&h=500
---

最近使用canvas在实现拖拽功能, 需要监听鼠标按下跟移动事件。所以创建canvas js对象来统一管理。
但是遇到了addEventListener指向了当前元素, 导致监听事件无法移除出现问题。

``` js
export default class FlowChatCanvas {
  // ...业务代码省略
  mousedown() {
    // 此时this指向了元素本身 
    console.log(this);
    // 需要在鼠标按下的同时, 监听鼠标移动
    this.canvas.addEventListener('mouseup', this.mouseup, false);
    this.canvas.addEventListener('mousemove', this.mousemove, false);
  }

  mouseup() {}

  mousemove() {}

  registerEvents() {
    this.canvas.addEventListener('mousedown', this.mousedown, false);
  }
}
```

### 解决
首先想到的就是使用Bind去修改this
```js
this.canvas.addEventListener('mousedown', this.mousedown.bind(this), false);
```

显而易见现在的mousedown方法中this 已经指向了对象本身。
但是缺陷就是监听事件没法移除, 如果你不需要移除事件的话 那么这一步就能解决问题了。

```js
mousedown() {
    // 需要在鼠标按下的同时, 监听鼠标移动
    this.canvas.addEventListener('mouseup', this.mouseup.bind(this), false);
    this.canvas.addEventListener('mousemove', this.mousemove.bind(this), false);
  }

  mouseup() {
    // 鼠标松开时, 移除move事件
    // 但是由于使用bind 导致无法移除
    this.canvas.removeEventListener('mousemove', this.mousemove);
    this.canvas.removeEventListener('mouseup', this.mouseup);
  }

  mousemove(e) {
    console.log(this);
  }

  registerEvents() {
    this.canvas.addEventListener('mousedown', this.mousedown.bind(this), false);
  }
```


查阅mdn发现, 除了bind指定this值外 还可以使用handleEvent() 这个特殊函数来捕获任何事件

[MDN addEventListener 处理过程中 this 的值的问题](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener#%E5%A4%87%E6%B3%A8)


```js 
 handleEvent(e) {
    switch (e.type) {
      case 'mousedown':
        this.canvas.addEventListener('mouseup', this, false);
        this.canvas.addEventListener('mousemove', this, false);
        break;
      case 'mousemove':
        this.painting(e);
        break;
      case 'mouseup':
        this.canvas.removeEventListener('mousemove', this);
        this.canvas.removeEventListener('mouseup', this);
        break;
    }
  }

  registerEvents() {
    this.canvas.addEventListener('mousedown', this, false);
  }
```

大功告成！ 所以有问题还是得先看文档 ！！！！！ 