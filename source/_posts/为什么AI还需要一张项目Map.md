---
title: 为什么 AI 还需要一张项目 Map
date: 2026-04-16 10:00:00
categories:
  - AI
tags:
  - AI 编程
  - Cursor
  - Rules
  - Context
  - Elephance
cover: /img/ai-rules-series/project-map.png
top_img: false
---

> 经验声明：本文是 AI 编程协作系列的第六篇。上一篇讲渐进式披露，这一篇继续补上另一个关键环节：除了 Rules 和 Context，AI 还需要一张项目 Map 来导航。

前面两篇分别讲了 Rules 和渐进式披露。

但这里还有一个问题：

就算你写了很多 Rules，AI 也未必知道当前任务应该先看哪里。

这就像你给一个新人发了一本公司制度，却没有告诉他项目的目录结构、模块边界、核心入口、历史包袱在哪里。制度本身没有错，但他还是会迷路。

所以除了 Rules，我认为每个真实项目还需要一张给 AI 看的项目 Map。

## Rules 解决不了导航问题
Rules 主要回答的是：

```text
做事时必须遵守什么？
```

但项目 Map 回答的是另一个问题：

```text
遇到一个任务时，应该先去哪里看？
```

这两个问题不一样。

比如 Rule 可以告诉 AI：

```text
修改接口调用时，必须复用统一 request 封装。
```

但它没有告诉 AI：

```text
接口封装在哪里？
用户模块在哪里？
支付模块有哪些历史兼容？
新增页面应该参考哪个目录？
测试入口在哪里？
```

如果没有 Map，AI 只能靠搜索和猜。

它可能能找到答案，但过程不稳定。

真实项目越大，这种不稳定越明显。

## 为什么项目越大越需要 Map

小项目里，AI 可以直接扫目录、读文件、靠文件名猜结构。

但真实业务项目经常不是这样。

它可能有：

- 历史目录和新目录并存。
- 同名模块分布在多个包里。
- 旧接口和新接口同时存在。
- 页面、服务、类型、测试分散在不同位置。
- 某些目录看起来重要，其实已经废弃。
- 某些文件看起来普通，其实是核心入口。

这些信息很难靠一次搜索稳定判断。

人类开发者刚接手项目时，也需要有人告诉他：

```text
这个项目主要看 src/modules。
老的 pages 目录还在，但新需求不要往里面加。
接口定义在 src/services，类型从 src/types 复用。
支付相关逻辑先看 docs/payment.md。
```

项目 Map 就是把这些导航经验写给 AI。

## Map 不是完整文档

这里要特别强调：项目 Map 不是项目文档大全。

它不应该写得很长。

它更像一张路线图。

好的 Map 不负责解释所有细节，只负责告诉 AI：

- 项目由哪些主要区域组成。
- 每个区域大概负责什么。
- 常见任务应该从哪里开始。
- 哪些目录是高风险区域。
- 哪些文档或规则需要按需读取。

也就是说，Map 的目标不是让 AI 一次性理解整个项目，而是让 AI 知道下一步应该打开哪一扇门。

这和上一篇讲的渐进式披露是同一件事。

Map 是第一层披露：给导航，不给全文。

## 一张项目 Map 应该包含什么

我建议项目 Map 至少包含六部分。

### 项目概览

用很短的话说明项目是什么。

比如：

```text
这是一个面向企业后台的 React + TypeScript 项目，主要包含用户、订单、支付、权限和报表模块。
```

这能帮助 AI 先建立项目心智模型。

### 目录导航

告诉 AI 主要目录的职责。

比如：

```text
src/pages：页面入口，只负责路由级组合。
src/modules：业务模块，新需求优先从这里开始。
src/components：跨模块公共组件，修改前必须搜索影响范围。
src/services：接口请求封装。
src/types：共享类型定义。
src/store：全局状态。
```

这比让 AI 自己猜目录含义稳定很多。

### 任务入口

告诉 AI 不同任务应该先看哪里。

比如：

```text
新增页面：先看 src/modules 中是否已有同类模块。
新增接口：先看 src/services 和已有 service 写法。
修改权限：先看 src/auth 和 docs/permission.md。
修复样式：优先定位页面模块，不要先改公共组件。
```

这部分非常实用。

因为 AI 最容易犯的错误之一，就是一开始入口选错。

### 高风险区域

明确告诉 AI 哪些地方不能轻易动。

比如：

```text
src/shared、src/request、src/auth、src/payment 是高影响范围区域。
修改前必须先搜索调用方，并说明影响范围。
```

这类信息如果只放在人的脑子里，AI 很容易踩坑。

### 规则索引

Map 不需要包含所有 Rule 内容，但应该告诉 AI 有哪些 Rule 可以打开。

比如：

```text
涉及接口请求时，读取 api-request.mdc。
涉及组件开发时，读取 frontend-components.mdc。
涉及测试时，读取 testing.mdc。
涉及 TAPD 流程时，读取 tapd-workflow Skill。
```

这就是渐进式披露。

第一轮只给索引，真正需要时再打开全文。

### Memory 查询建议

如果项目接入了 Elephance 这类本地记忆层，Map 里还可以告诉 AI 什么时候应该查 Memory。

比如：

```text
遇到业务字段含义、历史兼容、线上问题复盘、用户偏好时，先查询 Memory。
不要把所有历史背景写进 Rule。
```

这能把 Map 和 Memory 连接起来。

## 一个项目 Map 示例

可以新建一个类似这样的文件：

```text
.cursor/project-map.md
```

内容可以从很小开始：

```md
# Project Map

## Overview

This is a React + TypeScript admin project.

## Main Areas

- `src/pages`: route-level pages.
- `src/modules`: business modules. Start here for new product work.
- `src/components`: shared components. Search usages before changing.
- `src/services`: API service functions.
- `src/types`: shared TypeScript types.
- `src/store`: global state.

## Task Entry Points

- New feature: find the closest module in `src/modules` first.
- API change: inspect `src/services` and existing service usage.
- Permission change: inspect `src/auth` and `docs/permission.md`.
- UI-only fix: prefer page or module-level changes before shared components.

## Risk Areas

- `src/request`: shared request layer.
- `src/auth`: login and permission logic.
- `src/components`: shared UI behavior.

Changing these areas requires impact analysis.

## Rule Index

- API work: `.cursor/rules/api-request.mdc`
- Component work: `.cursor/rules/frontend-components.mdc`
- Tests: `.cursor/rules/testing.mdc`
- Dangerous changes: `.cursor/rules/dangerous-changes.mdc`

## Memory

Query Memory when the task involves historical decisions, business field meaning, user preference, or previous incidents.
```

这份 Map 不复杂，但已经能显著减少 AI 迷路。

它没有把所有细节塞进去，只告诉 AI 应该往哪里走。

## 如何证明 Map 是必要的

可以做一个很简单的对比实验。

找一个真实项目里的任务，比如：

```text
新增用户资料页的保存接口，并处理保存失败。
```

第一轮不提供 Map，只让 AI 自己搜索。

你会观察到它可能会：

- 先看错目录。
- 新增重复 service。
- 在组件里直接处理错误。
- 没有复用已有类型。
- 忽略已有模块模式。

然后第二轮提供项目 Map，再让它做同样任务。

这时它通常会更容易：

- 先定位到正确模块。
- 找已有 service 写法。
- 识别统一错误处理规则。
- 知道哪些公共区域不能乱动。
- 主动询问是否需要查询历史背景。

这个实验能非常直观地说明：AI 不是只缺规则，它还缺导航。

Rules 告诉它“不要违规”。

Map 告诉它“先去哪里”。

Memory 告诉它“过去发生过什么”。

三者不是替代关系，而是分工关系。

## Map 也应该由 AI 生成

和 Rules 一样，项目 Map 也不一定要人手写。

更好的方式是让 AI 先扫描项目，然后生成初版 Map。

你可以这样说：

```text
请扫描当前项目结构，生成一份给 AI Agent 使用的 project-map.md。

要求：
1. 不要写成长篇文档，只做导航。
2. 标出主要目录职责。
3. 标出新需求、接口、组件、测试、权限相关任务的入口。
4. 标出高风险区域。
5. 给出应该按需读取的 Rules 和 Skills。
```

生成之后，人再补充那些 AI 不可能知道的历史信息。

比如：

- 哪些目录已经废弃。
- 哪些模块不能随便动。
- 哪些文件名看起来普通但影响很大。
- 哪些业务字段有历史包袱。

这部分人类经验非常重要。

## Map 和 Elephance 的关系

Map 负责导航，Memory 负责长期背景。

如果项目 Map 里写：

```text
遇到支付状态字段时，先查询 Memory 中的 payment status 相关记录。
```

那么 AI 就可以先通过 Map 找到任务方向，再通过 Elephance 查询历史上下文。

这个链路会比“把支付所有历史规则写进 Rule”更健康。

因为 Rule 不会无限膨胀，Memory 又能按需补充细节。

这也是我认为 Memory 应该排在渐进式披露和项目 Map 之后讲的原因。

没有渐进式披露，Memory 会变成另一个上下文垃圾桶。

没有项目 Map，AI 甚至不知道应该查哪类 Memory。

## 总结

AI 想在真实项目里稳定工作，只靠 Rules 不够。

Rules 定边界。

Map 做导航。

Skills 管流程。

Memory 补历史。

如果没有 Map，AI 可能知道很多规则，却不知道当前任务应该从哪里开始。

如果 Map 写得好，AI 第一轮就能少走很多弯路：先定位模块，再读取规则，再打开流程，最后按需查询 Memory。

## 上一篇 / 下一篇

- 上一篇：[为什么 Rules 和 Skills 都需要渐进式披露](/blog/2026/04/02/为什么Rules和Skills都需要渐进式披露/)
- 下一篇：[为什么我要做 Elephance：给 AI 一个本地长期记忆层](/blog/2026/04/30/为什么我要做Elephance/)
