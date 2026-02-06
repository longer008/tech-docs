# Express.js 开发指南

> 更新时间：2025-02

## 目录导航

- [核心概念](#核心概念)
- [快速开始](#快速开始)
- [路由系统](#路由系统)
- [中间件](#中间件)
- [请求与响应](#请求与响应)
- [错误处理](#错误处理)
- [模板引擎](#模板引擎)
- [静态文件](#静态文件)
- [数据库集成](#数据库集成)
- [安全最佳实践](#安全最佳实践)
- [性能优化](#性能优化)

---

## 核心概念

### 什么是 Express？

Express 是一个快速、开放、极简的 Node.js Web 框架，提供了一系列强大的功能来构建 Web 应用和 API。

**核心特点**：
- **轻量级**：核心功能精简，通过中间件扩展
- **灵活**：不强制使用特定的项目结构
- **中间件生态**：丰富的第三方中间件
- **路由系统**：强大的路由匹配和参数处理

**适用场景**：
- RESTful API 服务
- 单页应用（SPA）后端
- 传统 Web 应用
- 微服务架构

**不适用场景**：
- 需要强约束的大型项目（建议使用 NestJS）
- 实时性要求极高的应用（建议使用 Socket.io）

---

## 快速开始

### 安装

```bash
# 创建项目目录
mkdir myapp
cd myapp

# 初始化 package.json
npm init -y

# 安装 Express
npm install express
```

### Hello World

```javascript
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
```

### 使用 Express Generator

```bash
# 安装生成器
npm install -g express-generator

# 生成项目
express --view=pug myapp

# 安装依赖
cd myapp
npm install

# 启动应用
npm start
```

---

## 路由系统

### 基础路由

路由定义了应用如何响应客户端请求。

```javascript
const express = require('express')
const app = express()

// GET 请求
app.get('/', (req, res) => {
  res.send('GET request to homepage')
})

// POST 请求
app.post('/', (req, res) => {
  res.send('POST request to homepage')
})

// PUT 请求
app.put('/user', (req, res) => {
  res.send('PUT request to /user')
})

// DELETE 请求
app.delete('/user', (req, res) => {
  res.send('DELETE request to /user')
})

// 所有 HTTP 方法
app.all('/secret', (req, res) => {
  res.send('Access the secret section')
})
```

### 路由参数

```javascript
// 路径参数
app.get('/users/:userId', (req, res) => {
  res.send(`User ID: ${req.params.userId}`)
})

// 多个参数
app.get('/users/:userId/books/:bookId', (req, res) => {
  res.send({
    userId: req.params.userId,
    bookId: req.params.bookId
  })
})

// 可选参数
app.get('/users/:userId?', (req, res) => {
  if (req.params.userId) {
    res.send(`User ID: ${req.params.userId}`)
  } else {
    res.send('All users')
  }
})

// 正则表达式
app.get('/users/:userId(\\d+)', (req, res) => {
  res.send(`User ID (number): ${req.params.userId}`)
})
```

### 查询参数

```javascript
// GET /search?q=express&limit=10
app.get('/search', (req, res) => {
  const { q, limit = 20 } = req.query
  res.send({
    query: q,
    limit: parseInt(limit)
  })
})
```

### 路由模块化

使用 `express.Router()` 创建模块化的路由处理程序。

```javascript
// routes/users.js
const express = require('express')
const router = express.Router()

// 中间件（仅对此路由生效）
router.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})

// 定义路由
router.get('/', (req, res) => {
  res.send('Users list')
})

router.get('/:id', (req, res) => {
  res.send(`User ${req.params.id}`)
})

router.post('/', (req, res) => {
  res.send('Create user')
})

module.exports = router

// app.js
const usersRouter = require('./routes/users')
app.use('/users', usersRouter)
```

### 路由链式调用

```javascript
app.route('/book')
  .get((req, res) => {
    res.send('Get a random book')
  })
  .post((req, res) => {
    res.send('Add a book')
  })
  .put((req, res) => {
    res.send('Update the book')
  })
```



---

## 中间件

中间件是 Express 的核心概念，是一个可以访问请求对象（req）、响应对象（res）和下一个中间件函数（next）的函数。

### 中间件类型

**1. 应用级中间件**

```javascript
const express = require('express')
const app = express()

// 无挂载路径的中间件，每个请求都会执行
app.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})

// 挂载在 /user/:id 路径的中间件
app.use('/user/:id', (req, res, next) => {
  console.log('Request Type:', req.method)
  next()
})

// 路由和处理函数
app.get('/user/:id', (req, res) => {
  res.send('USER')
})
```

**2. 路由级中间件**

```javascript
const router = express.Router()

// 路由级中间件
router.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl)
  next()
})

router.get('/user/:id', (req, res) => {
  res.send('User info')
})

app.use('/', router)
```

**3. 错误处理中间件**

```javascript
// 错误处理中间件必须有 4 个参数
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
```

**4. 内置中间件**

```javascript
// 解析 JSON 请求体
app.use(express.json())

// 解析 URL-encoded 请求体
app.use(express.urlencoded({ extended: true }))

// 提供静态文件
app.use(express.static('public'))
```

**5. 第三方中间件**

```javascript
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

// Cookie 解析
app.use(cookieParser())

// HTTP 请求日志
app.use(morgan('combined'))

// 安全头
app.use(helmet())

// CORS
app.use(cors())
```

### 中间件执行顺序

中间件按照注册顺序执行，必须调用 `next()` 才能传递到下一个中间件。

```javascript
const express = require('express')
const app = express()

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
  console.log('Route handler')
  res.send('Hello')
})

// 输出顺序：
// Middleware 1
// Middleware 2
// Route handler
```

### 多个处理函数

```javascript
// 使用数组
const logOriginalUrl = (req, res, next) => {
  console.log('Request URL:', req.originalUrl)
  next()
}

const logMethod = (req, res, next) => {
  console.log('Request Type:', req.method)
  next()
}

app.get('/user/:id', [logOriginalUrl, logMethod], (req, res) => {
  res.send('User Info')
})

// 使用多个参数
app.get('/user/:id', logOriginalUrl, logMethod, (req, res) => {
  res.send('User Info')
})
```

### 异步中间件

```javascript
// 使用 async/await
app.get('/', async (req, res, next) => {
  try {
    const data = await fetchData()
    res.send(data)
  } catch (err) {
    next(err)  // 传递错误到错误处理中间件
  }
})

// 封装异步处理器
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

app.get('/', asyncHandler(async (req, res) => {
  const data = await fetchData()
  res.send(data)
}))
```

---

## 请求与响应

### 请求对象（req）

```javascript
app.get('/user/:id', (req, res) => {
  // 路径参数
  console.log(req.params.id)
  
  // 查询参数
  console.log(req.query)
  
  // 请求体
  console.log(req.body)
  
  // 请求头
  console.log(req.headers)
  console.log(req.get('Content-Type'))
  
  // Cookie
  console.log(req.cookies)
  
  // 请求方法
  console.log(req.method)
  
  // 请求路径
  console.log(req.path)
  console.log(req.originalUrl)
  
  // 主机名
  console.log(req.hostname)
  
  // IP 地址
  console.log(req.ip)
  
  // 协议
  console.log(req.protocol)
  
  // 是否为 HTTPS
  console.log(req.secure)
})
```

### 响应对象（res）

```javascript
app.get('/api/user', (req, res) => {
  // 发送字符串
  res.send('Hello')
  
  // 发送 JSON
  res.json({ name: 'John', age: 30 })
  
  // 设置状态码
  res.status(404).send('Not Found')
  res.status(201).json({ message: 'Created' })
  
  // 重定向
  res.redirect('/login')
  res.redirect(301, '/new-url')
  
  // 设置响应头
  res.set('Content-Type', 'text/html')
  res.set({
    'Content-Type': 'text/html',
    'Content-Length': '123'
  })
  
  // 发送文件
  res.sendFile('/path/to/file.pdf')
  
  // 下载文件
  res.download('/path/to/file.pdf')
  res.download('/path/to/file.pdf', 'custom-name.pdf')
  
  // 渲染模板
  res.render('index', { title: 'Home' })
  
  // 设置 Cookie
  res.cookie('name', 'value', { maxAge: 900000, httpOnly: true })
  
  // 清除 Cookie
  res.clearCookie('name')
  
  // 结束响应
  res.end()
})
```

---

## 错误处理

### 同步错误

同步代码中的错误会被 Express 自动捕获。

```javascript
app.get('/', (req, res) => {
  throw new Error('Something went wrong')  // 自动捕获
})
```

### 异步错误

异步代码中的错误需要传递给 `next()`。

```javascript
// ❌ 错误：异步错误未捕获
app.get('/', (req, res) => {
  setTimeout(() => {
    throw new Error('Async error')  // 不会被捕获！
  }, 1000)
})

// ✅ 正确：传递给 next
app.get('/', (req, res, next) => {
  setTimeout(() => {
    next(new Error('Async error'))
  }, 1000)
})

// ✅ 使用 Promise
app.get('/', (req, res, next) => {
  fetchData()
    .then(data => res.send(data))
    .catch(next)
})

// ✅ 使用 async/await
app.get('/', async (req, res, next) => {
  try {
    const data = await fetchData()
    res.send(data)
  } catch (err) {
    next(err)
  }
})
```

### 错误处理中间件

错误处理中间件必须有 4 个参数，并且要在所有其他中间件之后定义。

```javascript
// 日志错误
const logErrors = (err, req, res, next) => {
  console.error(err.stack)
  next(err)
}

// 客户端错误处理
const clientErrorHandler = (err, req, res, next) => {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

// 通用错误处理
const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  })
}

// 注册错误处理中间件
app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)
```

### 自定义错误类

```javascript
// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// 使用
app.get('/user/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    res.json(user)
  } catch (err) {
    next(err)
  }
})

// 错误处理中间件
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})
```

### 404 处理

```javascript
// 404 处理（放在所有路由之后）
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})

// 或者使用自定义错误
app.use((req, res, next) => {
  next(new AppError('Page not found', 404))
})
```



---

## 模板引擎

Express 支持多种模板引擎，如 Pug、EJS、Handlebars 等。

### 配置模板引擎

```javascript
const express = require('express')
const app = express()

// 设置模板目录
app.set('views', './views')

// 设置模板引擎
app.set('view engine', 'pug')
```

### 使用 Pug

```bash
npm install pug
```

```pug
// views/index.pug
html
  head
    title= title
  body
    h1= message
    p Welcome to #{title}
```

```javascript
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Express',
    message: 'Hello there!'
  })
})
```

### 使用 EJS

```bash
npm install ejs
```

```html
<!-- views/index.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
</head>
<body>
  <h1><%= message %></h1>
  <p>Welcome to <%= title %></p>
</body>
</html>
```

```javascript
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Express',
    message: 'Hello there!'
  })
})
```

### 使用 Handlebars

```bash
npm install express-handlebars
```

```javascript
const { engine } = require('express-handlebars')

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')
```

```handlebars
<!-- views/home.handlebars -->
<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
</head>
<body>
  <h1>{{message}}</h1>
</body>
</html>
```

---

## 静态文件

使用 `express.static` 中间件提供静态文件服务。

### 基础用法

```javascript
// 提供 public 目录下的静态文件
app.use(express.static('public'))

// 访问方式：
// http://localhost:3000/images/logo.png
// http://localhost:3000/css/style.css
// http://localhost:3000/js/app.js
```

### 多个静态目录

```javascript
app.use(express.static('public'))
app.use(express.static('files'))
```

### 虚拟路径前缀

```javascript
// 使用 /static 前缀
app.use('/static', express.static('public'))

// 访问方式：
// http://localhost:3000/static/images/logo.png
// http://localhost:3000/static/css/style.css
```

### 绝对路径

```javascript
const path = require('path')

app.use('/static', express.static(path.join(__dirname, 'public')))
```

### 缓存控制

```javascript
// 设置缓存时间（毫秒）
app.use(express.static('public', {
  maxAge: '1d'  // 1 天
}))

// 禁用缓存
app.use(express.static('public', {
  maxAge: 0
}))
```

---

## 数据库集成

### MongoDB (Mongoose)

```bash
npm install mongoose
```

```javascript
const mongoose = require('mongoose')

// 连接数据库
mongoose.connect('mongodb://localhost/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// 定义模型
const User = mongoose.model('User', {
  name: String,
  email: String,
  age: Number
})

// 创建用户
app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body)
    await user.save()
    res.status(201).json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// 查询用户
app.get('/users', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 查询单个用户
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 更新用户
app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// 删除用户
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

### MySQL (Sequelize)

```bash
npm install sequelize mysql2
```

```javascript
const { Sequelize, DataTypes } = require('sequelize')

// 连接数据库
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
})

// 定义模型
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  age: {
    type: DataTypes.INTEGER
  }
})

// 同步模型
sequelize.sync()

// CRUD 操作
app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

### PostgreSQL (Prisma)

```bash
npm install @prisma/client
npx prisma init
```

```prisma
// prisma/schema.prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
  age   Int?
}
```

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

app.post('/users', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: req.body
    })
    res.status(201).json(user)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

---

## 安全最佳实践

### 使用 Helmet

Helmet 通过设置各种 HTTP 头来保护应用。

```bash
npm install helmet
```

```javascript
const helmet = require('helmet')

// 使用默认配置
app.use(helmet())

// 自定义配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}))
```

### CORS 配置

```bash
npm install cors
```

```javascript
const cors = require('cors')

// 允许所有来源
app.use(cors())

// 自定义配置
app.use(cors({
  origin: 'https://example.com',
  methods: ['GET', 'POST'],
  credentials: true
}))

// 动态配置
const corsOptions = {
  origin: (origin, callback) => {
    const whitelist = ['https://example.com', 'https://api.example.com']
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions))
```

### 输入验证

```bash
npm install express-validator
```

```javascript
const { body, validationResult } = require('express-validator')

app.post('/user', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  
  // 处理请求
  res.json({ message: 'User created' })
})
```

### 限流

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 分钟
  max: 100,  // 最多 100 个请求
  message: 'Too many requests from this IP'
})

// 应用到所有请求
app.use(limiter)

// 应用到特定路由
app.use('/api/', limiter)
```

### SQL 注入防护

```javascript
// ❌ 错误：SQL 注入风险
app.get('/user', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.query.id}`
  db.query(query)
})

// ✅ 正确：使用参数化查询
app.get('/user', (req, res) => {
  const query = 'SELECT * FROM users WHERE id = ?'
  db.query(query, [req.query.id])
})
```

### XSS 防护

```bash
npm install xss-clean
```

```javascript
const xss = require('xss-clean')

app.use(xss())
```



---

## 性能优化

### 使用 Gzip 压缩

```bash
npm install compression
```

```javascript
const compression = require('compression')

app.use(compression())
```

### 启用缓存

```javascript
// 设置缓存头
app.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300')  // 5 分钟
  res.json({ data: 'cached data' })
})

// 使用 ETag
app.set('etag', 'strong')
```

### 使用 PM2 进程管理

```bash
npm install -g pm2

# 启动应用
pm2 start app.js

# 集群模式
pm2 start app.js -i max

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启
pm2 restart app

# 停止
pm2 stop app
```

### 数据库连接池

```javascript
// MongoDB
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 10  // 连接池大小
})

// MySQL
const mysql = require('mysql2')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'myapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
```

### 异步操作优化

```javascript
// ❌ 错误：串行执行
app.get('/data', async (req, res) => {
  const users = await fetchUsers()
  const posts = await fetchPosts()
  const comments = await fetchComments()
  
  res.json({ users, posts, comments })
})

// ✅ 正确：并行执行
app.get('/data', async (req, res) => {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ])
  
  res.json({ users, posts, commen
(data) => {
        client.setex(key, duration, JSON.stringify(data))
        originalJson(data)
      }
      
      next()
    } catch (err) {
      next(err)
    }
  }
}

// 使用缓存
app.get('/api/data', cache(300), async (req, res) => {
  const data = await fetchData()
  res.json(data)
})
```

### 日志优化

```bash
npm install morgan pino pino-http
```

```javascript
const morgan = require('morgan')
const pino = require('pino')
const pinoHttp = require('pino-http')

// 开发环境
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// 生产环境
if (process.env.NODE_ENV === 'production') {
  const logger = pino({
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  })
  
  app.use(pinoHttp({ logger }))
}
```

### 监控和性能分析

```javascript
// 添加健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  })
})

// 添加指标端点
app.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage()
  
  res.json({
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    },
    uptime: process.uptime(),
    pid: process.pid
  })
})
```

---

## 完整示例

### RESTful API 示例

```javascript
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()

// 中间件
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
app.use('/api/', limiter)

// 路由
const usersRouter = require('./routes/users')
const postsRouter = require('./routes/posts')

app.use('/api/users', usersRouter)
app.use('/api/posts', postsRouter)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack)
  
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
})

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// 优雅退出
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})
```

---

## 参考资源

### 官方资源
- [Express 官方文档](https://expressjs.com/) - 最权威的 Express 文档
- [Express API 参考](https://expressjs.com/en/4x/api.html) - 完整的 API 文档
- [Express 指南](https://expressjs.com/en/guide/routing.html) - 官方学习指南
- [Express GitHub](https://github.com/expressjs/express) - 官方 GitHub 仓库

### 中间件
- [Express 中间件列表](https://expressjs.com/en/resources/middleware.html) - 官方中间件列表
- [Helmet](https://helmetjs.github.io/) - 安全中间件
- [Morgan](https://github.com/expressjs/morgan) - HTTP 请求日志
- [CORS](https://github.com/expressjs/cors) - 跨域资源共享
- [Compression](https://github.com/expressjs/compression) - Gzip 压缩

### 最佳实践
- [Express 生产最佳实践](https://expressjs.com/en/advanced/best-practice-performance.html) - 性能优化
- [Express 安全最佳实践](https://expressjs.com/en/advanced/best-practice-security.html) - 安全加固
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices) - 社区最佳实践

### 学习资源
- [Express 教程 - MDN](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs) - MDN 的 Express 教程
- [Express 中文网](https://www.expressjs.com.cn/) - 中文文档

---

> 本文档基于 Express 官方文档和 MCP Context7 最新资料整理，涵盖核心概念、路由系统、中间件、请求响应、错误处理、模板引擎、静态文件、数据库集成、安全最佳实践和性能优化。所有代码示例均可运行，并包含详细的中文注释。
