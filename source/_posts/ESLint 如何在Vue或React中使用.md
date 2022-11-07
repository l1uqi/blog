---
title: ESLint 如何在Vue或React中使用
top_img: false
date: 2022-03-20
categories: 
- 前端
tags:
- Eslint
cover: https://img0.baidu.com/it/u=126596768,3405821946&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=286
---

vue或react都有对应的插件实现

[eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)

[eslint-plugin-react](https://github.com/yannickcr/eslint-plugin-react)

由于 Vue 中的单个文件组件不是普通的 JavaScript，因此无法使用默认解析器，因此引入了新的文件组件。 通过表示模板语法的特定部分以及标签内的内容生成增强的 AST 节点。

以上面Vue文件报错为例子

我们可以通过[eslint-plugin-vue](https://github.com/vuejs/eslint-plugin-vue)来实现

首先项目根目录安装

```jsx
npm install --save-dev eslint eslint-plugin-vue
```

然后执行 npm run eslint-fix进行校验

前面所遇到的html标记已经得到解决 eslint能正确识别vue文件。

## 配合IDE食用更佳

在实际的开发过程中, 当然希望编辑器能即使反馈错误并提示

以VsCode为例

### 安装插件

![1](https://user-images.githubusercontent.com/70128222/194988143-edd0851f-53ae-4e10-8313-3fac2587c29b.jpg)


### 预期效果

![2](https://user-images.githubusercontent.com/70128222/194988159-866d59b4-4c96-46ce-bc18-5f4cd565548b.jpg)

如果未生效

请确保EsLint开启

如遇报错 解决报错直至开启

![3](https://user-images.githubusercontent.com/70128222/194988171-ff456002-8e76-413c-aef9-2ecd63a842fb.jpg)

 