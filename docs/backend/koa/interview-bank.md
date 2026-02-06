# Koa.js 面试题库

> 更新时间：2025-02

## 目录导航

- [基础概念](#基础概念)
- [洋葱模型](#洋葱模型)
- [中间件](#中间件)
- [错误处理](#错误处理)

---

## 基础概念

### 1. 什么是 Koa？它与 Express 有什么区别？

**核心答案**：

Koa 是由 Express 原班人马打造的新一代 Node.js Web 框架，基于 async/await。

**主要区别**：
1. **中间件模型**：Koa 使用洋葱模型，Express 使用线性模型
2. **异步处理**：Koa 原生支持 async/await，Express 使用回调
3. **内置功能**：Koa 极简，Express 内置更多功能
4. **Context**：Koa 使用 ctx 对象，Express 使用 req/res

**代码示例**：

```javascript
// Koa
const Koa = require('koa')
const app = new Koa()

app.use(async ctx => {
  ctx.body = 'Hello Koa'
})

// Express
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello Express')
})
```

---

## 洋葱模型

### 2. 什么是洋葱模型？

**核心答案**：

洋葱模型是 Koa 的中间件执行模型，执行顺序是先进后出。

**代码示例**：

```javascript
app.use(async (ctx, next) => {
  console.log('1. 进入')
  await next()
  console.log('6. 离开')
})

app.use(async (ctx, next) => {
  console.log('2. 进入')
  await next()
  console.log('5. 离开')
})

app.use(async ctx => {
  console.log('3. 处理')
  ctx.body = 'Hello'
  console.log('4. 完成')
})

// 输出：1 → 2 → 3 → 4 → 5 → 6
```

---

## 参考资源

- [Koa 官方文档](https://koajs.com/)
- [Koa GitHub](https://github.com/koajs/koa)

---

> 本文档基于 Koa 官方文档和 MCP Context7 最新资料整理。
