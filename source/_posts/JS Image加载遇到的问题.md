---
title: JS Image加载遇到的问题
date: 2022-11-15
top_img: false
categories:
  - 前端
tags:
  - 图片加载
cover: https://raw.githubusercontent.com/l1uqi/PicGo/main/blog/1007338.jpg
---

## 背景

最近在做前端业务埋点, 遇到的问题。
业务场景是在列表中监听商品是否曝光, 如果用户可见就进行商品上报。
上报是用 Image()传输。

[为什么要用 image 进行埋点上报](https://hello7cat.com/2022/11/10/前端业务埋点数据上报/)

```js
// str 传参
const img = new Image();
img.src = `${url}?${str}`;
```

## 问题

[浏览器并发请求资源数](https://www.zhihu.com/question/20474326)
浏览器的并发请求数目限制是针对同一域名的。
同一时间针对同一域名下的请求有一定数量限制。超过限制数目的请求会被阻塞。

以 chrome 为例浏览器同域名下资源加载的最大并发连接数为 6，当资源文件大于 6 时，多于 6 个的文件就会进入待定，等第一批加载完才会加载第二批的 6 个图片资源，这样就增加了等待时间。无形中就增加用户加载网页等待的时间；

当时在测试环境下, 后端接口在更新, 导致上报请求未能完成。
列表曝光又是逐个进行上报(偷懒了没有合并上传), 遇上了浏览器并发请求限制!
当时页面与接口又是同域名, 从而导致用户无法进行操作(因为网络请求阻塞导致)

---

## 解决

### 域名分片

由于浏览器限制了每个域（domain）的活动连接数。为了可以同时下载超过该限制数的资源，域名分片（domain sharding）会将内容拆分到多个子域中。当使用多个域来处理多个资源时，浏览器能够同时下载更多资源，从而缩短了页面加载时间并改善了用户体验。

比如 jd.com 随便找张图片
如下:
https://img10.360buyimg.com/seckillcms/s280x280_jfs/t1/216379/19/19449/40977/628c9742Ee1612b6f/e032fe03d144ce2c.jpg.avif
https://img11.360buyimg.com/seckillcms/s280x280_jfs/t1/216379/19/19449/40977/628c9742Ee1612b6f/e032fe03d144ce2c.jpg.avif
https://img12.360buyimg.com/seckillcms/s280x280_jfs/t1/216379/19/19449/40977/628c9742Ee1612b6f/e032fe03d144ce2c.jpg.avif

修改 img1, 10, 11, 12.. 都能够访问

### HTTP/2

由于 HTTP/2 没有限制并发请求（unlimited concurrent requests），因此启用 HTTP/2 后，就没必要再使用域名分片来解决并发限制了。

>由于以上都不适用埋点上报的场景 T T.
Image() 又不能设置请求超时时间, 所以只能进行 src 置空
用setTimeout 设置1s后替换src为空(埋点上报1s足够了)
目前看起来是没问题了。

```js
const timeout = 1000;
const img = new Image();
img.src = `${url}?${str}`;

setTimeout(() => {
  img.src = "";
}, timeout);
```

如有错误, 还望指正！
