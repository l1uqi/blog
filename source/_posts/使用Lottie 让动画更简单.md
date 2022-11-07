---
title: 使用Lottie 让动画更简单
top_img: false
date: 2022-08-10
categories: 
- 前端
tags:
- 动画
cover: https://user-images.githubusercontent.com/70128222/194988917-dc95c10c-a1b2-4dfb-b322-af1d8671e0de.png
---

## 介绍

[Lottie](https://lottiefiles.com/what-is-lottie) 是Airbnb推出Library 它可将After Effects动画经由[Bodymovi](http://aescripts.com/bodymovin/)扩展插件输入成一个JSON动画文件格式, 适用于 Web、iOS、Android、Windows、QT、Tizen 和其他平台。
![lottie_1](https://user-images.githubusercontent.com/70128222/194988904-25329ba5-3361-4007-9851-1d572d17efbd.gif)


## 使用

如果你有After Effects动画, 可通过AE插件[Bodymovi](http://aescripts.com/bodymovin/) 生成JSON动画

没有After Effects动画可以让设计来制作, 或者学习制作~

当然也可以使用 [Lottie Files](https://lottiefiles.com/featured) 提供的免费动画

![lottie_2](https://user-images.githubusercontent.com/70128222/194988917-dc95c10c-a1b2-4dfb-b322-af1d8671e0de.png)


接着从[Lottie Files](https://lottiefiles.com/featured)下载一个动画任意动画

### Flutter中使用
1. lottie json 放入项目assets 目录下
2. 安装 [lottie](https://pub.dev/packages/lottie/install)
``` yaml
dependencies:
  lottie: ^1.3.0 
```
3. 使用
``` dart
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
          body: Center(
        child: Container(child: Lottie.asset('assets/lottie/animation.json')),
      )),
    );
  }
}

```
![lottie_3](https://user-images.githubusercontent.com/70128222/194988932-9bc79a97-f588-4bde-b4d0-b3e321c33e84.gif)


我们可以使用[AnimationController](https://doc.flutterchina.club/tutorials/animation/#animationcontroller) 控制动画

- forward() 启动
- stop() 停止
- reverse() 反向播放 

``` dart
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

void main() => runApp(LottieScreen());

class LottieScreen extends StatefulWidget {
  LottieScreen({Key? key}) : super(key: key);
  @override
  State<StatefulWidget> createState() => _LottieScreenState();
}

class _LottieScreenState extends State<LottieScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController lottieController;

  @override
  void initState() {
    super.initState();

    lottieController = AnimationController(
      vsync: this,
    );

    lottieController.addStatusListener((status) async {
      if (status == AnimationStatus.completed) {
        lottieController.reset();
      }
    });
  }

  @override
  void dispose() {
    lottieController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
          body: Center(
        child: Column(children: [
          Lottie.asset("assets/lottie/animation.json",
              repeat: false,
              controller: lottieController, onLoaded: (composition) {
            lottieController.duration = composition.duration;
            lottieController.forward();
          }),
          const SizedBox(
            height: 24,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              RaisedButton(
                onPressed: () {
                  lottieController.forward();
                },
                child: Text("启动"),
              ),
              RaisedButton(
                onPressed: () {
                  lottieController.stop();
                },
                child: Text("停止"),
              ),
              RaisedButton(
                onPressed: () {
                  lottieController.reverse();
                },
                child: Text("反向播放"),
              ),
            ],
          )
        ]),
      )),
    );
  }
}

```
![lottie_4](https://user-images.githubusercontent.com/70128222/194988949-b71849ca-26b7-4b0c-bcd2-b7e13471e25e.gif)


### Vue中使用


