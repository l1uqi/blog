---
title: ESLint 初体验
top_img: false
date: 2022-03-11
categories: 
- 前端
tags:
- Eslint
cover: https://img0.baidu.com/it/u=126596768,3405821946&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=286
---

## 介绍

ESLint是一个用来识别 ECMAScript 并且按照规则给出报告的代码检测工具，使用它可以避免低级错误和统一代码的风格。如果每次在代码提交之前都进行一次eslint代码检查，就不会因为某个字段未定义为undefined或null这样的错误而导致服务崩溃，可以有效的控制项目代码的质量

## 好处

俗话说的好没有规矩不成方圆 代码规范是程序员的根本，入门第一步，从规范代码开始。
eslint根本目的是统一项目的代码风格规范，养成规范的写代码习惯，减少不必要的错误和隐患。


## 安装

``` sh
    npm install -g eslint // 全局安装

    npm install --save-dev eslint // 项目安装
```

## 使用

项目根目录新建.eslintrc.js文件 配置eslint。

如果全局安装eslint可以在项目运行, 初始化配置文件。

可以根据个人喜好或团队选择

``` sh
eslint --init

1 How would you like to use ESLint? (Use arrow keys)
To check syntax only   // 只检查语法
❯ To check syntax and find problems // 检查语法并找出问题
To check syntax, find problems, and enforce code style // 检查语法、发现问题并强制执行代码样式

2 What type of modules does your project use? (Use arrow keys)
❯ JavaScript modules (import/export) 
  CommonJS (require/exports) 
  None of these

3 Which framework does your project use? 
  React 
  Vue.js 
❯ None of these

...
```

- 初始化配置如下

``` json 
module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
    }
};
```

- 接下来添加一条rule

``` json
"rules": {
	// if while function 后面的{ 必须与if在同一行。
	"brace-style": [2, "1tbs", { "allowSingleLine": true }],
}
```

- 测试文件: util.js

``` js
var d = new Date()
var time = d.getHours()
if (time<10)
{
document.write("<b>Good morning</b>" )
}
else if (time>=10 && time<16) 
{
document.write("<b>Good day</b>")
}
else
{
document.write("<b>Hello World!</b>")
}
```

- 控制台执行
``` sh
eslint src/util.js


...src/util.js

4:1  error  Opening curly brace does not appear on the same line as controlling statement  brace-style
   6:1  error  Closing curly brace does not appear on the same line as the subsequent block   brace-style
   9:1  error  Closing curly brace does not appear on the same line as the subsequent block   brace-style
  11:1  error  Opening curly brace does not appear on the same line as controlling statement  brace-style

✖ 4 problems (4 errors, 0 warnings)
  4 errors and 0 warnings potentially fixable with the `--fix` option.
```

eslint rule生效 结果自然是会报错
在当前场景大括号不能单独占一行



这时我们可以执行 eslint --fix
package中配置命令替代单个eslint --fix

``` json
eslint --fix util.js // 自行纠正

// 配置命令全局执行,省事
// package.js 
"scripts": {
	"eslint-fix": "eslint src/**/*.*  --fix"
}
```

接下来在新建一个vue文件
src/index.vue

控制台执行

npm run eslint-fix
出现报错

![](/coding/eslint/error.png)

::: warning
eslint此时不认识vue文件, 所以只能当成js文件进行处理,

正因为js外层不能包含html标记 所以会出现报错信息。
:::