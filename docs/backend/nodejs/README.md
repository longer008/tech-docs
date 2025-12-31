# Node.js

## 元信息
- 定位与场景：基于事件驱动与非阻塞 IO 的 JavaScript 运行时。
- 版本范围：以 LTS 版本为主，升级需关注 breaking changes。
- 相关生态：npm、Express/Koa/Nest、Worker Threads。

## 研究记录（Exa）
- 查询 1："Node.js interview questions 2024 2025"
- 查询 2："Node.js best practices documentation"
- 查询 3："Node.js event loop"
- 来源摘要：以官方文档为主要参考。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Event Loop 的核心阶段与执行顺序？
  - A：timers → pending → idle/prepare → poll → check → close。
- Q2：`process.nextTick` 与 `setImmediate` 的差异？
  - A：`nextTick` 在当前阶段结束前执行，优先级更高。
- Q3：为什么要避免阻塞事件循环？
  - A：会导致所有请求延迟与吞吐下降。
- Q4：Stream 与 Buffer 的适用场景？
  - A：流用于大数据处理，Buffer 处理二进制数据。
- Q5：Cluster 与 Worker Threads 的区别？
  - A：Cluster 是多进程，Worker Threads 是多线程。

### 进阶/场景题
- Q1：如何排查内存泄漏与性能问题？
  - A：使用内存快照、heapdump、性能分析工具。
- Q2：高并发场景如何扩展？
  - A：水平扩容、负载均衡、进程管理。

### 避坑指南
- 使用同步 IO 或 CPU 密集计算导致阻塞。
- 未处理 Promise rejection。
- 事件监听器未清理导致内存泄漏。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Node.js 官方文档：https://nodejs.org/en/docs
- Event Loop：https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
- 不要阻塞事件循环：https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop
- 安全最佳实践：https://nodejs.org/en/learn/getting-started/security-best-practices
```

### 常用代码片段
```js
setTimeout(() => {
  console.log('timer')
}, 0)

process.nextTick(() => {
  console.log('nextTick')
})

setImmediate(() => {
  console.log('immediate')
})
```

### 版本差异
- LTS 版本升级关注模块变更与安全更新。
- 升级以官方 Release Notes 为准。
