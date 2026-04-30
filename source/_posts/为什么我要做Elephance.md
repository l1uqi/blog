---
title: 为什么我要做 Elephance：给 AI 一个本地长期记忆层
date: 2026-04-30 18:57:29
categories:
  - AI
tags:
  - AI 编程
  - Elephance
  - Memory
  - MCP
  - LanceDB
cover: /img/elephance/why-elephance-cover.png
top_img: false
---

> 经验声明：本文是 AI 编程协作系列里正式进入 Memory 的第一篇。前面几篇讲了 Rules、Skills、渐进式披露和项目 Map，这一篇开始讲我为什么做 Elephance。

## 连载目录

- 第一篇：[为什么很多人用不好 AI 编程工具](/2026/02/18/为什么很多人用不好AI编程工具/)
- 第二篇：[如何写一份真正有效的 AI 项目 Rules](/2026/03/04/如何写一份真正有效的AI项目Rules/)
- 第三篇：[为什么模型 Context 决定 AI 编程效果](/2026/03/18/为什么模型Context决定AI编程效果/)
- 第四篇：[为什么 Rules 和 Skills 都需要渐进式披露](/2026/04/02/为什么Rules和Skills都需要渐进式披露/)
- 第五篇：[为什么 AI 还需要一张项目 Map](/2026/04/16/为什么AI还需要一张项目Map/)
- 第六篇：**为什么我要做 Elephance：给 AI 一个本地长期记忆层**

## 本篇目录

- 为什么会有 Elephance
- 名字为什么叫 Elephance
- 这不是“把上下文变长”
- 论文里的 Memory 外部化
- Elephance 想解决什么
- 为什么是本地优先

前面几篇文章一直在讲一个问题：AI 编程工具想在真实项目里稳定工作，不能只靠模型本身。

它至少需要：

- Rules：知道什么不能乱来。
- Skills：知道复杂任务怎么一步步做。
- Project Map：知道当前任务应该先去哪里找。
- Memory：记住过去发生过什么。

这篇开始，我想正式讲 Memory。

也就是我为什么做 [Elephance](https://github.com/l1uqi/elephance)。

## 为什么会有 Elephance

我最早的动机很简单：我发现 AI 工具太容易“失忆”。

你在一个会话里反复提醒它：

```text
这个项目接口错误不能在组件里直接弹 toast。
```

它当下能记住。

但换一个会话，或者隔几天再让它做类似任务，它又可能写出同样的问题。

你告诉它：

```text
这个字段虽然叫 status，但业务上只有 1 和 2 是有效状态。
```

它当前能理解。

但这个信息没有被保存成可检索的长期上下文，下次它又要重新猜。

这不是单个工具的问题，而是当前 AI 协作方式的结构性问题：**上下文还停留在聊天窗口里。**

聊天窗口适合短期对话，不适合承载长期项目记忆。

所以我开始想：AI 能不能像人一样，逐渐积累项目经验？

不是把所有历史都塞进 prompt，而是当任务需要时，能主动检索相关记忆。

这就是 Elephance 的起点。

## 名字为什么叫 Elephance

Elephance 这个名字来自两个部分：

- **Elephant**：大象。
- **LanceDB**：底层使用的本地向量数据库。

大象给人的第一印象就是记忆力强。

而 LanceDB 是一个适合做本地向量检索的数据库。Elephance 的名字，本质上就是：

```text
Elephant + LanceDB = Elephance
```

它想表达的不是一个复杂概念，而是一个很直白的目标：

**给 AI 一个像大象一样可靠、又基于 LanceDB 的本地记忆层。**

我不希望 AI 每次打开项目都像第一天入职。

它应该能记住项目偏好、历史决策、schema 信息、踩过的坑，以及用户长期告诉过它的重要背景。

## 这不是“把上下文变长”

很多人一听 Memory，第一反应是：

```text
那是不是只要模型上下文窗口足够大就好了？
```

我觉得不是。

上下文窗口再大，也不应该把所有历史内容每次都塞进去。

这会带来三个问题：

1. 成本高。
2. 噪音大。
3. 当前任务的重点会被冲淡。

真正需要的不是“无限长上下文”，而是“可检索上下文”。

也就是说：

```text
当前任务需要什么，就取回什么。
```

如果你在改登录页，AI 不需要知道整个项目所有历史决策。

它只需要知道和登录、认证、接口错误、表单校验相关的记忆。

Memory 的价值不在于保存一切，而在于能在正确时机找回正确的东西。

这和前面讲的渐进式披露是一回事。

## 我看这篇论文时的触发点

我最近看到一篇论文：[Externalization in LLM Agents: A Unified Review of Memory, Skills, Protocols and Harness Engineering](https://arxiv.org/abs/2604.08224)，arXiv:2604.08224。

这篇论文有一个观点，我非常认同：

现在很多 Agent 能力的提升，并不只是来自模型权重本身，而是来自模型外部运行环境的重新组织。

换句话说，Agent 不是只靠“脑子更聪明”变强。

它也会通过外部结构变强：

- Memory 把状态外部化。
- Skills 把流程经验外部化。
- Protocols 把交互结构外部化。
- Harness 把这些东西组织成可执行系统。

这和我前面几篇文章想表达的东西基本一致。

Rules、Skills、Project Map、Memory，本质上都是在帮 AI 把原本需要临时猜、临时记、临时组织的东西，变成外部可复用的结构。

下面这张图来自这篇论文，正好解释了 Memory 在 Agent 系统中的位置。

![Memory as Externalized Agent State](/img/elephance/externalized-memory.jpg)

图源：[Externalization in LLM Agents: A Unified Review of Memory, Skills, Protocols and Harness Engineering](https://arxiv.org/abs/2604.08224)，arXiv:2604.08224，原图随论文以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

我自己的理解是：

Memory 不是把更多东西塞进 prompt。

Memory 是把短暂的 raw context，整理成可保存、可查询、可复用的外部状态。

对 AI 编程来说，这个外部状态可能包括：

- 项目约定。
- 用户偏好。
- 历史 Bug。
- 业务字段含义。
- 数据库 schema。
- 模块改造原因。
- 某次线上问题的处理结论。

这些东西不是每次都要进入上下文。

但当任务需要时，它们必须能被找回来。

## Elephance 想解决的核心问题

Elephance 不是一个聊天应用。

它也不是一个新的 AI IDE。

我更愿意把它定义成：

**一个本地优先的 AI Memory 层。**

它要解决的是 AI Agent 和 AI 编程工具的长期上下文问题。

具体来说，它想做几件事。

### 第一，保存长期记忆

比如你告诉 AI：

```text
当前项目的接口错误统一由 request 层处理，业务组件不要直接弹错误提示。
```

这条信息不应该只活在当前会话里。

它应该被保存成一条项目记忆。

下次 AI 修改接口调用时，可以先检索这类记忆，再决定怎么写。

### 第二，按语义检索

项目经验很多时候不是关键词能完全匹配的。

你这次问的是：

```text
保存用户资料失败怎么处理？
```

但历史记忆里可能写的是：

```text
接口错误统一进入 requestErrorHandler，不在业务组件内 toast。
```

这两句话不完全一样，但语义相关。

所以 Memory 不应该只是简单全文搜索，而应该支持向量检索。

这也是 Elephance 选择 LanceDB 的原因。

### 第三，保存 schema 上下文

AI 写代码时，经常不是不懂 TypeScript，而是不懂业务字段。

比如：

```text
status
type
source
channel
is_valid
```

这些字段看起来很普通，但在真实项目里往往有业务含义。

如果 AI 不知道这些含义，就很容易写出“语法正确但业务错误”的代码。

所以 Elephance 里不只考虑普通 memory，也考虑 schema 的存储和查询。

### 第四，通过 MCP 接入工具

我不希望 Elephance 只能服务某一个工具。

所以它提供了 MCP Server，让 Cursor、Claude Code、Codex 这类支持 MCP 的客户端都能通过协议访问记忆能力。

这也对应论文里提到的另一个方向：Protocols。

Memory 本身要外部化，但访问 Memory 的方式也需要协议化。

否则每个工具都要单独适配，就很难复用。

## 为什么是本地优先

这里还有一个很重要的设计选择：Elephance 是本地优先的。

原因很简单，项目记忆里可能包含很多敏感信息。

比如：

- 私有项目结构。
- 内部接口字段。
- 业务规则。
- 用户偏好。
- 历史问题复盘。
- 数据库 schema。

这些东西不一定适合默认上传到远端服务。

当然，未来可以支持更多存储方式，但第一步我更倾向于让数据先留在本地。

本地优先还有一个好处：它更像开发者自己的工具链，而不是一个必须依赖外部平台的服务。

AI 协作要想真正进入日常工程，我认为这点很重要。

## Elephance 和前几篇文章的关系

到这里，其实前几篇文章就串起来了。

Rules 解决的是：

```text
AI 必须遵守什么？
```

Skills 解决的是：

```text
复杂任务应该按什么流程做？
```

Project Map 解决的是：

```text
AI 应该先去哪里找？
```

Elephance 解决的是：

```text
过去沉淀下来的项目背景如何被保存和找回？
```

这四者不是互相替代的关系。

它们应该协同工作。

比如一个比较理想的流程是：

1. AI 先读项目 Map，判断当前任务涉及用户模块。
2. 进入接口修改场景后，触发对应 Rule。
3. 如果任务需要缺陷流转，打开对应 Skill。
4. 如果涉及历史字段含义或之前踩过的坑，通过 Elephance 查询 Memory。

这才是我理解的 AI 工程协作基础设施。

## 这个项目目前是什么形态

Elephance 目前主要包括两部分：

- `@elephance/core`：核心 SDK，负责记忆和 schema 的存储、查询等能力。
- `@elephance/mcp`：MCP Server，让支持 MCP 的 AI 客户端可以调用这些能力。

底层使用 LanceDB 做本地向量存储。

对外暴露的能力会围绕两类展开：

- Memory：保存和查询长期记忆。
- Schema：保存和查询项目结构、字段、表等信息。

比如：

```text
memory_upsert
memory_query
schema_replace_source
schema_query
```

这些能力看起来很简单，但它们解决的是一个很基础的问题：AI 怎么跨会话、跨任务、跨工具地获得项目长期上下文。

## 我为什么想把它做成开源项目

因为我觉得这不是我一个人的问题。

只要团队开始认真使用 AI 编程工具，就一定会遇到类似问题：

- 每个人都在重复告诉 AI 项目规则。
- 每个会话都在重新解释业务背景。
- 很多经验只存在一次对话里，过后就丢了。
- AI 修过的问题，下次可能又犯。
- 项目 schema 没有稳定进入 AI 上下文。

这些问题如果只靠人肉 prompt，很难长期解决。

它需要一个更稳定的基础设施。

Elephance 就是我对这个问题的一个回答。

它不是想替代 Cursor、Claude Code 或 Codex。

它想成为这些工具背后的本地记忆层。

## 总结

我做 Elephance，不是因为我觉得 AI 还缺一个“知识库工具”。

而是因为我越来越确定：真实项目里的 AI 协作，必须有一个外部化的长期记忆层。

模型负责推理和生成。

Rules 负责边界。

Skills 负责流程。

Project Map 负责导航。

Memory 负责长期上下文。

Elephance 想做的，就是把 Memory 这一层做得足够简单、足够本地、足够容易接入。

名字里的大象，代表记忆。

名字里的 Lance，代表 LanceDB。

而 Elephance 想表达的，是一个朴素但重要的目标：

**让 AI 不要每次都重新认识你的项目。**

## 上一篇 / 下一篇

- 上一篇：[为什么 AI 还需要一张项目 Map](/2026/04/16/为什么AI还需要一张项目Map/)
- 下一篇：如何用 Elephance 给 AI 工具增加本地记忆（待写）

参考：

- [Elephance GitHub 仓库](https://github.com/l1uqi/elephance)
- [LanceDB 官方网站](https://lancedb.com/)
- [Externalization in LLM Agents: A Unified Review of Memory, Skills, Protocols and Harness Engineering](https://arxiv.org/abs/2604.08224)
