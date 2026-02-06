# Koa.js 开发指南

> 更新时间：2025-02

## 目录导航

- [核心概念](#核心概念)
- [快速开始](#快速开始)
- [洋葱模型](#洋葱模型)
- [Context 对象](#context-对象)
- [中间件](#中间件)
- [路由系统](#路由系统)
- [错误处理](#错误处理)
- [请求体解析](#请求体解析)
- [最佳实践](#最佳实践)

---

## 核心概念

### 什么是 Koa？

Koa 是由 Express 原班人马打造的新一代 Node.js Web 框架，基于 ES2017 async/await，提供了更优雅的异步流程控制。

**核心特点**：
- **轻量级**：核心代码极简，不绑定任何中间件
- **洋葱模型**：中间件采用洋葱模型，先进后出
- **Async/Await**：原生支持 async/await，避免回调地狱
- **Context 对象**：封装 req 和 res，提供更友好的 API
- **更好的错误处理**：基于 try-catch，更容易捕获异步错误

**Koa vs Express**：

| 特性 | Koa | Express |
|------|-----|---------|
| 中间件模型 | 洋葱模型 | 线性模型 |
| 异步处理 | async/await | 回调/Promise |
| 内置功能 | 极简，无内置中间件 | 内置路由、静态文件等 |
| Context | ctx 对象封装 | req/res 分离 |
| 错误处理 | try-catch | 错误处理中间件 |
| 学习曲线 | 稍陡 | 平缓 |

**适用场景**：
- 需要精细控制中间件流程的应用
- 大量异步操作的应用
- 追求代码简洁和可维护性的项目
- 微服务架构

---

## 快速开始

### 安装

```bash
# 创建项目目录
mkdir myapp
cd myapp

# 初始化 package.json
npm init -y

# 安装 Koa
npm install koa
```

### Hello World

```javascript
const Koa = require('koa')
const app = new Koa()

// 响应
app.use(ctx => {
  ctx.body = 'Hello World'
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
```

### 基础示例

```javascript
const Koa = require('koa')
const app = new Koa()

// 日志中间件
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 响应
app.use(ctx => {
  ctx.body = 'Hello Koa'
})

app.listen(3000)
```

---

## 洋葱模型

Koa 的中间件采用洋葱模型（Onion Model），执行顺序是先进后出。

### 洋葱模型原理

```
        ┌────────────────────────┐
        │    Middleware 1        │
        │  ┌──────────────────┐  │
        │  │  Middleware 2    │  │
w Koa()

// Middleware 1
app.use(async (ctx, next) => {
  console.log('1. 进入 Middleware 1')
  await next()
  console.log('6. 离开 Middleware 1')
})

// Middleware 2
app.use(async (ctx, next) => {
  console.log('2. 进入 Middleware 2')
  await next()
  console.log('5. 离开 Middleware 2')
})

// Middleware 3
app.use(async (ctx, next) => {
  console.log('3. 进入 Middleware 3')
  ctx.body = 'Hello'
  console.log('4. 离开 Middleware 3')
})

app.listen(3000)

// 输出顺序：
// 1. 进入 Middleware 1
// 2. 进入 Middleware 2
// 3. 进入 Middleware 3
// 4. 离开 Middleware 3
// 5. 离开 Middleware 2
// 6. 离开 Middleware 1
```

### 洋葱模型的优势

```javascript
// 响应时间统计
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()  // 等待后续中间件执行完成
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

// 日志记录
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 错误处理
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = { error: err.message }
    ctx.app.emit('error', err, ctx)
  }
})

// 业务逻辑
app.use(async ctx => {
  ctx.body = 'Hello World'
})
```

---

## Context 对象

Context（上下文）是 Koa 的核心概念，封装了 Node.js 的 request 和 response 对象。

### Context 属性

```javascript
app.use(async ctx => {
  // 请求相关
  console.log(ctx.request)      // Koa 的 Request 对象
  console.log(ctx.req)          // Node 的 request 对象
  console.log(ctx.method)       // 请求方法
  console.log(ctx.url)          // 请求 URL
  console.log(ctx.path)         // 请求路径
  console.log(ctx.query)        // 查询参数对象
  console.log(ctx.querystring)  // 查询参数字符串
  console.log(ctx.headers)      // 请求头
  console.log(ctx.host)         // 主机名
  console.log(ctx.hostname)     // 主机名（不含端口）
  console.log(ctx.protocol)     // 协议
  console.log(ctx.secure)       // 是否为 HTTPS
  console.log(ctx.ip)           // 客户端 IP
  console.log(ctx.ips)          // 代理 IP 数组
  
  // 响应相关
  console.log(ctx.response)     // Koa 的 Response 对象
  console.log(ctx.res)          // Node 的 response 对象
  console.log(ctx.status)       // 响应状态码
  console.log(ctx.message)      // 响应消息
  console.log(ctx.body)         // 响应体
  console.log(ctx.type)         // Content-Type
  console.log(ctx.length)       // Content-Length
  
  // 应用相关
  console.log(ctx.app)          // 应用实例
  console.log(ctx.cookies)      // Cookie 对象
  console.log(ctx.state)        // 推荐的命名空间
})
```

### Context 方法

```javascript
app.use(async ctx => {
  // 获取请求头
  ctx.get('User-Agent')
  
  // 设置响应头
  ctx.set('Cache-Control', 'no-cache')
  ctx.set({
    'X-Custom-Header': 'value',
    'X-Another-Header': 'value'
  })
  
  // 重定向
  ctx.redirect('/new-url')
  ctx.redirect('back')  // 返回上一页
  
  // 抛出错误
  ctx.throw(400, 'Bad Request')
  ctx.throw(401, 'Unauthorized')
  ctx.throw(404, 'Not Found')
  
  // 断言
  ctx.assert(ctx.state.user, 401, 'User not found')
  ctx.assert(ctx.state.user.isAdmin, 403, 'Forbidden')
})
```

### 设置响应体

```javascript
app.use(async ctx => {
  // 字符串
  ctx.body = 'Hello World'
  
  // JSON
  ctx.body = { message: 'Hello' }
  
  // Buffer
  ctx.body = Buffer.from('Hello')
  
  // Stream
  ctx.body = fs.createReadStream('file.txt')
  
  // null（204 No Content）
  ctx.body = null
  
  // 设置状态码
  ctx.status = 201
  ctx.body = { message: 'Created' }
  
  // 设置 Content-Type
  ctx.type = 'text/html'
  ctx.body = '<h1>Hello</h1>'
})
```

### Context 扩展

```javascript
// 扩展 Context
app.context.db = db

// 使用
app.use(async ctx => {
  const users = await ctx.db.query('SELECT * FROM users')
  ctx.body = users
})
```



---

## 中间件

Koa 的中间件是一个 async 函数，接收 `ctx` 和 `next` 两个参数。

### 中间件基础

```javascript
const Koa = require('koa')
const app = new Koa()

// 基础中间件
app.use(async (ctx, next) => {
  // 前置逻辑
  console.log('Before')
  
  await next()  // 调用下一个中间件
  
  // 后置逻辑
  console.log('After')
})

// 不调用 next() 会终止中间件链
app.use(async ctx => {
  ctx.body = 'Hello'
  // 没有 await next()，后续中间件不会执行
})
```

### 中间件组合

```javascript
const compose = require('koa-compose')

// 定义多个中间件
const middleware1 = async (ctx, next) => {
  console.log('Middleware 1')
  await next()
}

const middleware2 = async (ctx, next) => {
  console.log('Middleware 2')
  await next()
}

const middleware3 = async (ctx, next) => {
  console.log('Middleware 3')
  await next()
}

// 组合中间件
const all = compose([middleware1, middleware2, middleware3])

app.use(all)
```

### 常用中间件

**1. 日志中间件**

```javascript
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})
```

**2. 错误处理中间件**

```javascript
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = {
      error: err.message
    }
    ctx.app.emit('error', err, ctx)
  }
})
```

**3. 响应时间中间件**

```javascript
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})
```

**4. CORS 中间件**

```javascript
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  ctx.set('Access-Control-Allow-Heade


router.post('/users', async ctx => {
  ctx.body = 'Create user'
})

router.put('/users/:id', async ctx => {
  ctx.body = `Update user ${ctx.params.id}`
})

router.delete('/users/:id', async ctx => {
  ctx.body = `Delete user ${ctx.params.id}`
})

// 注册路由
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)
```

### 路由参数

```javascript
// 路径参数
router.get('/users/:id', async ctx => {
  const { id } = ctx.params
  ctx.body = `User ID: ${id}`
})

// 多个参数
router.get('/users/:userId/posts/:postId', async ctx => {
  const { userId, postId } = ctx.params
  ctx.body = { userId, postId }
})

// 查询参数
// GET /search?q=koa&limit=10
router.get('/search', async ctx => {
  const { q, limit = 20 } = ctx.query
  ctx.body = { query: q, limit: parseInt(limit) }
})
```

### 路由前缀

```javascript
const router = new Router({
  prefix: '/api/v1'
})

router.get('/users', async ctx => {
  ctx.body = 'Users'
})

// 访问：/api/v1/users
```

### 路由模块化

```javascript
// routes/users.js
const Router = require('@koa/router')
const router = new Router()

router.get('/', async ctx => {
  ctx.body = 'Users list'
})

router.get('/:id', async ctx => {
  ctx.body = `User ${ctx.params.id}`
})

router.post('/', async ctx => {
  ctx.body = 'Create user'
})

module.exports = router

// app.js
const Koa = require('koa')
const Router = require('@koa/router')
const usersRouter = require('./routes/users')
const postsRouter = require('./routes/posts')

const app = new Koa()
const router = new Router()

// 挂载子路由
router.use('/users', usersRouter.routes(), usersRouter.allowedMethods())
router.use('/posts', postsRouter.routes(), postsRouter.allowedMethods())

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)
```

### 路由中间件

```javascript
// 路由级中间件
const auth = async (ctx, next) => {
  if (!ctx.headers.authorization) {
    ctx.throw(401, 'Unauthorized')
  }
  await next()
}

// 应用到特定路由
router.get('/admin', auth, async ctx => {
  ctx.body = 'Admin page'
})

// 应用到所有路由
router.use(auth)
```

---

## 错误处理

Koa 的错误处理基于 try-catch，更容易捕获异步错误。

### 基础错误处理

```javascript
const Koa = require('koa')
const app = new Koa()

// 错误处理中间件（放在最前面）
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = {
      error: err.message
    }
    
    // 触发错误事件
    ctx.app.emit('error', err, ctx)
  }
})

// 业务逻辑
app.use(async ctx => {
  if (!ctx.query.name) {
    ctx.throw(400, 'Name is required')
  }
  ctx.body = `Hello ${ctx.query.name}`
})

// 监听错误事件
app.on('error', (err, ctx) => {
  console.error('Server error:', err)
  // 记录日志、发送告警等
})

app.listen(3000)
```

### 自定义错误类

```javascript
// 自定义错误类
class AppError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
    this.name = this.constructor.name
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400)
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404)
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401)
  }
}

// 使用
app.use(async ctx => {
  const user = await User.findById(ctx.params.id)
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  ctx.body = user
})
```

### 统一错误响应

```javascript
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    // 默认值
    let status = err.status || 500
    let message = err.message || 'Internal Server Error'
    
    // 处理不同类型的错误
    if (err.name === 'ValidationError') {
      status = 400
      message = Object.values(err.errors).map(e => e.message).join(', ')
    }
    
    if (err.name === 'CastError') {
      status = 400
      message = 'Invalid ID format'
    }
    
    if (err.code === 11000) {
      status = 400
      message = 'Duplicate field value'
    }
    
    // 设置响应
    ctx.status = status
    ctx.body = {
      status: 'error',
      statusCode: status,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack
      })
    }
    
    // 记录日志
    console.error({
      status,
      message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    })
    
    // 触发错误事件
    ctx.app.emit('error', err, ctx)
  }
})
```

### 404 处理

```javascript
// 404 处理（放在所有路由之后）
app.use(async ctx => {
  ctx.status = 404
  ctx.body = {
    error: 'Not Found',
    path: ctx.path
  }
})
```

---

## 请求体解析

Koa 不内置请求体解析，需要使用中间件。

### 安装

```bash
npm install koa-bodyparser
```

### 基础用法

```javascript
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')

const app = new Koa()

// 使用 bodyparser
app.use(bodyParser())

// 解析 JSON
app.use(async ctx => {
  console.log(ctx.request.body)
  ctx.body = ctx.request.body
})

app.listen(3000)
```

### 配置选项

```javascript
app.use(bodyParser({
  enableTypes: ['json', 'form'],  // 支持的类型
  jsonLimit: '1mb',               // JSON 大小限制
  formLimit: '56kb',              // 表单大小限制
  textLimit: '56kb',              // 文本大小限制
  strict: true,                   // 严格模式
  detectJSON: ctx => /\.json$/i.test(ctx.path)  // 检测 JSON
}))
```

### 文件上传

```bash
npm install @koa/multer multer
```

```javascript
const multer = require('@koa/multer')
const upload = multer({ dest: 'uploads/' })

// 单文件上传
router.post('/upload', upload.single('file'), async ctx => {
  console.log(ctx.file)
  ctx.body = {
    filename: ctx.file.filename,
    size: ctx.file.size
  }
})

// 多文件上传
router.post('/upload-multiple', upload.array('files', 10), async ctx => {
  console.log(ctx.files)
  ctx.body = {
    count: ctx.files.length,
    files: ctx.files.map(f => ({
      filename: f.filename,
      size: f.size
    }))
  }
})
```

---

## 最佳实践

### 1. 错误处理

```javascript
// 全局错误处理
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = { error: err.message }
    ctx.app.emit('error', err, ctx)
  }
})

// 监听错误事件
app.on('error', (err, ctx) => {
  console.error('Server error:', err)
})
```

### 2. 日志记录

```javascript
const logger = require('koa-logger')

app.use(logger())
```

### 3. 静态文件

```javascript
const serve = require('koa-static')

app.use(serve('./public'))
```

### 4. Session

```javascript
const session = require('koa-session')

app.keys = ['secret key']
app.use(session(app))

app.use(async ctx => {
  ctx.session.views = (ctx.session.views || 0) + 1
  ctx.body = `${ctx.session.views} views`
})
```

### 5. CORS

```javascript
const cors = require('@koa/cors')

app.use(cors())
```

### 6. 压缩

```javascript
const compress = require('koa-compress')

app.use(compress({
  threshold: 2048
}))
```

### 7. 安全

```javascript
const helmet = require('koa-helmet')

app.use(helmet())
```

---

## 完整示例

```javascript
const Koa = require('koa')
const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('@koa/cors')
const helmet = require('koa-helmet')

const app = new Koa()
const router = new Router()

// 中间件
app.use(helmet())
app.use(cors())
app.use(logger())
app.use(bodyParser())

// 错误处理
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = { error: err.message }
    ctx.app.emit('error', err, ctx)
  }
})

// 路由
router.get('/', async ctx => {
  ctx.body = { message: 'Hello Koa' }
})

router.get('/users', async ctx => {
  ctx.body = { users: [] }
})

router.post('/users', async ctx => {
  const user = ctx.request.body
  ctx.status = 201
  ctx.body = { user }
})

// 注册路由
app.use(router.routes())
app.use(router.allowedMethods())

// 404 处理
app.use(async ctx => {
  ctx.status = 404
  ctx.body = { error: 'Not Found' }
})

// 错误监听
app.on('error', (err, ctx) => {
  console.error('Server error:', err)
})

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

---

## 参考资源

- [Koa 官方文档](https://koajs.com/) - 最权威的 Koa 文档
- [Koa GitHub](https://github.com/koajs/koa) - 官方 GitHub 仓库
- [@koa/router](https://github.com/koajs/router) - 官方路由中间件
- [Koa 中间件列表](https://github.com/koajs/koa/wiki) - 社区中间件

---

> 本文档基于 Koa 官方文档和 MCP Context7 最新资料整理，涵盖核心概念、洋葱模型、Context 对象、中间件、路由系统、错误处理、请求体解析和最佳实践。所有代码示例均可运行，并包含详细的中文注释。
