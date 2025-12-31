# Express

## 元信息
- 定位与场景：Node.js 轻量 Web 框架，适合 REST API 与中小型服务。
- 版本范围：以 Express 4/5 为主，关注迁移差异。
- 相关生态：中间件、路由、日志、监控。

## 研究记录（Exa）
- 查询 1："Express interview questions 2024 2025"
- 查询 2："Express best practices documentation"
- 查询 3："Express error handling"
- 来源摘要：以官方指南为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Express 中间件的执行顺序？
  - A：按注册顺序执行，支持 `next()` 传递。
- Q2：错误处理中间件写法？
  - A：四参数 `(err, req, res, next)`。
- Q3：路由模块化如何实现？
  - A：使用 `express.Router()`。
- Q4：如何处理异步错误？
  - A：`next(err)` 或封装 async 中间件。
- Q5：常见性能优化点？
  - A：压缩、缓存、进程管理、静态资源优化。

### 进阶/场景题
- Q1：如何设计统一错误响应？
  - A：全局错误处理中间件统一格式。
- Q2：如何做安全加固？
  - A：使用 Helmet、输入校验、限流。

### 避坑指南
- 异步错误未捕获导致进程崩溃。
- 中间件顺序错误导致逻辑异常。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Express 官方文档：https://expressjs.com/
- 中间件：https://expressjs.com/en/guide/using-middleware.html
- 错误处理：https://expressjs.com/en/guide/error-handling.html
- 性能最佳实践：https://expressjs.com/en/advanced/best-practice-performance.html
```

### 常用代码片段
```js
const express = require('express')
const app = express()

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

app.listen(3000)
```

### 版本差异
- Express 5 在路由匹配与错误处理上有变更。
- 升级需参考官方迁移指南。
