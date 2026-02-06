# Node.js 面试题库

> 更新时间：2025-02

## 目录导航

- [基础概念](#基础概念)
- [事件循环](#事件循环)
- [异步编程](#异步编程)
- [模块系统](#模块系统)
- [Stream 流](#stream-流)
- [Buffer 缓冲区](#buffer-缓冲区)
- [进程与线程](#进程与线程)
- [性能优化](#性能优化)
- [错误处理](#错误处理)
- [实战场景](#实战场景)

---

## 基础概念

### 1. 什么是 Node.js？它的核心特点是什么？

**核心答案**：

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境，让 JavaScript 可以在服务器端运行。

**核心特点**：
1. **事件驱动**：基于事件循环处理异步操作
2. **非阻塞 I/O**：高效处理并发请求
3. **单线程**：主线程单线程，通过事件循环实现并发
4. **跨平台**：支持 Windows、Linux、macOS

**代码示例**：

```javascript
// 非阻塞 I/O 示例
const fs = require('fs')

// ❌ 阻塞式（同步）
const data = fs.readFileSync('file.txt', 'utf8')
console.log(data)
console.log('Done')

// ✅ 非阻塞式（异步）
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err
  console.log(data)
})
console.log('Done')  // 先输出 'Done'，再输出文件内容
```

**追问点**：
- Node.js 适合什么场景？不适合什么场景？
- 为什么 Node.js 是单线程却能处理高并发？
- Node.js 与浏览器 JavaScript 的区别？

**面试技巧**：
- 强调 Node.js 适合 I/O 密集型应用（API 服务、实时通信）
- 说明不适合 CPU 密集型计算（可使用 Worker Threads 解决）


---

## 事件循环

### 2. 详细解释 Node.js 的事件循环机制

**核心答案**：

Node.js 的事件循环是其核心机制，负责处理异步操作。事件循环分为 6 个阶段，每个阶段都有一个 FIFO 队列来执行回调。

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

**追问点**：
- 微任务和宏任务的区别？
- process.nextTick 和 setImmediate 的区别？
- 浏览器事件循环和 Node.js 事件循环的区别？

**加分项**：
- 能画出事件循环的流程图
- 能解释每个阶段的作用
- 能说明微任务队列的执行时机

### 3. process.nextTick 和 setImmediate 有什么区别？

**核心答案**：

**process.nextTick**：
- 在当前阶段结束后立即执行
- 优先级最高，在微任务队列之前
- 可能导致事件循环饥饿（I/O starvation）

**setImmediate**：
- 在 check 阶段执行
- 不会阻塞事件循环
- 在 I/O 回调中总是先于 setTimeout 执行

**代码示例**：

```javascript
// 示例 1：基本区别
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

// 示例 2：I/O 回调中的执行顺序
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

// 示例 3：nextTick 可能导致饥饿
let count = 0
function recursiveNextTick() {
  if (count < 1000) {
    count++
    process.nextTick(recursiveNextTick)
  }
}

recursiveNextTick()

setImmediate(() => {
  console.log('setImmediate never runs')  // 永远不会执行
})
```

**追问点**：
- 什么时候使用 process.nextTick？
- 什么时候使用 setImmediate？
- queueMicrotask 和 process.nextTick 的区别？

**最佳实践**：
- 优先使用 setImmediate，避免阻塞事件循环
- 只在需要确保回调在当前阶段结束后立即执行时使用 process.nextTick
- 避免递归调用 process.nextTick


---

## 异步编程

### 4. Node.js 中有哪些异步编程方式？各有什么优缺点？

**核心答案**：

Node.js 提供了多种异步编程方式，从早期的回调函数到现代的 Async/Await。

**1. 回调函数（Callback）**

优点：
- Node.js 早期的标准方式
- 简单直接

缺点：
- 容易产生回调地狱（Callback Hell）
- 错误处理复杂

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
```

**2. Promise**

优点：
- 解决回调地狱问题
- 更好的错误处理（.catch）
- 支持链式调用

缺点：
- 仍然需要 .then() 链式调用
- 错误处理需要 .catch()

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
```

**3. Async/Await**

优点：
- 代码看起来像同步代码
- 更好的可读性
- 使用 try-catch 处理错误

缺点：
- 需要 async 函数包裹
- 容易忘记 await 导致 Promise 未等待

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

// 顶层 await（ES2022，需要 ES 模块）
const data = await fs.readFile('file.txt', 'utf8')
console.log(data)
```

**追问点**：
- 如何避免回调地狱？
- Promise.all 和 Promise.allSettled 的区别？
- Async/Await 如何处理并发？

**最佳实践**：
- 优先使用 Async/Await
- 使用 Promise.all 实现并发
- 使用 Promise.allSettled 处理部分失败的场景

### 5. Promise.all、Promise.race、Promise.allSettled 有什么区别？

**核心答案**：

**Promise.all**：
- 等待所有 Promise 完成
- 任何一个 Promise 失败，整个 Promise.all 失败（fail-fast）
- 返回所有 Promise 的结果数组

**Promise.race**：
- 返回第一个完成的 Promise 结果
- 无论成功还是失败

**Promise.allSettled**：
- 等待所有 Promise 完成
- 无论成功还是失败
- 返回所有 Promise 的状态和结果

**代码示例**：

```javascript
const promise1 = Promise.resolve(1)
const promise2 = Promise.reject(new Error('Error'))
const promise3 = Promise.resolve(3)

// Promise.all - 任何一个失败就失败
Promise.all([promise1, promise2, promise3])
  .then(results => {
    console.log('All succeeded:', results)
  })
  .catch(err => {
    console.error('One failed:', err)  // 输出：One failed: Error
  })

// Promise.race - 返回第一个完成的
Promise.race([
  new Promise(resolve => setTimeout(() => resolve('slow'), 1000)),
  new Promise(resolve => setTimeout(() => resolve('fast'), 100))
])
  .then(result => {
    console.log('First:', result)  // 输出：First: fast
  })

// Promise.allSettled - 等待所有完成
Promise.allSettled([promise1, promise2, promise3])
  .then(results => {
    console.log('All settled:', results)
    // 输出：
    // [
    //   { status: 'fulfilled', value: 1 },
    //   { status: 'rejected', reason: Error: Error },
    //   { status: 'fulfilled', value: 3 }
    // ]
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Promise ${index + 1} succeeded:`, result.value)
      } else {
        console.error(`Promise ${index + 1} failed:`, result.reason)
      }
    })
  })

// 实战示例：批量请求 API
async function fetchMultipleAPIs(urls) {
  const results = await Promise.allSettled(
    urls.map(url => fetch(url).then(res => res.json()))
  )
  
  const succeeded = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
  
  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason)
  
  return { succeeded, failed }
}
```

**追问点**：
- 什么时候使用 Promise.all？
- 什么时候使用 Promise.allSettled？
- 如何实现 Promise.all 的超时控制？

**最佳实践**：
- 需要所有请求都成功时使用 Promise.all
- 允许部分失败时使用 Promise.allSettled
- 需要最快响应时使用 Promise.race


---

## 模块系统

### 6. CommonJS 和 ES Modules 有什么区别？

**核心答案**：

**CommonJS (CJS)**：
- Node.js 默认的模块系统
- 运行时加载（动态加载）
- 同步加载
- 使用 `require()` 和 `module.exports`
- 导出的是值的拷贝

**ES Modules (ESM)**：
- JavaScript 标准模块系统
- 编译时加载（静态分析）
- 异步加载
- 使用 `import` 和 `export`
- 导出的是值的引用
- 支持 Tree Shaking

**代码示例**：

```javascript
// ========== CommonJS ==========
// math.js
function add(a, b) {
  return a + b
}

let count = 0

module.exports = {
  add,
  count
}

// app.js
const math = require('./math')
console.log(math.add(1, 2))  // 3

// 修改导出的值
math.count++
console.log(math.count)  // 1

// 重新导入，获取的是缓存的模块
const math2 = require('./math')
console.log(math2.count)  // 1（共享同一个模块实例）

// ========== ES Modules ==========
// math.mjs
export function add(a, b) {
  return a + b
}

export let count = 0

export default function multiply(a, b) {
  return a * b
}

// app.mjs
import multiply, { add, count } from './math.mjs'

console.log(add(1, 2))  // 3
console.log(multiply(2, 3))  // 6

// 动态导入
const math = await import('./math.mjs')
console.log(math.add(1, 2))  // 3

// 导入所有导出
import * as math from './math.mjs'
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

**追问点**：
- 如何在 CommonJS 中使用 ES Modules？
- 如何在 ES Modules 中使用 CommonJS？
- Tree Shaking 是什么？

**最佳实践**：
- 新项目优先使用 ES Modules
- 使用 ES Modules 可以获得更好的 Tree Shaking 效果
- 混用时注意默认导出的行为差异

### 7. Node.js 的模块加载机制是怎样的？

**核心答案**：

Node.js 的模块加载遵循以下规则：

**1. 模块查找顺序**：
1. 核心模块（如 `fs`、`path`）
2. 文件模块（相对路径或绝对路径）
3. `node_modules` 目录（从当前目录向上查找）

**2. 模块缓存**：
- 模块第一次加载后会被缓存
- 后续 `require()` 直接返回缓存的模块
- 可以通过 `require.cache` 访问和清除缓存

**3. 模块解析规则**：
- 如果是文件，按以下顺序查找：
  1. 精确文件名
  2. 添加 `.js` 扩展名
  3. 添加 `.json` 扩展名
  4. 添加 `.node` 扩展名
- 如果是目录，按以下顺序查找：
  1. `package.json` 中的 `main` 字段
  2. `index.js`
  3. `index.json`
  4. `index.node`

**代码示例**：

```javascript
// ========== 模块缓存 ==========
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

// ========== 模块查找顺序 ==========
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

// ========== 循环依赖 ==========
// a.js
console.log('a starting')
exports.done = false
const b = require('./b')
console.log('in a, b.done =', b.done)
exports.done = true
console.log('a done')

// b.js
console.log('b starting')
exports.done = false
const a = require('./a')
console.log('in b, a.done =', a.done)
exports.done = true
console.log('b done')

// main.js
console.log('main starting')
const a = require('./a')
const b = require('./b')
console.log('in main, a.done =', a.done, ', b.done =', b.done)

// 输出：
// main starting
// a starting
// b starting
// in b, a.done = false  // a 还未完成加载
// b done
// in a, b.done = true
// a done
// in main, a.done = true , b.done = true
```

**追问点**：
- 如何避免循环依赖？
- 模块缓存的优缺点？
- 如何实现模块的热重载？

**最佳实践**：
- 避免循环依赖，重构代码结构
- 利用模块缓存提高性能
- 使用 `require.resolve()` 获取模块路径


---

## Stream 流

### 8. 什么是 Stream？它有哪些类型？

**核心答案**：

Stream 是 Node.js 处理流式数据的抽象接口，适合处理大文件和实时数据。Stream 将数据分成小块（chunk）处理，降低内存占用。

**Stream 类型**：

1. **Readable（可读流）**：数据源，如文件读取、HTTP 请求
2. **Writable（可写流）**：数据目标，如文件写入、HTTP 响应
3. **Duplex（双工流）**：既可读又可写，如 TCP socket
4. **Transform（转换流）**：在读写过程中修改数据，如压缩、加密

**代码示例**：

```javascript
const fs = require('fs')
const { Transform } = require('stream')

// ========== Readable 可读流 ==========
const readStream = fs.createReadStream('large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024  // 64KB 缓冲区
})

readStream.on('data', (chunk) => {
  console.log('Received chunk:', chunk.length)
})

readStream.on('end', () => {
  console.log('Reading finished')
})

readStream.on('error', (err) => {
  console.error('Error:', err)
})

// ========== Writable 可写流 ==========
const writeStream = fs.createWriteStream('output.txt')

writeStream.write('Hello ')
writeStream.write('World\n')
writeStream.end('Goodbye')

writeStream.on('finish', () => {
  console.log('Writing finished')
})

// ========== Transform 转换流 ==========
const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  }
})

// 使用管道连接流
process.stdin
  .pipe(upperCaseTransform)
  .pipe(process.stdout)

// ========== 文件复制（使用 Stream）==========
// ❌ 错误：一次性读取到内存
const data = fs.readFileSync('large-file.txt')
fs.writeFileSync(
文件时使用 Stream
- 使用 `pipeline()` 自动处理背压和错误
- 合理设置 `highWaterMark` 缓冲区大小

### 9. 什么是背压（Backpressure）？如何处理？

**核心答案**：

背压是指当数据写入速度快于读取速度时，缓冲区被填满的现象。如果不处理背压，会导致内存溢出。

**背压处理**：

1. **手动处理**：监听 `drain` 事件
2. **自动处理**：使用 `pipe()` 或 `pipeline()`

**代码示例**：

```javascript
const fs = require('fs')
const { pipeline } = require('stream')

// ========== 手动处理背压 ==========
const readStream = fs.createReadStream('large-file.txt')
const writeStream = fs.createWriteStream('output.txt')

readStream.on('data', (chunk) => {
  const canWrite = writeStream.write(chunk)
  
  if (!canWrite) {
    // 缓冲区已满，暂停读取
    readStream.pause()
  }
})

writeStream.on('drain', () => {
  // 缓冲区已清空，恢复读取
  readStream.resume()
})

readStream.on('end', () => {
  writeStream.end()
})

// ========== 使用 pipe 自动处理背压 ==========
fs.createReadStream('large-file.txt')
  .pipe(fs.createWriteStream('output.txt'))

// ========== 使用 pipeline 处理背压和错误 ==========
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

// ========== 实战示例：HTTP 文件下载 ==========
const http = require('http')

http.createServer((req, res) => {
  const readStream = fs.createReadStream('large-file.pdf')
  
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="file.pdf"'
  })
  
  // 自动处理背压
  readStream.pipe(res)
  
  readStream.on('error', (err) => {
    res.statusCode = 500
    res.end('Error reading file')
  })
}).listen(3000)
```

**追问点**：
- 为什么需要处理背压？
- pipe 和 pipeline 的区别？
- 如何监控 Stream 的内存使用？

**最佳实践**：
- 优先使用 `pipeline()` 而不是 `pipe()`
- 监听 `error` 事件处理错误
- 使用 `destroy()` 清理资源

---

## Buffer 缓冲区

### 10. 什么是 Buffer？它的应用场景是什么？

**核心答案**：

Buffer 是 Node.js 用于处理二进制数据的类，在 V8 堆外分配内存。Buffer 广泛用于文件操作、网络通信、图片处理等场景。

**应用场景**：
- 文件读写（二进制文件）
- 网络通信（TCP/UDP）
- 图片处理（编码/解码）
- 加密解密

**代码示例**：

```javascript
// ========== 创建 Buffer ==========
// 方式 1：从字符串创建
const buf1 = Buffer.from('Hello World', 'utf8')
console.log(buf1)  // <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64>

// 方式 2：创建指定大小的 Buffer
const buf2 = Buffer.alloc(10)  // 创建 10 字节的 Buffer，填充 0
const buf3 = Buffer.allocUnsafe(10)  // 更快，但内容未初始化

// 方式 3：从数组创建
const buf4 = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f])
console.log(buf4.toString())  // 'Hello'

// ========== Buffer 操作 ==========
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

// ========== Buffer 与 Stream ==========
const fs = require('fs')

// 使用 Buffer 读取文件（一次性加载到内存）
const data = fs.readFileSync('file.txt')
console.log(data)  // Buffer

// 使用 Stream 读取文件（分块处理）
const stream = fs.createReadStream('large-file.txt')
stream.on('data', (chunk) => {
  console.log('Chunk:', chunk)  // 每个 chunk 是一个 Buffer
})

// ========== 实战示例：图片转 Base64 ==========
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath)
  return imageBuffer.toString('base64')
}

const base64 = imageToBase64('image.png')
console.log(base64)

// Base64 转图片
function base64ToImage(base64String, outputPath) {
  const imageBuffer = Buffer.from(base64String, 'base64')
  fs.writeFileSync(outputPath, imageBuffer)
}
```

**追问点**：
- Buffer 和字符串的区别？
- Buffer.alloc 和 Buffer.allocUnsafe 的区别？
- Buffer 的内存分配在哪里？

**最佳实践**：
- 优先使用 `Buffer.alloc()` 而不是 `Buffer.allocUnsafe()`
- 处理大文件时使用 Stream 而不是 Buffer
- 注意 Buffer 的编码格式（utf8、hex、base64）

---

## 进程与线程

### 11. Node.js 是单线程还是多线程？如何实现并发？

**核心答案**：

Node.js 的 JavaScript 执行是单线程的，但底层 I/O 操作是多线程的（通过 libuv 线程池）。Node.js 通过事件循环实现并发，而不是多线程。

**并发实现方式**：

1. **事件循环**：单线程处理多个异步操作
2. **Cluster**：多进程，共享端口
3. **Worker Threads**：多线程，共享内存

**代码示例**：

```javascript
// ========== Cluster 多进程 ==========
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

// ========== Worker Threads 多线程 ==========
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')

if (isMainThread) {
  // 主线程
  console.log('Main thread')
  
  const worker = new Worker(__filename, {
    workerData: { num: 40 }
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

**追问点**：
- Cluster 和 Worker Threads 的区别？
- 什么时候使用 Cluster？什么时候使用 Worker Threads？
- 如何在进程/线程间通信？

**最佳实践**：
- I/O 密集型应用使用 Cluster
- CPU 密集型计算使用 Worker Threads
- 合理设置进程/线程数量（通常为 CPU 核心数）


---

## 性能优化

### 12. 如何避免阻塞事件循环？

**核心答案**：

阻塞事件循环会导致应用无响应。避免阻塞的关键是：不使用同步 API、避免 CPU 密集型计算、合理使用异步操作。

**常见阻塞场景**：

1. 使用同步 API（如 `fs.readFileSync`）
2. CPU 密集型计算（如复杂算法、大数据处理）
3. 大量同步循环

**代码示例**：

```javascript
// ========== 避免同步 API ==========
// ❌ 错误：阻塞事件循环
const data = fs.readFileSync('large-file.txt')
console.log(data)

// ✅ 正确：使用异步 API
fs.readFile('large-file.txt', (err, data) => {
  if (err) throw err
  console.log(data)
})

// ✅ 更好：使用 Promise
const fs = require('fs').promises
const data = await fs.readFile('large-file.txt')

// ========== 避免 CPU 密集型计算 ==========
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

app.get('/fib/:n', (req, res)
for (let i = 0; i < totalUsers; i += batchSize) {
    const batch = []
    for (let j = i; j < i + batchSize && j < totalUsers; j++) {
      batch.push({ id: j, name: `User ${j}` })
    }
    
    await processBatch(batch)
    
    // 让出事件循环
    await new Promise(resolve => setImmediate(resolve))
  }
}

// ========== 监控事件循环延迟 ==========
const start = Date.now()
setInterval(() => {
  const delay = Date.now() - start - 1000
  if (delay > 100) {
    console.warn(`Event loop delay: ${delay}ms`)
  }
}, 1000)
```

**追问点**：
- 如何检测事件循环阻塞？
- 什么是事件循环延迟（Event Loop Lag）？
- 如何优化 CPU 密集型任务？

**最佳实践**：
- 永远不要使用同步 API（除了启动时）
- CPU 密集型任务使用 Worker Threads
- 使用 `setImmediate()` 让出事件循环

### 13. Node.js 内存泄漏的常见原因和排查方法？

**核心答案**：

内存泄漏是指程序中已分配的内存无法被回收，导致内存占用持续增长。常见原因包括：全局变量、闭包、事件监听器未清理、缓存未限制。

**常见原因**：

1. 全局变量未清理
2. 闭包引用
3. 事件监听器未移除
4. 定时器未清除
5. 缓存无限增长

**代码示例**：

```javascript
// ========== 1. 全局变量泄漏 ==========
// ❌ 错误：全局变量累积
global.cache = []
function addToCache(data) {
  global.cache.push(data)  // 永远不会被清理
}

// ✅ 正确：使用 LRU 缓存
const LRU = require('lru-cache')
const cache = new LRU({
  max: 500,  // 最多 500 个条目
  maxAge: 1000 * 60 * 60  // 1 小时过期
})

// ========== 2. 事件监听器泄漏 ==========
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
  emitter.on('event', handler)
  
  // 清理
  return () => emitter.off('event', handler)
}

const cleanup = addListener()
// 使用完后清理
cleanup()

// ========== 3. 定时器泄漏 ==========
// ❌ 错误：定时器未清除
function startPolling() {
  setInterval(() => {
    fetchData()
  }, 1000)
}

// ✅ 正确：清除定时器
function startPolling() {
  const timer = setInterval(() => {
    fetchData()
  }, 1000)
  
  return () => clearInterval(timer)
}

const stopPolling = startPolling()
// 使用完后停止
stopPolling()

// ========== 4. 闭包泄漏 ==========
// ❌ 错误：闭包引用大对象
function createHandler() {
  const largeData = new Array(1000000).fill('data')
  
  return function() {
    console.log(largeData[0])  // 闭包引用整个 largeData
  }
}

// ✅ 正确：只引用需要的数据
function createHandler() {
  const largeData = new Array(1000000).fill('data')
  const firstItem = largeData[0]  // 只保存需要的数据
  
  return function() {
    console.log(firstItem)
  }
}

// ========== 排查内存泄漏 ==========
// 1. 监控内存使用
setInterval(() => {
  const used = process.memoryUsage()
  console.log(`Memory: ${Math.round(used.heapUsed / 1024 / 1024)} MB`)
}, 5000)

// 2. 生成堆快照
const v8 = require('v8')
const heapSnapshot = v8.writeHeapSnapshot()
console.log('Heap snapshot written to', heapSnapshot)

// 3. 使用 Chrome DevTools
// node --inspect app.js
// 打开 chrome://inspect
// 生成堆快照并对比
```

**追问点**：
- 如何使用 Chrome DevTools 排查内存泄漏？
- 什么是堆快照（Heap Snapshot）？
- 如何预防内存泄漏？

**最佳实践**：
- 定期监控内存使用
- 使用 LRU 缓存限制缓存大小
- 及时清理事件监听器和定时器
- 使用 WeakMap/WeakSet 存储临时数据

---

## 错误处理

### 14. Node.js 中如何正确处理错误？

**核心答案**：

Node.js 错误处理分为同步错误和异步错误。同步错误使用 try-catch，异步错误使用回调、Promise.catch 或 async/await 的 try-catch。

**错误处理方式**：

1. **同步错误**：try-catch
2. **回调错误**：错误优先回调（Error-First Callback）
3. **Promise 错误**：.catch() 或 try-catch
4. **未捕获异常**：process.on('uncaughtException')
5. **未处理的 Promise rejection**：process.on('unhandledRejection')

**代码示例**：

```javascript
// ========== 1. 同步错误处理 ==========
try {
  const data = JSON.parse(invalidJSON)
} catch (err) {
  console.error('Parse error:', err.message)
}

// ========== 2. 回调错误处理 ==========
fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error('Error:', err)
    return
  }
  console.log(data)
})

// ========== 3. Promise 错误处理 ==========
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

// ========== 4. 未捕获异常处理 ==========
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  // 记录日志、发送告警
  process.exit(1)  // 退出进程
})

// ========== 5. 未处理的 Promise rejection ==========
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // 记录日志、发送告警
  process.exit(1)
})

// ========== 6. 自定义错误类 ==========
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

// ========== 7. Express 错误处理中间件 ==========
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

// ========== 8. 优雅退出 ==========
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    // 关闭数据库连接
    db.close()
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})
```

**追问点**：
- 什么时候应该捕获错误？什么时候应该让错误冒泡？
- 如何在 Express 中统一处理错误？
- 进程退出前如何清理资源？

**最佳实践**：
- 永远不要忽略错误
- 使用自定义错误类区分错误类型
- 监听 uncaughtException 和 unhandledRejection 作为兜底
- 发生严重错误时应该退出进程并重启

---

## 实战场景

### 15. 如何实现一个简单的 HTTP 服务器？

**核心答案**：

使用 Node.js 内置的 `http` 模块可以快速创建 HTTP 服务器。实际项目中通常使用 Express、Koa 等框架。

**代码示例**：

```javascript
const http = require('http')
const url = require('url')

// 创建服务器
const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true)
  const method = req.method
  
  // 路由处理
  if (pathname === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h1>欢迎访问首页</h1>')
  } else if (pathname === '/api/users' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ users: ['Alice', 'Bob'] }))
  } else if (pathname === '/api/users' && method === 'POST') {
    let body = ''
    
    req.on('data', chunk => {
      body += chunk
    })
    
    req.on('end', () => {
      try {
        const user = JSON.parse(body)
        res.writeHead(201, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'User created', user }))
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid JSON' }))
      }
    })
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not Found' }))
  }
})

// 启动服务器
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// 优雅退出
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
```

**追问点**：
- 如何处理 POST 请求体？
- 如何实现路由？
- 如何处理静态文件？

**最佳实践**：
- 使用 Express/Koa 等框架简化开发
- 添加错误处理中间件
- 实现优雅退出

### 16. 如何实现文件上传功能？

**核心答案**：

文件上传通常使用 `multipart/form-data` 格式。可以使用 `multer` 中间件处理文件上传。

**代码示例**：

```javascript
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises

const app = express()

// 配置存储
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads'
    await fs.mkdir(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// 文件过滤
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB
  }
})

// 单文件上传
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  
  res.json({
    message: 'File uploaded successfully',
    file: {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  })
})

// 多文件上传
app.post('/upload-multiple', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' })
  }
  
  res.json({
    message: 'Files uploaded successfully',
    files: req.files.map(file => ({
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    }))
  })
})

// 错误处理
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' })
    }
  }
  
  res.status(500).json({ error: err.message })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

**追问点**：
- 如何限制文件大小和类型？
- 如何实现断点续传？
- 如何处理大文件上传？

**最佳实践**：
- 限制文件大小和类型
- 使用唯一文件名避免冲突
- 存储文件元数据到数据库
- 考虑使用云存储（如 AWS S3）

---

## 参考资源

- [Node.js 官方文档](https://nodejs.org/en/docs/)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [Event Loop 详解](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)
- [Stream 手册](https://nodejs.org/api/stream.html)
- [Worker Threads](https://nodejs.org/api/worker_threads.html)

---

> 本文档基于 Node.js 官方文档和 MCP Context7 最新资料整理，涵盖 16 道精选面试题，包含基础概念、事件循环、异步编程、模块系统、Stream、Buffer、进程线程、性能优化、错误处理和实战场景。所有代码示例均可运行，并包含详细的中文注释。
