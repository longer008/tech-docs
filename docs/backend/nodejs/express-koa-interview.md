# Express/Koa 面试题集

> Node.js Web 框架核心知识点与高频面试题

## A. 面试宝典

### Express 基础

#### 1. Express 核心概念

```javascript
const express = require('express');
const app = express();

// 中间件
app.use(express.json());                    // 解析 JSON
app.use(express.urlencoded({ extended: true })); // 解析表单
app.use(express.static('public'));          // 静态文件

// 路由
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  res.status(201).json(user);
});

// 路由参数
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id });
});

// 查询参数
app.get('/api/search', (req, res) => {
  const { q, page = 1 } = req.query;
  res.json({ query: q, page });
});

// 启动服务
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

#### 2. 中间件机制

```javascript
// 中间件执行顺序
app.use((req, res, next) => {
  console.log('1. 第一个中间件');
  next();
});

app.use((req, res, next) => {
  console.log('2. 第二个中间件');
  next();
});

app.get('/api/test', (req, res) => {
  console.log('3. 路由处理');
  res.send('Hello');
});

// 请求 /api/test 输出：
// 1. 第一个中间件
// 2. 第二个中间件
// 3. 路由处理

// 错误处理中间件（4 个参数）
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 自定义中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// 应用中间件
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// 日志中间件
const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
};
```

---

#### 3. Router 模块化

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

router.post('/', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

router.put('/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
});

router.delete('/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;

// app.js
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);
```

---

### Koa 基础

#### 4. Koa 核心概念

```javascript
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

// 中间件
app.use(bodyParser());

// 路由
router.get('/api/users', async (ctx) => {
  ctx.body = { users: [] };
});

router.post('/api/users', async (ctx) => {
  const user = ctx.request.body;
  ctx.status = 201;
  ctx.body = user;
});

router.get('/api/users/:id', async (ctx) => {
  const { id } = ctx.params;
  ctx.body = { id };
});

// 注册路由
app.use(router.routes());
app.use(router.allowedMethods());

// 启动
app.listen(3000);
```

---

#### 5. Koa 洋葱模型

```javascript
// Koa 中间件执行顺序（洋葱模型）
app.use(async (ctx, next) => {
  console.log('1. 进入第一层');
  await next();
  console.log('6. 退出第一层');
});

app.use(async (ctx, next) => {
  console.log('2. 进入第二层');
  await next();
  console.log('5. 退出第二层');
});

app.use(async (ctx, next) => {
  console.log('3. 进入第三层');
  ctx.body = 'Hello';
  console.log('4. 退出第三层');
});

// 输出顺序：
// 1. 进入第一层
// 2. 进入第二层
// 3. 进入第三层
// 4. 退出第三层
// 5. 退出第二层
// 6. 退出第一层

// 错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message
    };
    ctx.app.emit('error', err, ctx);
  }
});

// 全局错误监听
app.on('error', (err, ctx) => {
  console.error('Server error:', err);
});
```

---

### Express vs Koa 对比

#### 6. 框架对比

| 特性 | Express | Koa |
|------|---------|-----|
| 中间件模型 | 线性（callback） | 洋葱（async/await） |
| 内置功能 | 多（路由、静态文件） | 少（需要插件） |
| 错误处理 | 回调形式 | try/catch |
| Context | req/res 分离 | ctx 统一 |
| 体积 | 较大 | 轻量 |
| 学习曲线 | 低 | 中 |

```javascript
// Express 错误处理
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);  // 传递给错误中间件
  }
});

// Koa 错误处理
router.get('/api/users', async (ctx) => {
  // 错误会被上层 try/catch 捕获
  const users = await User.find();
  ctx.body = users;
});
```

---

### 进阶题

#### 7. 常用中间件实现

```javascript
// CORS 中间件
const cors = (options = {}) => {
  const defaults = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    headers: 'Content-Type,Authorization'
  };
  const config = { ...defaults, ...options };

  return async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', config.origin);
    ctx.set('Access-Control-Allow-Methods', config.methods);
    ctx.set('Access-Control-Allow-Headers', config.headers);

    if (ctx.method === 'OPTIONS') {
      ctx.status = 204;
      return;
    }
    await next();
  };
};

// 请求限流中间件
const rateLimit = (options = {}) => {
  const { windowMs = 60000, max = 100 } = options;
  const requests = new Map();

  return async (ctx, next) => {
    const ip = ctx.ip;
    const now = Date.now();

    // 清理过期记录
    const record = requests.get(ip) || { count: 0, startTime: now };
    if (now - record.startTime > windowMs) {
      record.count = 0;
      record.startTime = now;
    }

    record.count++;
    requests.set(ip, record);

    if (record.count > max) {
      ctx.status = 429;
      ctx.body = { error: 'Too many requests' };
      return;
    }

    ctx.set('X-RateLimit-Limit', max);
    ctx.set('X-RateLimit-Remaining', max - record.count);

    await next();
  };
};

// JWT 验证中间件
const jwt = require('jsonwebtoken');

const authMiddleware = (secret) => {
  return async (ctx, next) => {
    const token = ctx.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      ctx.throw(401, 'No token provided');
    }

    try {
      const decoded = jwt.verify(token, secret);
      ctx.state.user = decoded;
      await next();
    } catch (err) {
      ctx.throw(403, 'Invalid token');
    }
  };
};

// 请求日志中间件
const logger = () => {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} ${ctx.status} - ${ms}ms`);
  };
};
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "Express 和 Koa 中间件一样" | Express 线性执行，Koa 洋葱模型 |
| "Koa 不支持 callback" | Koa 原生支持 async/await，但也可用 callback |
| "ctx.body 直接返回响应" | ctx.body 只是设置响应体，实际返回在中间件执行完后 |
| "Express 必须手动调用 next()" | 最后一个中间件可以不调用 |
| "app.use 只能用函数" | 也可以是 router.routes() 返回的函数 |

---

## B. 实战文档

### Express 项目结构

```
express-app/
├── src/
│   ├── config/
│   │   └── index.js
│   ├── controllers/
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── index.js
│   │   └── users.js
│   ├── services/
│   │   └── userService.js
│   ├── utils/
│   │   └── helpers.js
│   └── app.js
├── tests/
├── package.json
└── .env
```

### 完整应用示例

```javascript
// app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 安全中间件
app.use(helmet());
app.use(cors());

// 通用中间件
app.use(morgan('combined'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理
app.use(errorHandler);

module.exports = app;

// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
```

### Koa 项目结构

```javascript
// app.js (Koa)
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const helmet = require('koa-helmet');
const cors = require('@koa/cors');
const logger = require('koa-logger');

const app = new Koa();
const router = new Router();

// 中间件
app.use(helmet());
app.use(cors());
app.use(logger());
app.use(bodyParser());

// 错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };
    ctx.app.emit('error', err, ctx);
  }
});

// 路由
router.get('/api/users', async (ctx) => {
  ctx.body = { users: [] };
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
```
