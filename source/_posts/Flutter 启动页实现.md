---
title: Flutter 启动页实现
top_img: false 
date: 2022-06-10
categories: 
- 前端
tags:
- Flutter
cover: https://img1.baidu.com/it/u=1855083458,281793390&fm=253&fmt=auto&app=138&f=JPEG?w=989&h=500
---

## 前言
> 应用开启时, 会出现短暂白屏才会出现加载后页面, 给用户的感觉也不好

## 原生
...

## Pub 插件

这里使用[flutter_native_splash](https://pub.dev/packages/flutter_native_splash)

1. 安装依赖
``` yaml
dependencies:
  flutter:
    sdk: flutter
  ...
  flutter_native_splash: ^2.1.6
```

2. 设置 pubspec.yaml

- image: 图片
- color: 背景颜色 用于图片不能充满屏幕
- android: true 生成 andorid
- ios: true 生成 ios
- android_gravity: "fill" // 铺满
- ios_content_mode: "scaleAspectFit" // 铺满
- ...
``` yaml
flutter_native_splash:
  image: assets/images/splash.png
  color: "#ffffff"
  android: true
  ios: true
  android_gravity: "fill"
  ios_content_mode: "scaleAspectFit"
```

3. 生成启动页

``` 
flutter pub pub run flutter_native_splash:create
```

```
[Android] Creating splash images
[Android] Creating dark mode splash images
[Android] Updating launch background(s) with splash image path...
[Android]  - android/app/src/main/res/drawable/launch_background.xml
[Android]  - android/app/src/main/res/drawable-v21/launch_background.xml
[Android] Updating styles...
[Android]  - android/app/src/main/res/values-v31/styles.xml
[Android] No android/app/src/main/res/values-v31/styles.xml found in your Android project
[Android] Creating android/app/src/main/res/values-v31/styles.xml and adding it to your Android project
[Android]  - android/app/src/main/res/values/styles.xml
[iOS] Creating images
[iOS] Creating dark mode images
[iOS] Updating LaunchScreen.storyboard with width, and height
[iOS] Updating ios/Runner/Info.plist for status bar hidden/visible
Web folder not found, skipping web splash update...
╔════════════════════════════════════════════════════════════════════════════╗
║                                 WHAT IS NEW:                               ║
╠════════════════════════════════════════════════════════════════════════════╣
║ You can now keep the splash screen up while your app initializes!          ║
║ No need for a secondary splash screen anymore. Just use the remove()       ║
║ method to remove the splash screen after your initialization is complete.  ║
║ Check the docs for more info.                                              ║
╚════════════════════════════════════════════════════════════════════════════╝

✅ Native splash complete.
Now go finish building something awesome! 💪 You rock! 🤘🤩
Like the package? Please give it a 👍 here: https://pub.dev/packages/flutter_native_splash
```

预览

![1](https://user-images.githubusercontent.com/70128222/194988713-6bde2f1e-7799-4497-a3b5-ca402e1cd48f.gif)


当然[flutter_native_splash](https://pub.dev/packages/flutter_native_splash)也提供了方法让我们主动调用关闭，我们可以初始化数据等耗时操作执行完主动关闭

``` dart
void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  // 启动页设置手动关闭
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  runApp(App());
  // 模拟初始化数据等待5s
  await Future.delayed(Duration(seconds: 3));
  // 启动页设置关闭
  FlutterNativeSplash.remove();
}
```

![2](https://user-images.githubusercontent.com/70128222/194988732-f1b3b03a-6cf8-437b-9fa1-3ac031435de9.gif)


## 完结
如果遇到改状态栏等 就需要原生解决了～

简单需求flutter_native_splash还是能满足的