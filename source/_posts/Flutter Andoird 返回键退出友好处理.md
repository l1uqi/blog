---
title: Flutter Andoird 返回键退出友好处理
top_img: false
date: 2022-06-05
categories: 
- 前端
tags:
- Flutter
cover: https://img1.baidu.com/it/u=1855083458,281793390&fm=253&fmt=auto&app=138&f=JPEG?w=989&h=500
---

## 背景
Android手机会有虚拟按键, 或者实体按键。 用户点击返回按键或误触时 如果刚打开或者路由栈没有更多页面则会退出应用
直接退出应用的话 用户体验就太差了, 所以大多数的做法是在一定时间内再按返回才进行退出操作 

## 解决
在Flutter中我们可以通过 [WillPopScope](https://api.flutter.dev/flutter/widgets/WillPopScope-class.html) 来实现返回按钮拦截

``` dart
const WillPopScope({
  ...
  required WillPopCallback onWillPop,
  required Widget child
})
```

onWillPop是回调函数, 当用户点击返回按钮时调用

``` dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class WillPopTest extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => WillPopTestState();
}

class WillPopTestState extends State<WillPopTest> {
  DateTime? _lastClickTime; //上次点击时间

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return GetMaterialApp(
      home: Scaffold(
        body: WillPopScope(
            onWillPop: () async {
              if (_lastClickTime == null ||
                  DateTime.now().difference(_lastClickTime!) >
                      Duration(seconds: 1)) {
                _lastClickTime = DateTime.now();
                Get.snackbar('提示', '再按一次退出',
                    margin: EdgeInsets.only(bottom: 10),
                    snackPosition: SnackPosition.BOTTOM);
                return false;
              }
              return true;
            },
            child: Container(
              child: Center(
                child: Text('点击两次返回退出app'),
              ),
            )),
      ),
    );
  }
}
```

![1](https://user-images.githubusercontent.com/70128222/194988803-41fe32b5-35c0-418d-9f55-e0f2a00320cb.gif)
