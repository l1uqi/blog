---
title: CSS 通过子元素设置父元素
top_img: false
date: 2022-08-16
categories: 
- 前端
tags:
- CSS
cover: https://img0.baidu.com/it/u=2395867072,4290056404&fm=253&fmt=auto&app=120&f=JPEG?w=798&h=500
---

参考资料:

[CSS 父元素如何通过判断子元素来设置样式](https://segmentfault.com/q/1010000000641252)

[技术周刊 2021-05-21：Canvas 之春](https://zhuanlan.zhihu.com/p/374207985)

## 背景
某些特定场景下 我们希望通过子元素来判断从而修改父级属性。 
除了JS控制之外是否有CSS实现这方面功能
查了大量资料发现css现阶段没有实现这块

原因如下:
> 由于它违反了CSS目前的“不回溯”的原则，因此一直没有被纳入规范

> 其实你从浏览器的角度来考虑这件事情，便不会有疑问了。假如浏览器支持父级或者前面兄弟元素选择器的话，就不得不在渲染到当前元素时，倒回去找到特定的元素，重新渲染。因为选择器是可以组合的，甚至还会造成很多其它元素也需要重新渲染（想象.someClass:parent div），这样带来的reflow和repaint会造成难以估量的性能问题，甚至计算盒模型的栈保不齐都要溢出。所以自然不会有类似的选择器出现了。


## 现在

Chrome 意图实验性支持 CSS [:has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) 选择器，可以用来选择父级元素。目前 Igalia 公司正在为 Chrome 实现该选择器，其团队成员 Brian Kardell 还发表了博文 Can I :has() 进行了详细介绍。
``` html
<style>
.parent:has(.red) { color: red } /* 将匹配 .red 的父元素 .parent */
.parent:has(.green) { color: green } /* 将匹配 .green 的父元素 .parent */
</style>
<div class="parent"> <!-- color: red -->
  <div class="red"></div>
</div>
<div class="parent"> <!-- color: green -->
  <div class="green"></div>
</div>

```

![1](https://user-images.githubusercontent.com/70128222/194989165-f1ce3d30-d630-4e3d-a0ae-94381f9ca639.png)



## 结论

还是用js吧～
