# Node.js 开发指南

> 更新时间：2025-02

## 目录导航

- [核心概念](#核心概念)
- [事件循环](#事件循环)
- [异步编程](#异步编程)
- [模块系统](#模块系统)
- [Stream 流](#stream-流)
- [Buffer 缓冲区](#buffer-缓冲区)
- [进程与线程](#进程与线程)
- [性能优化](#性能优化)
- [错误处理](#错误处理)
- [最佳实践](#最佳实践)

## 核心概念

### 什么是 Node.js？

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境，让 JavaScript 可以在服务器端运行。

**核心特点**：
- **事件驱动**：基于事件循环处理异步操作
- **非阻塞 I/O**：高效处理并发请求
- **单线程**：主线程单线程，通过事件循环实现并发
- **跨平台**：支持 Windows、Linux、macOS

**适用场景**：
- I/O 密集型应用（API 服务、实时通信）
- 微服务架构
- 工具链开发（构建工具、CLI 工具）
- 服务端渲染（SSR）

**不适用场景**：
- CPU 密集型计算（可使用 Worker Threads 解决）
- 需要强类型的大型项目（建议使用 TypeScript）

### 版本管理

**LTS 版本**：
- 偶数版本为 LTS（Long Term Support）
- 推荐生产环境使用 LTS 版本
- 当前 LTS：Node.js 20.x、22.x

**版本切换工具**：
- **nvm**（Node Version Manager）：跨平台版本管理
- **fnm**（Fast Node Manager）：更快的版本管理工具


```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装指定版本
nvm install 20
nvm install 22

# 切换版本
nvm use 20

# 设置默认版本
nvm alias default 20
```

## 事件循环

### 事件循环机制

Node.js 的事件循环是其核心机制，负责处理异步操作。

**事件循环阶段**：

```
   ┌───────────────────────────┐
┌─>│           timers          │  执行 setTimeout、setInterval 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  执行延迟到下一个循环迭代的 I/O 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  仅系统内部使用
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │  执行 setImmediate 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  执行 close 事件回调
   └───────────────────────────┘
```

**代码示例**：

```javascript
// 事件循环执行顺序
console.log('1: 同步代码')

setTimeout(() => {
  console.log('2: setTimeout')
}, 0)

setImmediate(() => {
  console.log('3: setImmediate')
})

process.nextTick(() => {
  console.log('4: nextTick')
})

Promise.resolve().then(() => {
  console.log('5: Promise')
})

console.log('6: 同步代码')

// 输出顺序：
// 1: 同步代码
// 6: 同步代码
// 4: nextTick
// 5: Promise
// 2: setTimeout
// 3: setImmediate
```

### process.nextTick vs setImmediate

**process.nextTick**：
- 在当前阶段结束后立即执行
- 优先级最高
- 可能导致事件循环饥饿

```javascript
process.nextTick(() => {
  console.log('nextTick 1')
  process.nextTick(() => {
    console.log('nextTick 2')
  })
})

setImmediate(() => {
  console.log('setImmediate')
})

// 输出：nextTick 1 → nextTick 2 → setImmediate
```

**setImmediate**：
- 在 check 阶段执行
- 不会阻塞事件循环

```javascript
// I/O 回调中的执行顺序
const fs = require('fs')

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('setTimeout')
  }, 0)
  
  setImmediate(() => {
    console.log('setImmediate')
  })
})

// 输出：setImmediate → setTimeout
// 在 I/O 回调中，setImmediate 总是先于 setTimeout 执行
```


## 异步编程

### 回调函数（Callback）

Node.js 早期的异步模式，容易产生回调地狱。

```javascript
// 回调地狱示例
fs.readFile('file1.txt', (err, data1) => {
  if (err) return console.error(err)
  
  fs.readFile('file2.txt', (err, data2) => {
    if (err) return console.error(err)
    
    fs.readFile('file3.txt', (err, data3) => {
      if (err) return console.error(err)
      
      console.log(data1, data2, data3)
    })
  })
})

// 错误优先回调（Error-First Callback）
function readFileCallback(path, callback) {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      return callback(err)  // 错误作为第一个参数
    }
    callback(null, data)  // 成功时第一个参数为 null
  })
}
```

### Promise

Promise 解决了回调地狱问题，提供了更好的错误处理。

```javascript
const fs = require('fs').promises

// Promise 链式调用
fs.readFile('file1.txt', 'utf8')
  .then(data1 => {
    console.log(data1)
    return fs.readFile('file2.txt', 'utf8')
  })
  .then(data2 => {
    console.log(data2)
    return fs.readFile('file3.txt', 'utf8')
  })
  .then(data3 => {
    console.log(data3)
  })
  .catch(err => {
    console.error('Error:', err)
  })

// Promise.all 并行执行
Promise.all([
  fs.readFile('file1.txt', 'utf8'),
  fs.readFile('file2.txt', 'utf8'),
  fs.readFile('file3.txt', 'utf8')
])
  .then(([data1, data2, data3]) => {
    console.log(data1, data2, data3)
  })
  .catch(err => {
    console.error('Error:', err)
  })

// Promise.allSettled 等待所有 Promise 完成
Promise.allSettled([
  fs.readFile('file1.txt', 'utf8'),
  fs.readFile('nonexistent.txt', 'utf8'),
  fs.readFile('file3.txt', 'utf8')
])
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`File ${index + 1}:`, result.value)
      } else {
        console.error(`File ${index + 1} failed:`, result.reason)
      }
    })
  })
```

### Async/Await

Async/Await 是 Promise 的语法糖，让异步代码看起来像同步代码。

```javascript
const fs = require('fs').promises

// 基础用法
async function readFiles() {
  try {
    const data1 = await fs.readFile('file1.txt', 'utf8')
    const data2 = await fs.readFile('file2.txt', 'utf8')
    const data3 = await fs.readFile('file3.txt', 'utf8')
    
    console.log(data1, data2, data3)
  } catch (err) {
    console.error('Error:', err)
  }
}

// 并行执行
async function readFilesParallel() {
  try {
    const [data1, data2, data3] = await Promise.all([
      fs.readFile('file1.txt', 'utf8'),
      fs.readFile('file2.txt', 'utf8'),
      fs.readFile('file3.txt', 'utf8')
    ])
    
    console.log(data1, data2, data3)
  } catch (err) {
    console.error('Error:', err)
  }
}

// 顶层 await（ES2022）
// 在 ES 模块中可以直接使用 await
const data = await fs.readFile('file.txt', 'utf8')
console.log(data)
```


## 模块系统

### CommonJS (CJS)

Node.js 默认的模块系统。

```javascript
// math.js - 导出模块
function add(a, b) {
  return a + b
}

function subtract(a, b) {
  return a - b
}

// 方式 1：exports 对象
exports.add = add
exports.subtract = subtract

// 方式 2：module.exports
module.exports = {
  add,
  subtract
}

// 方式 3：导出单个函数
module.exports = add

// app.js - 导入模块
const math = require('./math')
console.log(math.add(1, 2))  // 3

// 解构导入
const { add, subtract } = require('./math')
console.log(add(1, 2))  // 3

// 导入内置模块
const fs = require('fs')
const path = require('path')

// 导入第三方模块
const express = require('express')
```

### ES Modules (ESM)

现代 JavaScript 的模块系统，Node.js 13.2.0+ 支持。

```javascript
// math.mjs - 导出模块
export function add(a, b) {
  return a + b
}

export function subtract(a, b) {
  return a - b
}

// 默认导出
export default function multiply(a, b) {
  return a * b
}

// app.mjs - 导入模块
import multiply, { add, subtract } from './math.mjs'

console.log(add(1, 2))  // 3
console.log(multiply(2, 3))  // 6

// 导入所有导出
import * as math from './math.mjs'
console.log(math.add(1, 2))  // 3

// 动态导入
const math = await import('./math.mjs')
console.log(math.add(1, 2))  // 3
```

**启用 ESM**：

```json
// package.json
{
  "type": "module"
}
```

或使用 `.mjs` 文件扩展名。

### 模块加载机制

**模块缓存**：

```javascript
// counter.js
let count = 0

module.exports = {
  increment() {
    count++
  },
  getCount() {
    return count
  }
}

// app.js
const counter1 = require('./counter')
const counter2 = require('./counter')

counter1.increment()
console.log(counter2.getCount())  // 1（模块被缓存，共享状态）

// 清除缓存
delete require.cache[require.resolve('./counter')]
const counter3 = require('./counter')
console.log(counter3.getCount())  // 0（重新加载模块）
```

**模块查找顺序**：

1. 核心模块（如 `fs`、`path`）
2. 文件模块（相对路径或绝对路径）
3. `node_modules` 目录（从当前目录向上查找）

```javascript
// 查找顺序示例
require('fs')  // 核心模块
require('./math')  // 文件模块
require('express')  // node_modules 模块

// 模块解析规则
require('./math')
// 查找顺序：
// 1. ./math.js
// 2. ./math.json
// 3. ./math.node
// 4. ./math/index.js
// 5. ./math/package.json 中的 main 字段
```


## Stream 流

Stream 是 Node.js 处理流式数据的抽象接口，适合处理大文件和实时数据。

### Stream 类型

**1. Readable（可读流）**：

```javascript
const fs = require('fs')

// 创建可读流
const readStream = fs.createReadStream('large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024  // 64KB 缓冲区
})

// 监听数据事件
readStream.on('data', (chunk) => {
  console.log('Received chunk:', chunk.length)
})

readStream.on('end', () => {
  console.log('Reading finished')
})

readStream.on('error', (err) => {
  console.error('Error:', err)
})

// 暂停和恢复
readStream.pause()
setTimeout(() => {
  readStream.resume()
}, 1000)
```

**2. Writable（可写流）**：

```javascript
const fs = require('fs')

// 创建可写流
const writeStream = fs.createWriteStream('output.txt')

// 写入数据
writeStream.write('Hello ')
writeStream.write('World\n')

// 结束写入
writeStream.end('Goodbye')

writeStream.on('finish', () => {
  console.log('Writing finished')
})

writeStream.on('error', (err) => {
  console.error('Error:', err)
})
```

**3. Duplex（双工流）**：

```javascript
const { Duplex } = require('stream')

// 创建双工流
const duplexStream = new Duplex({
  read(size) {
    this.push('data')
    this.push(null)  // 结束读取
  },
  write(chunk, encoding, callback) {
    console.log('Writing:', chunk.toString())
    callback()
  }
})

duplexStream.on('data', (chunk) => {
  console.log('Reading:', chunk.toString())
})

duplexStream.write('Hello')
duplexStream.end()
```

**4. Transform（转换流）**：

```javascript
const { Transform } = require('stream')

// 创建转换流（大写转换）
const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  }
})

// 使用管道
process.stdin
  .pipe(upperCaseTransform)
  .pipe(process.stdout)
```

### 管道（Pipe）

管道是连接流的最佳方式，自动处理背压（backpressure）。

```javascript
const fs = require('fs')
const zlib = require('zlib')

// 文件复制
fs.createReadStream('input.txt')
  .pipe(fs.createWriteStream('output.txt'))

// 文件压缩
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('input.txt.gz'))

// 链式管道
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('output.txt.gz'))
  .on('finish', () => {
    console.log('Compression finished')
  })

// 错误处理
const pipeline = require('stream').pipeline

pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.txt.gz'),
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err)
    } else {
      console.log('Pipeline succeeded')
    }
  }
)
```

## Buffer 缓冲区

Buffer 用于处理二进制数据，在 Node.js 中广泛用于文件操作、网络通信等。

### 创建 Buffer

```javascript
// 方式 1：从字符串创建
const buf1 = Buffer.from('Hello World', 'utf8')
console.log(buf1)  // <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64>

// 方式 2：创建指定大小的 Buffer
const buf2 = Buffer.alloc(10)  // 创建 10 字节的 Buffer，填充 0
const buf3 = Buffer.allocUnsafe(10)  // 更快，但内容未初始化

// 方式 3：从数组创建
const buf4 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f])
console.log(buf4.toString())  // 'Hello'
```

### Buffer 操作

```javascript
const buf = Buffer.from('Hello World')

// 读取
console.log(buf[0])  // 72（'H' 的 ASCII 码）
console.log(buf.toString())  // 'Hello World'
console.log(buf.toString('hex'))  // '48656c6c6f20576f726c64'
console.log(buf.toString('base64'))  // 'SGVsbG8gV29ybGQ='

// 写入
buf.write('Hi', 0, 2)
console.log(buf.toString())  // 'Hillo World'

// 切片
const slice = buf.slice(0, 5)
console.log(slice.toString())  // 'Hillo'

// 拷贝
const buf2 = Buffer.alloc(11)
buf.copy(buf2)
console.log(buf2.toString())  // 'Hillo World'

// 拼接
const buf3 = Buffer.concat([buf, Buffer.from(' '), Buffer.from('!')])
console.log(buf3.toString())  // 'Hillo World !'
```

### Buffer 与 Stream

```javascript
const fs = require('fs')

// 使用 Buffer 读取文件（一次性加载到内存）
const data = fs.readFileSync('file.txt')
console.log(data)  // Buffer

// 使用 Stream 读取文件（分块处理）
const stream = fs.createReadStream('large-file.txt')
stream.on('data', (chunk) => {
  console.log('Chunk:', chunk)  // 每个 chunk 是一个 Buffer
})
```

## 进程与线程

### 单进程 vs 多进程

Node.js 默认是单进程单线程，但可以通过 Cluster 和 Worker Threads 实现并发。

**Cluster（多进程）**：

```javascript
const cluster = require('cluster')
const http = require('http')
const numCPUs = require('os').cpus().length

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`)
  
  // 创建工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`)
    // 重启工作进程
    cluster.fork()
  })
} else {
  // 工作进程创建 HTTP 服务器
  http.createServer((req, res) => {
    res.writeHead(200)
    res.end(`Hello from worker ${process.pid}\n`)
  }).listen(8000)
  
  console.log(`Worker ${process.pid} started`)
}
```

**Worker Threads（多线程）**：

```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')

if (isMainThread) {
  // 主线程
  console.log('Main thread')
  
  const worker = new Worker(__filename, {
    workerData: { num: 5 }
  })
  
  worker.on('message', (result) => {
    console.log('Result from worker:', result)
  })
  
  worker.on('error', (err) => {
    console.error('Worker error:', err)
  })
  
  worker.on('exit', (code) => {
    console.log(`Worker exited with code ${code}`)
  })
} else {
  // 工作线程
  console.log('Worker thread')
  
  // CPU 密集型计算
  function fibonacci(n) {
    if (n <= 1) return n
    return fibonacci(n - 1) + fibonacci(n - 2)
  }
  
  const result = fibonacci(workerData.num)
  parentPort.postMessage(result)
}
```

### Cluster vs Worker Threads

| 特性 | Cluster | Worker Threads |
|------|---------|----------------|
| 类型 | 多进程 | 多线程 |
| 内存 | 独立内存空间 | 共享内存 |
| 通信 | IPC（进程间通信） | 消息传递 |
| 开销 | 较大 | 较小 |
| 适用场景 | I/O 密集型、负载均衡 | CPU 密集型计算 |


## 性能优化

### 避免阻塞事件循环

**不要使用同步 API**：

```javascript
// ❌ 错误：阻塞事件循环
const data = fs.readFileSync('large-file.txt')

// ✅ 正确：使用异步 API
fs.readFile('large-file.txt', (err, data) => {
  if (err) throw err
  console.log(data)
})

// ✅ 更好：使用 Promise
const fs = require('fs').promises
const data = await fs.readFile('large-file.txt')
```

**避免 CPU 密集型计算**：

```javascript
// ❌ 错误：阻塞事件循环
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

app.get('/fib/:n', (req, res) => {
  const result = fibonacci(req.params.n)  // 阻塞！
  res.json({ result })
})

// ✅ 正确：使用 Worker Threads
const { Worker } = require('worker_threads')

app.get('/fib/:n', (req, res) => {
  const worker = new Worker('./fibonacci-worker.js', {
    workerData: { n: req.params.n }
  })
  
  worker.on('message', (result) => {
    res.json({ result })
  })
  
  worker.on('error', (err) => {
    res.status(500).json({ error: err.message })
  })
})
```

### 内存管理

**监控内存使用**：

```javascript
// 查看内存使用情况
console.log(process.memoryUsage())
// {
//   rss: 30MB,        // 常驻内存
//   heapTotal: 10MB,  // 堆总大小
//   heapUsed: 5MB,    // 堆使用大小
//   external: 1MB,    // C++ 对象内存
//   arrayBuffers: 0   // ArrayBuffer 内存
// }

// 定期检查内存
setInterval(() => {
  const used = process.memoryUsage()
  console.log(`Memory: ${Math.round(used.heapUsed / 1024 / 1024)} MB`)
}, 5000)
```

**避免内存泄漏**：

```javascript
// ❌ 错误：事件监听器未清理
const EventEmitter = require('events')
const emitter = new EventEmitter()

function addListener() {
  emitter.on('event', () => {
    console.log('Event fired')
  })
}

// 多次调用会累积监听器
for (let i = 0; i < 1000; i++) {
  addListener()
}

// ✅ 正确：清理事件监听器
function addListener() {
  const handler = () => {
    console.log('Event fired')
  }
  emitter.on('event', handler
0)  // 1 分钟后过期
  
  return data
}

// 使用 LRU 缓存
const LRU = require('lru-cache')

const cache = new LRU({
  max: 500,  // 最多 500 个条目
  maxAge: 1000 * 60 * 60  // 1 小时过期
})

async function getData(key) {
  let data = cache.get(key)
  
  if (!data) {
    data = await db.query(key)
    cache.set(key, data)
  }
  
  return data
}
```

## 错误处理

### 同步错误处理

```javascript
// try-catch 捕获同步错误
try {
  const data = JSON.parse(invalidJSON)
} catch (err) {
  console.error('Parse error:', err.message)
}

// 函数错误处理
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}

try {
  const result = divide(10, 0)
} catch (err) {
  console.error('Error:', err.message)
}
```

### 异步错误处理

**回调错误处理**：

```javascript
fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error('Error:', err)
    return
  }
  console.log(data)
})
```

**Promise 错误处理**：

```javascript
fs.promises.readFile('file.txt')
  .then(data => {
    console.log(data)
  })
  .catch(err => {
    console.error('Error:', err)
  })

// Async/Await
async function readFile() {
  try {
    const data = await fs.promises.readFile('file.txt')
    console.log(data)
  } catch (err) {
    console.error('Error:', err)
  }
}
```

### 未捕获异常处理

```javascript
// 捕获未处理的 Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // 记录日志、发送告警
  process.exit(1)
})

// 捕获未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  // 记录日志、发送告警
  process.exit(1)
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

### 自定义错误类

```javascript
// 自定义错误类
class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
    this.statusCode = 400
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
    this.statusCode = 404
  }
}

// 使用
function validateUser(user) {
  if (!user.email) {
    throw new ValidationError('Email is required')
  }
  if (!user.password) {
    throw new ValidationError('Password is required')
  }
}

// Express 错误处理中间件
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
```

## 最佳实践

### 1. 使用环境变量

```javascript
// .env 文件
// PORT=3000
// DB_HOST=localhost
// DB_USER=admin
// DB_PASS=secret

// 使用 dotenv
require('dotenv').config()

const port = process.env.PORT || 3000
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
}
```

### 2. 日志管理

```javascript
// 使用 winston
const winston = require('winston')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

logger.info('Server started')
logger.error('Error occurred', { error: err })
```

### 3. 安全最佳实践

```javascript
// 使用 helmet 保护 Express 应用
const helmet = require('helmet')
app.use(helmet())

// 限流
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 分钟
  max: 100  // 最多 100 个请求
})
app.use('/api/', limiter)

// 输入验证
const { body, validationResult } = require('express-validator')

app.post('/user', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  // 处理请求
})

// SQL 注入防护
const mysql = require('mysql2/promise')
const connection = await mysql.createConnection(config)

// ❌ 错误：SQL 注入风险
const [rows] = await connection.query(`SELECT * FROM users WHERE id = ${userId}`)

// ✅ 正确：使用参数化查询
const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [userId])
```

### 4. 进程管理

```javascript
// 使用 PM2 管理进程
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'app',
    script: './app.js',
    instances: 'max',  // 使用所有 CPU 核心
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}

// 启动：pm2 start ecosystem.config.js
// 重启：pm2 restart app
// 停止：pm2 stop app
// 查看日志：pm2 logs app
```

### 5. 性能监控

```javascript
// 使用 clinic.js 进行性能分析
// npm install -g clinic
// clinic doctor -- node app.js

// 使用 0x 进行火焰图分析
// npm install -g 0x
// 0x app.js

// 应用内监控
const v8 = require('v8')

// 生成堆快照
const heapSnapshot = v8.writeHeapSnapshot()
console.log('Heap snapshot written to', heapSnapshot)

// CPU 分析
const { performance } = require('perf_hooks')

const start = performance.now()
// 执行操作
const end = performance.now()
console.log(`Operation took ${end - start}ms`)
```

## 参考资源

- [Node.js 官方文档](https://nodejs.org/en/docs/)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [Event Loop 详解](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Stream 手册](https://nodejs.org/api/stream.html)
- [Worker Threads](https://nodejs.org/api/worker_threads.html)

---

> 本文档基于 Node.js 官方文档整理，涵盖核心概念、异步编程、模块系统、Stream、Buffer、进程线程、性能优化、错误处理和最佳实践。
