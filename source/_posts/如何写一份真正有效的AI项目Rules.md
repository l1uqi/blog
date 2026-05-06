---
title: 如何写一份真正有效的 AI 项目 Rules
date: 2026-03-15 10:00:00
categories:
  - AI
tags:
  - AI 编程
  - Cursor
  - Rules
  - Prompt
cover: /img/ai-rules-series/ai-project-rules.png
top_img: false
---

> 经验声明：本文是 AI 编程协作系列的第三篇。前面先讲了为什么很多人用不好 AI 编程工具，也把 LLM、Token、Context、Tool、MCP 和 Skill 这些基础词说清楚了。这一篇重点讨论项目 Rules。

上一篇讲 Skill 时，我们把它理解成“某类任务的操作手册”。

但 Skill 讲完之后，最容易产生一个问题：

```text
既然 Skill 已经告诉 AI 怎么做事了，为什么还要单独讲 Rules？
Rule 不就是 Skill 吗？
```

我的理解是：

```text
Skill 解决“任务怎么推进”。
Rule 解决“哪些边界不能踩”。
```

一个 Skill 里面当然可以包含 Rule。

比如“Bug 修复 Skill”里可以写：

- 先复现，再修改。
- 修改后必须跑测试。
- 不要顺手重构无关文件。

前两条更像流程，最后一条就是 Rule。

但很多 Rule 不属于某一个具体 Skill，而是整个项目都要遵守的边界。

比如：

```text
所有 API 错误必须经过统一 errorHandler，不要在业务组件里直接 message.error。
```

这条规则不只影响修 bug，也影响写新功能、做重构、补测试。它是项目级约束。

所以，Rule 可以是 Skill 的一部分，但 Rule 不等于 Skill。

这也是为什么我会在讲完 Skill 后，单独写一篇文章讲 Rules。

很多人用不好 AI 编程工具，一个很重要的原因就是：**流程可能讲了，但项目边界没有沉淀下来。**

但这里很容易产生一个误解：既然 Rules 重要，那是不是应该一开始就认真写一份很完整的规则文档？

我的答案恰好相反。

**真正有效的 Rule，通常不是一开始手写出来的，而是在一次次错误修正后长出来的。**

这句话很重要。

因为很多人写 Rules 的方式是这样的：

```text
请你遵循最佳实践。
请你写高质量代码。
请你保持代码简洁。
请你不要破坏现有逻辑。
```

这些话看起来都对，但实际效果往往很弱。因为它们太泛了，AI 不知道什么叫“当前项目里的最佳实践”，也不知道什么叫“不要破坏现有逻辑”。

真正有价值的 Rule，必须来自具体场景。

## Rule 不是口号，而是纠错记录
我现在更愿意把 Rule 看成一种“项目纠错记录”。

它记录的不是抽象原则，而是：

- AI 曾经在哪些地方做错过。
- 为什么这个项目不能那样做。
- 下次遇到类似情况应该怎么判断。
- 应该优先参考哪些文件。
- 哪些操作需要先询问用户。

比如，下面这条规则就比“不要破坏现有逻辑”有效得多：

```text
修改支付相关逻辑时，不要直接重构 `paymentStatus` 的枚举判断。
该字段历史上兼容旧版本 App，新增状态必须先查看 `src/constants/payment.ts`
和 `docs/payment-status.md`，再决定是否调整。
```

这条规则之所以有效，是因为它不是泛泛而谈。它告诉 AI：

- 具体模块是什么。
- 具体风险是什么。
- 应该先看哪些文件。
- 不要做什么。

这才是 Rule 应该具备的密度。

## 为什么不要一开始手写完整 Rule

一开始手写 Rule 最大的问题是：你会写很多“你以为重要”的东西，而漏掉真正会让 AI 出错的东西。

项目里的隐性规则往往不是靠回忆想出来的，而是在真实任务中暴露出来的。

比如：

- AI 改了一个公共组件，结果影响了多个页面。
- AI 直接调用 `message.error`，绕过了统一错误处理。
- AI 写了一个新工具函数，但项目里其实已经有类似封装。
- AI 为了修 bug 顺手重构了整个模块。
- AI 新增接口时没有补 mock，也没有更新类型定义。
- AI 生成 SQL 时误解了某个字段含义。

这些问题发生之前，你未必能提前想到。

但一旦发生，它们就是最好的 Rule 来源。

所以我更推荐的方式是：**先让 AI 在真实任务里工作，再把错误沉淀成规则。**

Rule 不是项目开始前的一次性设计，而是 AI 协作过程中的持续演化。

## 一个有效 Rule 的生成闭环

我通常会按下面这个闭环来维护 Rules。

### 第一步：让 AI 正常完成任务

先不要急着写一大堆规则。

让 AI 在真实需求中工作，比如修一个 bug、写一个组件、补一个接口、改一个测试。

这一步的目标不是让它完美，而是观察它在当前项目里最容易犯什么错。

### 第二步：发现错误后，不只改代码

很多人用 AI 时，只会在发现错误后说：

```text
不对，这里不能这样写，帮我改掉。
```

这样当然可以修复当前问题，但下一次 AI 还可能继续犯同样的错。

更好的做法是，在纠正它之后继续追问一句：

```text
请总结这次错误背后的项目规则，并把它改写成适合长期复用的 AI 项目 Rule。
```

这一步很关键。

因为你不是让 AI 只修当前代码，而是让它把“为什么错”抽象成未来可复用的约束。

### 第三步：让 AI 自己生成 Rule

我的观点是：**Rule 不应该主要靠人手写，而应该让 AI 基于错误上下文自己生成。**

原因很简单，Rule 的读者本来就是 AI。

人类更擅长指出问题和解释业务背景，AI 更擅长把这些内容整理成结构化、可执行的指令。

你可以这样说：

```text
刚才你在接口错误处理上犯了一个项目级错误。
这个项目不允许在业务组件里直接调用 message.error，
所有接口错误必须进入 requestErrorHandler。

请基于这次错误生成一条项目 Rule，
要求下次新增接口调用或修改请求逻辑时自动遵守。
```

AI 生成出来后，人再做审核。

这比人类凭空写 Rule 更自然，也更贴近真实问题。

### 第四步：人工审核和压缩

虽然我说 Rule 应该让 AI 生成，但不代表完全不需要人工判断。

人需要做三件事：

1. 删除废话。
2. 补充关键文件路径。
3. 判断这条规则应该放在哪个作用域。

Rule 最怕两种情况：

- 太空，只有价值观，没有操作细节。
- 太长，把所有上下文都塞进去，导致每次都浪费 token。

好的 Rule 应该短、准、具体。

### 第五步：下一次任务中验证

Rule 写进去之后，不要默认它已经有效。

你需要在下一次类似任务里观察：

- AI 有没有主动遵守。
- 是否还需要你重复提醒。
- 是否触发范围太大。
- 是否对无关任务造成干扰。

如果仍然出错，就继续修正 Rule。

所以 Rule 不是写完就结束，而是像测试用例一样，随着项目持续迭代。

## Rules 应该放在哪里

不同工具有不同的规则入口。比如 Cursor 当前官方文档推荐使用 Project Rules，也就是放在项目的 `.cursor/rules` 目录中。旧的 `.cursorrules` 仍然支持，但已经属于 legacy。

但这只是一个示例。真正重要的不是文件名，而是规则要能被 AI 在合适的场景读取。无论是 `.cursor/rules`、`AGENTS.md`，还是其它 Agent 工具的规则文件，本质上都在解决同一个问题：给 AI 提供稳定、可复用、可演化的项目约束。

以 Cursor 的 Project Rules 为例，它的好处是可以拆分成多个 `.mdc` 文件，并按场景控制触发方式。

常见类型包括：

- **Always**：总是进入上下文，适合非常核心的项目约束。
- **Auto Attached**：当匹配某些文件路径时自动附加，适合前端、后端、测试等分区规则。
- **Agent Requested**：AI 可以根据描述主动选择是否使用。
- **Manual**：只有显式 `@ruleName` 时才使用。

这比把所有东西塞进一个单一规则文件更清晰。

## 我推荐的 Rules 目录结构

一个项目刚开始可以不用复杂，但至少可以这样拆：

```text
.cursor/rules/
├── project-overview.mdc
├── code-style.mdc
├── frontend.mdc
├── api-request.mdc
├── testing.mdc
└── dangerous-changes.mdc
```

其中：

- `project-overview.mdc`：项目技术栈、目录结构、核心约定。
- `code-style.mdc`：命名、组件写法、类型习惯。
- `frontend.mdc`：页面、组件、状态管理相关规则。
- `api-request.mdc`：接口请求、错误处理、类型生成规则。
- `testing.mdc`：单测、E2E、验证命令。
- `dangerous-changes.mdc`：高风险文件和禁止行为。

不要追求一步到位。

一开始哪怕只有两三个文件也可以。重要的是每一条都来自真实问题。

## 一个从错误生成 Rule 的例子

假设 AI 在项目中犯了这样一个错误：

它新增接口调用时，直接在组件里写了：

```ts
try {
  await updateUserProfile(data);
} catch (error) {
  message.error("保存失败");
}
```

但你的项目里规定，接口错误必须交给统一请求层处理，业务组件不能直接弹错误。

这时不要只让 AI 改代码。

你可以继续说：

```text
这次错误需要沉淀成项目 Rule。
请生成一条适合放进 `.cursor/rules/api-request.mdc` 的规则：

1. 说明业务组件不能直接处理接口错误弹窗。
2. 要求优先使用项目已有 request 封装。
3. 修改接口调用前先查看现有同类代码。
4. 给出一个错误示例和正确示例。
```

最后可能生成这样的 Rule：

```md
---
description: API request and error handling conventions
globs:
  - "src/**/*.ts"
  - "src/**/*.tsx"
alwaysApply: false
---

# API Request Rules

- Do not call `message.error`, `toast.error`, or similar UI error notifications directly inside business components for API failures.
- API errors must go through the existing request layer and shared error handling flow.
- Before adding a new API call, search for existing usage of the same service module and follow the local pattern.
- If a request needs special error handling, explain why before adding component-level handling.

Bad:

```ts
try {
  await updateUserProfile(data);
} catch (error) {
  message.error("保存失败");
}
```

Good:

```ts
await updateUserProfile(data);
```

Let the shared request layer handle API errors unless this feature has a documented exception.
```

这条 Rule 就是从真实错误里生长出来的。

它不是抽象口号，而是项目经验。

## 什么内容适合写进 Rule

我认为适合写进 Rule 的内容有几类。

### 高频重复提醒

如果你发现自己已经第三次提醒 AI 同一件事，它就应该进入 Rule。

比如：

- 回答必须使用中文。
- 不要直接改生成文件。
- 修改组件后必须补测试。
- 不要绕过统一请求层。

### 项目特有约定

这些内容对人类团队来说可能是常识，但 AI 不知道。

比如：

- 目录命名规则。
- 状态管理方式。
- 权限判断入口。
- 业务枚举含义。
- 数据转换层位置。

### 高风险操作

这类规则尤其重要。

比如：

- 不要主动执行数据库迁移。
- 不要删除历史兼容逻辑。
- 不要重构支付、登录、权限等核心模块，除非用户明确要求。
- 修改公共组件前先分析影响范围。

### 固定工作流

例如：

- 修 bug 前先复现。
- 改代码后跑对应测试。
- 前端视觉改动后截图验证。
- 完成需求后生成变更摘要。

这些内容都适合沉淀成 Rule。

## 什么内容不适合写进 Rule

不是所有东西都应该放进 Rule。

下面这些内容我一般不建议写进去：

- 很长的业务文档。
- 大量数据库 schema。
- 某次临时需求的细节。
- 很少触发的一次性流程。
- 需要按需检索的历史信息。

这些更适合放进 Memory 或文档里，再通过 MCP、Elephance 这类本地记忆工具按需检索。

Rule 应该是“必须持续生效的约束”，不是项目知识库的垃圾桶。

## 一条 Rule 的判断标准

我通常用下面几个问题判断一条 Rule 是否值得保留：

1. 它是否来自真实错误或真实重复提醒？
2. 它是否足够具体，能指导下一次行为？
3. 它是否有明确适用范围？
4. 它是否会频繁触发？
5. 它是否比放在 Memory 里更适合常驻上下文？

如果答案大多是否定的，就不要急着写进 Rule。

## 好 Rule 和坏 Rule 的区别

坏 Rule：

```text
请写高质量代码，遵循最佳实践，保证可维护性。
```

好 Rule：

```text
新增 React 组件时，优先使用 `src/components` 中已有的组合方式。
不要新增独立状态管理方案。
如果组件需要跨页面共享状态，先检查 `src/store` 中是否已有对应 slice。
```

坏 Rule：

```text
不要随便改代码。
```

好 Rule：

```text
修改 `src/shared` 下的公共组件前，先搜索调用方并说明影响范围。
如果只是修复单个页面问题，优先在页面层处理，避免扩大公共组件行为变化。
```

差别就在于：坏 Rule 是态度，好 Rule 是行动指南。

## 最实用的一句提示词

如果只记一句，我建议记这个：

```text
请把这次错误总结成一条项目 Rule，
要求它能防止你下次在类似场景中犯同样的错误。
规则要具体、可执行，并说明适用范围。
```

这句话非常好用。

每次 AI 犯错之后，不要只让它修。让它反思，让它沉淀，让它把错误变成规则。

时间久了，你的项目 Rules 会越来越像一个真正懂项目的老同事留下来的经验手册。

## Rules 和 Memory 的边界

这里也顺便回应上一篇文章里的观点。

Rules 解决的是“必须遵守什么”。

Memory 解决的是“过去发生过什么、现在可能需要什么背景”。

如果一条信息需要每次都约束 AI，就放进 Rule。

如果一条信息只是未来某些任务可能会用到，就放进 Memory。

比如：

- “不要在业务组件里直接处理接口错误”适合放进 Rule。
- “上次用户资料页接口失败是因为 token 刷新时序问题”更适合放进 Memory。

这也是 Elephance 这类本地记忆层存在的意义：不要让 Rule 承担所有上下文。

Rule 越清晰，Memory 越可检索，AI 的协作体验才会越稳定。

## 总结

真正有效的项目 Rules，不是靠一开始拍脑袋写出来的。

它应该来自真实任务，来自 AI 犯过的错，来自你一次次纠正它时沉淀下来的项目经验。

我的建议是：

- 不要追求一次性写完整。
- 不要写空泛口号。
- 不要把 Rule 当知识库。
- 每次 AI 犯错后，都让它总结一条可复用规则。
- 人负责判断和压缩，AI 负责生成和整理。

Rule 的本质不是“我告诉 AI 怎么做”，而是“我们把已经证明容易出错的地方，变成下一次自动生效的约束”。

这才是一份项目 Rules 真正有效的原因。

## 上一篇 / 下一篇

- 上一篇：[Skill：把经验沉淀成操作手册](/blog/2026/03/02/Skill：把经验沉淀成操作手册/)
- 下一篇：[为什么模型 Context 决定 AI 编程效果](/blog/2026/03/18/为什么模型Context决定AI编程效果/)

参考：

- [Cursor Rules 官方文档](https://docs.cursor.com/en/context/rules)，作为 Project Rules 的一个具体示例。
