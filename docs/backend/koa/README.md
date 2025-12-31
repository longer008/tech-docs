# Koa

## 元信息
- 定位与场景：基于 async/await 的轻量框架，强调中间件洋葱模型。
- 版本范围：以官方稳定版本为准。
- 相关生态：koa-router、koa-bodyparser、koa-jwt。

## 研究记录（Exa）
- 查询 1："Koa interview questions 2024 2025"
- 查询 2："Koa best practices documentation"
- 查询 3："Koa middleware"
- 来源摘要：以官方文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Koa 的洋葱模型是什么？
  - A：中间件先入后出，便于前后处理。
- Q2：`context` 对象包含哪些信息？
  - A：请求、响应与应用上下文。
- Q3：与 Express 的主要区别？
  - A：Koa 更轻量、基于 async/await。
- Q4：Koa 中如何处理错误？
  - A：try/catch 包裹 `await next()`。
- Q5：中间件如何组织？
  - A：按责任拆分与组合。

### 进阶/场景题
- Q1：如何实现全局日志与性能统计？
  - A：在最外层中间件记录耗时。
- Q2：如何处理请求超时与取消？
  - A：配合超时中间件与资源释放。

### 避坑指南
- 未捕获异常导致进程退出。
- 忽略中间件顺序导致逻辑异常。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Koa 官方文档：https://koajs.com/
- Koa GitHub：https://github.com/koajs/koa
```

### 常用代码片段
```js
const Koa = require('koa')
const app = new Koa()

app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

app.use((ctx) => {
  ctx.body = 'Hello Koa'
})

app.listen(3000)
```

### 版本差异
- 核心 API 变更较少，升级以官方文档为准。
