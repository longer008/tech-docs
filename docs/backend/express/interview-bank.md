# Express.js 面试题库

> 更新时间：2025-02

## 目录导航

- [基础概念](#基础概念)
- [中间件](#中间件)
- [路由系统](#路由系统)
- [错误处理](#错误处理)
- [安全性](#安全性)
- [性能优化](#性能优化)

---

## 基础概念

### 1. 什么是 Express？它的核心特点是什么？

**核心答案**：

Express 是一个快速、开放、极简的 Node.js Web 框架。

**核心特点**：
1. 轻量级：核心功能精简
2. 灵活：不强制项目结构
3. 中间件生态丰富
4. 强大的路由系统

**代码示例**：

```javascript
const express = require('express')
const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000)
```

**追问点**：
- Express 和 Koa 的区别？
- Express 适合什么场景？

---

## 中间件

### 2. 什么是中间件？执行顺序是怎样的？

**核心答案**：

中间件是可以访问 req、res 和 next 的函数。按注册顺序执行，必须调用 `next()` 传递控制权。

**代码示例**：

```javascript
// 中间件 1
app.use((req, res, next) => {
  console.log('Middleware 1')
  next()
})

// 中间件 2
app.use((req, res, next) => {
  console.log('Middleware 2')
  next()
})

// 路由处理
app.get('/', (req, res) => {
  res.send('Hello')
})
```

**追问点**：
- 如何终止中间件链？
- 异步中间件如何处理错误？

---

## 参考资源

- [Express 官方文档](https://expressjs.com/)
- [Express API 参考](https://expressjs.com/en/4x/api.html)
- [Express 最佳实践](https://expressjs.com/en/advanced/best-practice-performance.html)

---

> 本文档基于 Express 官方文档和 MCP Context7 最新资料整理。
