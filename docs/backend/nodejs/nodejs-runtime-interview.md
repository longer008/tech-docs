# Node.js 运行时面试题集

> Node.js 核心机制与高频面试题

## A. 面试宝典

### 基础题

#### 1. Node.js 事件循环 (Event Loop)

```
   ┌───────────────────────────┐
┌─>│           timers          │  ← setTimeout/setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← 内部使用
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  ← I/O 事件，等待新回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  ← setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  ← socket.on('close')
   └───────────────────────────┘
```

```javascript
// 执行顺序示例
console.log('1. script start');

setTimeout(() => console.log('2. setTimeout'), 0);

setImmediate(() => console.log('3. setImmediate'));

process.nextTick(() => console.log('4. nextTick'));

Promise.resolve().then(() => console.log('5. promise'));

console.log('6. script end');

// 输出顺序：
// 1. script start
// 6. script end
// 4. nextTick     (微任务队列优先)
// 5. promise      (微任务队列)
// 2. setTimeout   (timers 阶段)
// 3. setImmediate (check 阶段)
```

**微任务队列优先级：**
```
process.nextTick > Promise.then > queueMicrotask
```

---

#### 2. 模块系统

```javascript
// CommonJS (Node.js 默认)
// module.js
const privateVar = 'private';
const publicFunc = () => 'public';

module.exports = { publicFunc };
// 或
exports.publicFunc = publicFunc;

// 使用
const { publicFunc } = require('./module');

// ES Modules (.mjs 或 package.json 设置 "type": "module")
// module.mjs
export const func1 = () => {};
export default class MyClass {}

// 使用
import MyClass, { func1 } from './module.mjs';

// CommonJS 和 ESM 互操作
// ESM 导入 CommonJS
import cjsModule from './cjs-module.cjs';

// CommonJS 导入 ESM (需要动态导入)
const esmModule = await import('./esm-module.mjs');
```

| 特性 | CommonJS | ES Modules |
|------|----------|------------|
| 加载时机 | 运行时 | 编译时 |
| 导出 | module.exports | export |
| 导入 | require() | import |
| 缓存 | 是 | 是 |
| 顶层 await | 否 | 是 |
| Tree Shaking | 否 | 是 |

---

#### 3. Buffer 与 Stream

```javascript
// Buffer - 二进制数据处理
const buf1 = Buffer.alloc(10);           // 分配 10 字节，填充 0
const buf2 = Buffer.from('Hello');       // 从字符串创建
const buf3 = Buffer.from([1, 2, 3]);     // 从数组创建

buf2.toString('utf8');                   // 'Hello'
buf2.length;                             // 5
buf2[0];                                 // 72 (H 的 ASCII)

Buffer.concat([buf1, buf2]);             // 合并
buf2.slice(0, 2);                        // 切片

// Stream - 流式数据处理
const fs = require('fs');
const { pipeline } = require('stream/promises');
const zlib = require('zlib');

// 可读流
const readable = fs.createReadStream('input.txt');
readable.on('data', (chunk) => console.log(chunk));
readable.on('end', () => console.log('done'));
readable.on('error', (err) => console.error(err));

// 可写流
const writable = fs.createWriteStream('output.txt');
writable.write('Hello');
writable.end('World');

// 管道 (推荐使用 pipeline)
await pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.txt.gz')
);

// Transform 流
const { Transform } = require('stream');
const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});
```

| 流类型 | 说明 | 示例 |
|--------|------|------|
| Readable | 可读流 | fs.createReadStream |
| Writable | 可写流 | fs.createWriteStream |
| Duplex | 双工流 | net.Socket |
| Transform | 转换流 | zlib.createGzip |

---

#### 4. 异步编程模式

```javascript
// 1. 回调函数 (Callback)
fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});

// 2. Promise
const readFilePromise = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

// 使用 util.promisify
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

// 3. async/await
async function readFiles() {
  try {
    const data1 = await fs.promises.readFile('file1.txt');
    const data2 = await fs.promises.readFile('file2.txt');
    return [data1, data2];
  } catch (err) {
    console.error(err);
  }
}

// 并行执行
const [file1, file2] = await Promise.all([
  fs.promises.readFile('file1.txt'),
  fs.promises.readFile('file2.txt')
]);

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
```

---

#### 5. 进程与线程

```javascript
// child_process - 子进程
const { spawn, exec, fork } = require('child_process');

// spawn - 流式输出
const ls = spawn('ls', ['-la']);
ls.stdout.on('data', (data) => console.log(data.toString()));
ls.on('close', (code) => console.log(`exit code: ${code}`));

// exec - 缓冲输出
exec('ls -la', (err, stdout, stderr) => {
  console.log(stdout);
});

// fork - 创建 Node.js 子进程，支持 IPC
// parent.js
const child = fork('./child.js');
child.send({ type: 'greeting', data: 'Hello' });
child.on('message', (msg) => console.log('From child:', msg));

// child.js
process.on('message', (msg) => {
  console.log('From parent:', msg);
  process.send({ type: 'reply', data: 'Hi' });
});

// worker_threads - 工作线程
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // 主线程
  const worker = new Worker(__filename, {
    workerData: { num: 42 }
  });
  worker.on('message', (result) => console.log(result));
  worker.on('error', (err) => console.error(err));
} else {
  // 工作线程
  const { num } = workerData;
  parentPort.postMessage(num * 2);
}

// cluster - 集群
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();  // 自动重启
  });
} else {
  // 工作进程
  require('./server');
}
```

---

### 进阶题

#### 6. 内存管理与垃圾回收

```javascript
// V8 内存结构
// 新生代 (New Space) - 短期对象，Scavenge 算法
// 老生代 (Old Space) - 长期对象，Mark-Sweep-Compact

// 内存查看
const used = process.memoryUsage();
console.log({
  rss: `${Math.round(used.rss / 1024 / 1024)} MB`,      // 常驻内存
  heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
  heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
  external: `${Math.round(used.external / 1024 / 1024)} MB`
});

// 手动触发 GC (需要 --expose-gc 启动参数)
global.gc();

// 内存泄漏常见原因
// 1. 全局变量
// 2. 闭包引用
// 3. 事件监听未移除
// 4. 定时器未清除
// 5. 缓存无限增长

// 示例：正确清理
class EventManager {
  constructor() {
    this.listeners = new Map();
  }

  addListener(event, callback) {
    this.listeners.set(event, callback);
    process.on(event, callback);
  }

  removeListener(event) {
    const callback = this.listeners.get(event);
    if (callback) {
      process.off(event, callback);
      this.listeners.delete(event);
    }
  }

  cleanup() {
    for (const [event, callback] of this.listeners) {
      process.off(event, callback);
    }
    this.listeners.clear();
  }
}
```

---

#### 7. 性能优化

```javascript
// 1. 使用 cluster 利用多核 CPU
const cluster = require('cluster');
const os = require('os');

// 2. 使用 Stream 处理大文件
const processLargeFile = async (inputPath, outputPath) => {
  const { pipeline } = require('stream/promises');
  await pipeline(
    fs.createReadStream(inputPath),
    new Transform({
      transform(chunk, encoding, callback) {
        // 处理数据
        callback(null, chunk);
      }
    }),
    fs.createWriteStream(outputPath)
  );
};

// 3. 使用缓存
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

const getCachedData = async (key, fetchFn) => {
  const cached = cache.get(key);
  if (cached) return cached;

  const data = await fetchFn();
  cache.set(key, data);
  return data;
};

// 4. 使用连接池
const { Pool } = require('pg');
const pool = new Pool({
  max: 20,              // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// 5. 避免同步操作
// Bad
const data = fs.readFileSync('large.txt');

// Good
const data = await fs.promises.readFile('large.txt');
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "Node.js 是单线程的" | 主线程单线程，但有线程池处理 I/O |
| "require 每次都读文件" | require 有缓存机制 |
| "setTimeout(fn, 0) 立即执行" | 至少等待 1ms，且在下一个 timers 阶段 |
| "process.nextTick 属于 Event Loop" | nextTick 是微任务，在每个阶段之间执行 |
| "Buffer 是 JavaScript 对象" | Buffer 是 V8 堆外内存 |

---

## B. 实战文档

### 常用内置模块

```javascript
// path - 路径处理
const path = require('path');
path.join('/foo', 'bar', 'baz');     // '/foo/bar/baz'
path.resolve('foo', 'bar');          // '/current/dir/foo/bar'
path.dirname('/foo/bar/baz.txt');    // '/foo/bar'
path.basename('/foo/bar/baz.txt');   // 'baz.txt'
path.extname('/foo/bar/baz.txt');    // '.txt'
path.parse('/foo/bar/baz.txt');      // { root, dir, base, ext, name }

// fs - 文件系统
const fs = require('fs').promises;
await fs.readFile('file.txt', 'utf8');
await fs.writeFile('file.txt', 'content');
await fs.appendFile('file.txt', 'more');
await fs.mkdir('dir', { recursive: true });
await fs.rm('dir', { recursive: true });
await fs.readdir('dir');
await fs.stat('file.txt');
await fs.access('file.txt', fs.constants.F_OK);

// os - 操作系统
const os = require('os');
os.platform();      // 'darwin', 'linux', 'win32'
os.cpus();          // CPU 信息
os.totalmem();      // 总内存
os.freemem();       // 空闲内存
os.homedir();       // 用户目录
os.tmpdir();        // 临时目录

// crypto - 加密
const crypto = require('crypto');
// MD5
crypto.createHash('md5').update('text').digest('hex');
// SHA256
crypto.createHash('sha256').update('text').digest('hex');
// AES 加密
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
let encrypted = cipher.update('text', 'utf8', 'hex');
encrypted += cipher.final('hex');
// UUID
crypto.randomUUID();

// http - HTTP 服务
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World');
});
server.listen(3000);
```

### 环境变量与配置

```javascript
// dotenv
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production'
};

// 启动参数
const args = process.argv.slice(2);
// node app.js --port=3000 --env=dev
// args = ['--port=3000', '--env=dev']

// 进程信息
process.pid;          // 进程 ID
process.cwd();        // 当前工作目录
process.version;      // Node.js 版本
process.versions;     // 依赖版本
process.uptime();     // 运行时间（秒）
```
