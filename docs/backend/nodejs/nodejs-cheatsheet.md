# Node.js 速查手册

> Node.js 开发常用代码片段与 API 速查

## 内置模块

### fs - 文件系统

```javascript
const fs = require('fs');
const fsp = require('fs').promises;

// 异步读取（推荐）
const data = await fsp.readFile('file.txt', 'utf8');

// 异步写入
await fsp.writeFile('file.txt', 'content');

// 追加内容
await fsp.appendFile('file.txt', '\nnew line');

// 创建目录
await fsp.mkdir('dir', { recursive: true });

// 删除目录
await fsp.rm('dir', { recursive: true, force: true });

// 读取目录
const files = await fsp.readdir('dir');
const filesWithTypes = await fsp.readdir('dir', { withFileTypes: true });

// 文件信息
const stats = await fsp.stat('file.txt');
stats.isFile();
stats.isDirectory();
stats.size;
stats.mtime;

// 文件是否存在
try {
  await fsp.access('file.txt', fs.constants.F_OK);
} catch {
  // 文件不存在
}

// 复制文件
await fsp.copyFile('src.txt', 'dest.txt');

// 移动/重命名
await fsp.rename('old.txt', 'new.txt');

// 监听文件变化
fs.watch('file.txt', (eventType, filename) => {
  console.log(eventType, filename);
});
```

### path - 路径处理

```javascript
const path = require('path');

path.join('/foo', 'bar', 'baz.txt');      // '/foo/bar/baz.txt'
path.resolve('foo', 'bar');               // '/current/dir/foo/bar'
path.dirname('/foo/bar/baz.txt');         // '/foo/bar'
path.basename('/foo/bar/baz.txt');        // 'baz.txt'
path.basename('/foo/bar/baz.txt', '.txt'); // 'baz'
path.extname('/foo/bar/baz.txt');         // '.txt'
path.isAbsolute('/foo/bar');              // true
path.relative('/data/a', '/data/b');      // '../b'
path.normalize('/foo/bar//baz/./');       // '/foo/bar/baz/'

path.parse('/foo/bar/baz.txt');
// { root: '/', dir: '/foo/bar', base: 'baz.txt', ext: '.txt', name: 'baz' }

path.format({ dir: '/foo/bar', base: 'baz.txt' });
// '/foo/bar/baz.txt'

// 跨平台
path.sep;      // '/' 或 '\\'
path.delimiter; // ':' 或 ';'

// 当前文件目录（ESM）
import.meta.dirname;  // Node.js 20.11+
import.meta.filename;

// 当前文件目录（CommonJS）
__dirname;
__filename;
```

### http/https - HTTP 服务

```javascript
const http = require('http');
const https = require('https');

// 创建服务器
const server = http.createServer((req, res) => {
  const { method, url, headers } = req;

  // 读取请求体
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello' }));
  });
});

server.listen(3000, () => console.log('Server running'));

// 发送请求
const options = {
  hostname: 'api.example.com',
  port: 443,
  path: '/users',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});

req.on('error', console.error);
req.end();

// 使用 fetch（Node.js 18+）
const response = await fetch('https://api.example.com/users');
const data = await response.json();
```

### crypto - 加密

```javascript
const crypto = require('crypto');

// 哈希
crypto.createHash('md5').update('text').digest('hex');
crypto.createHash('sha256').update('text').digest('hex');
crypto.createHash('sha512').update('text').digest('base64');

// HMAC
crypto.createHmac('sha256', 'secret').update('message').digest('hex');

// 随机字节
crypto.randomBytes(16).toString('hex');

// UUID
crypto.randomUUID();

// AES 加密/解密
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// 加密
const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update('text', 'utf8', 'hex');
encrypted += cipher.final('hex');

// 解密
const decipher = crypto.createDecipheriv(algorithm, key, iv);
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');

// 密码哈希（推荐 bcrypt，但这是原生实现）
const pbkdf2 = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
};
```

### os - 操作系统

```javascript
const os = require('os');

os.platform();       // 'darwin', 'linux', 'win32'
os.arch();          // 'x64', 'arm64'
os.type();          // 'Darwin', 'Linux', 'Windows_NT'
os.release();       // 系统版本
os.hostname();      // 主机名
os.homedir();       // 用户目录
os.tmpdir();        // 临时目录
os.cpus();          // CPU 信息
os.cpus().length;   // CPU 核心数
os.totalmem();      // 总内存（字节）
os.freemem();       // 空闲内存
os.uptime();        // 系统运行时间（秒）
os.networkInterfaces(); // 网络接口
os.userInfo();      // 当前用户信息
os.EOL;             // 换行符
```

### process - 进程

```javascript
// 环境变量
process.env.NODE_ENV;
process.env.PORT;

// 命令行参数
process.argv;        // [node路径, 脚本路径, ...参数]
process.argv.slice(2); // 用户参数

// 当前工作目录
process.cwd();
process.chdir('/new/dir');

// 进程信息
process.pid;         // 进程 ID
process.ppid;        // 父进程 ID
process.title;       // 进程标题
process.version;     // Node.js 版本
process.versions;    // 依赖版本

// 内存使用
const mem = process.memoryUsage();
console.log({
  rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
  heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
  heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`
});

// CPU 使用
const startUsage = process.cpuUsage();
// ... 执行代码 ...
const endUsage = process.cpuUsage(startUsage);

// 运行时间
process.uptime();    // 进程运行秒数

// 退出
process.exit(0);     // 正常退出
process.exit(1);     // 错误退出

// 事件
process.on('exit', (code) => console.log('Exit:', code));
process.on('uncaughtException', (err) => console.error(err));
process.on('unhandledRejection', (reason) => console.error(reason));
process.on('SIGINT', () => process.exit(0));  // Ctrl+C
process.on('SIGTERM', () => process.exit(0)); // kill

// 下一个事件循环
process.nextTick(() => console.log('nextTick'));
setImmediate(() => console.log('setImmediate'));
```

---

## 常用工具函数

### 日志

```javascript
// 简单日志
const log = {
  info: (...args) => console.log(new Date().toISOString(), '[INFO]', ...args),
  warn: (...args) => console.warn(new Date().toISOString(), '[WARN]', ...args),
  error: (...args) => console.error(new Date().toISOString(), '[ERROR]', ...args),
  debug: (...args) => {
    if (process.env.DEBUG) {
      console.log(new Date().toISOString(), '[DEBUG]', ...args);
    }
  }
};

// 使用 pino（推荐）
const pino = require('pino');
const logger = pino({ level: 'info' });
logger.info({ userId: 1 }, 'User logged in');
```

### 重试机制

```javascript
const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
};

// 使用
const result = await retry(() => fetchData(), 3, 1000);
```

### 并发控制

```javascript
// 并发限制
const pLimit = (concurrency) => {
  let active = 0;
  const queue = [];

  const next = () => {
    if (active < concurrency && queue.length > 0) {
      active++;
      const { fn, resolve, reject } = queue.shift();
      fn().then(resolve).catch(reject).finally(() => {
        active--;
        next();
      });
    }
  };

  return (fn) => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    next();
  });
};

// 使用
const limit = pLimit(5);
const results = await Promise.all(
  urls.map(url => limit(() => fetch(url)))
);
```

### 防抖节流

```javascript
// 防抖
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// 节流
const throttle = (fn, interval) => {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn(...args);
    }
  };
};
```

---

## NPM 常用命令

```bash
# 初始化
npm init -y

# 安装依赖
npm install express           # 生产依赖
npm install -D jest           # 开发依赖
npm install -g nodemon        # 全局安装

# 运行脚本
npm start
npm test
npm run build

# 版本管理
npm version patch             # 1.0.0 -> 1.0.1
npm version minor             # 1.0.0 -> 1.1.0
npm version major             # 1.0.0 -> 2.0.0

# 发布
npm login
npm publish

# 清理
npm cache clean --force
rm -rf node_modules && npm install

# 查看
npm list                      # 依赖树
npm outdated                  # 过期依赖
npm audit                     # 安全审计
npm audit fix                 # 自动修复
```

---

## Express 常用代码

```javascript
const express = require('express');
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// 路由
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 启动
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 环境变量

```javascript
// .env 文件
// PORT=3000
// DATABASE_URL=mongodb://localhost/mydb
// JWT_SECRET=your-secret-key

// 加载
require('dotenv').config();

// 使用
const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production'
};

// 验证必需变量
const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}
```
