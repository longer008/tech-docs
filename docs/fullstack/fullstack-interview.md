# 全栈开发面试题集

> 全栈开发核心技能、架构设计与高频面试题
> 
> 更新时间：2025-02

## 目录

[[toc]]

## A. 面试宝典

### 基础题

#### 1. 什么是全栈开发？

**核心答案：**

全栈开发是指掌握前端、后端、数据库等多个技术栈，能够独立完成完整项目开发的能力。

**核心技能：**

1. **前端技能**
   - HTML/CSS/JavaScript
   - React/Vue/Angular
   - 响应式设计
   - 前端工程化

2. **后端技能**
   - 服务端语言（Java/Node.js/Python）
   - 框架（Spring Boot/Express/Django）
   - RESTful API 设计
   - 数据库设计

3. **数据库技能**
   - 关系型数据库（MySQL/PostgreSQL）
   - 非关系型数据库（MongoDB/Redis）
   - SQL 优化
   - 数据建模

4. **运维技能**
   - Linux 基础
   - Docker 容器化
   - CI/CD
   - 云服务（AWS/阿里云）

---

#### 2. 前后端分离架构

**核心答案：**

前后端分离是将前端和后端代码分开开发、部署的架构模式。

**架构图：**

```
┌─────────────────────────────────────────────────────────────┐
│                    前后端分离架构                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  前端（React/Vue）                                          │
│     │                                                       │
│     ▼                                                       │
│  HTTP/HTTPS 请求                                            │
│     │                                                       │
│     ▼                                                       │
│  Nginx（反向代理）                                          │
│     │                                                       │
│     ├─▶ 静态资源（HTML/CSS/JS）                            │
│     │                                                       │
│     └─▶ API 请求                                            │
│         │                                                   │
│         ▼                                                   │
│  后端（Spring Boot/Express）                                │
│     │                                                       │
│     ├─▶ 业务逻辑                                            │
│     │                                                       │
│     └─▶ 数据库（MySQL/MongoDB）                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**优点：**
- 前后端独立开发、部署
- 技术栈解耦
- 提升开发效率
- 便于团队协作

**缺点：**
- 增加部署复杂度
- 跨域问题
- 首屏加载慢（SSR 可解决）

---

#### 3. RESTful API 设计

**核心答案：**

RESTful API 是一种基于 HTTP 协议的 API 设计风格。

**设计原则：**

1. **资源导向**
   - URL 表示资源
   - 使用名词而非动词
   - 使用复数形式

2. **HTTP 方法**
   - GET：查询
   - POST：创建
   - PUT：更新（全量）
   - PATCH：更新（部分）
   - DELETE：删除

3. **状态码**
   - 200：成功
   - 201：创建成功
   - 400：请求错误
   - 401：未授权
   - 403：禁止访问
   - 404：资源不存在
   - 500：服务器错误

**示例：**

```
# 用户资源
GET    /api/users          # 获取用户列表
GET    /api/users/:id      # 获取单个用户
POST   /api/users          # 创建用户
PUT    /api/users/:id      # 更新用户（全量）
PATCH  /api/users/:id      # 更新用户（部分）
DELETE /api/users/:id      # 删除用户

# 嵌套资源
GET    /api/users/:id/orders      # 获取用户的订单列表
POST   /api/users/:id/orders      # 为用户创建订单

# 查询参数
GET    /api/users?page=1&size=10&sort=createdAt:desc
GET    /api/users?name=John&status=active
```

**响应格式：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "John",
    "email": "john@example.com"
  }
}

// 列表响应
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "size": 10
  }
}

// 错误响应
{
  "code": 400,
  "message": "Invalid request",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

#### 4. 认证与授权

**核心答案：**

认证（Authentication）验证用户身份，授权（Authorization）验证用户权限。

**常用方案：**

1. **Session + Cookie**
   ```
   用户登录 → 服务器创建 Session → 返回 SessionID（Cookie）
   → 后续请求携带 Cookie → 服务器验证 Session
   ```

2. **JWT（JSON Web Token）**
   ```
   用户登录 → 服务器生成 JWT → 返回 Token
   → 后续请求携带 Token（Header） → 服务器验证 Token
   ```

3. **OAuth 2.0**
   ```
   第三方登录（微信、GitHub）
   授权码模式、隐式模式、密码模式、客户端模式
   ```

**JWT 示例：**

```javascript
// 后端生成 JWT
const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 验证 JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// 中间件
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
```

**前端使用：**

```javascript
// 请求拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

#### 5. 跨域问题解决

**核心答案：**

跨域是浏览器的同源策略限制，协议、域名、端口任一不同即为跨域。

**解决方案：**

1. **CORS（推荐）**
   ```javascript
   // Express
   const cors = require('cors');
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   
   // Spring Boot
   @Configuration
   public class CorsConfig {
       @Bean
       public CorsFilter corsFilter() {
           CorsConfiguration config = new CorsConfiguration();
           config.addAllowedOrigin("http://localhost:3000");
           config.addAllowedMethod("*");
           config.addAllowedHeader("*");
           config.setAllowCredentials(true);
           
           UrlBasedCorsConfigurationSource source = 
               new UrlBasedCorsConfigurationSource();
           source.registerCorsConfiguration("/**", config);
           
           return new CorsFilter(source);
       }
   }
   ```

2. **Nginx 反向代理**
   ```nginx
   server {
       listen 80;
       server_name example.com;
       
       location / {
           root /var/www/html;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **开发环境代理**
   ```javascript
   // Vite
   export default {
     server: {
       proxy: {
         '/api': {
           target: 'http://localhost:8080',
           changeOrigin: true,
           rewrite: (path) => path.replace(/^\/api/, '')
         }
       }
     }
   }
   
   // Webpack
   module.exports = {
     devServer: {
       proxy: {
         '/api': {
           target: 'http://localhost:8080',
           changeOrigin: true,
           pathRewrite: { '^/api': '' }
         }
       }
     }
   }
   ```

---

### 进阶题

#### 6. 微服务架构

**核心答案：**

微服务是将单体应用拆分成多个小型服务的架构模式。

**架构图：**

```
┌─────────────────────────────────────────────────────────────┐
│                    微服务架构                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  前端（React/Vue）                                          │
│     │                                                       │
│     ▼                                                       │
│  API 网关（Gateway）                                        │
│     │                                                       │
│     ├─▶ 用户服务（User Service）                           │
│     │   └─▶ MySQL                                           │
│     │                                                       │
│     ├─▶ 订单服务（Order Service）                          │
│     │   └─▶ MySQL                                           │
│     │                                                       │
│     ├─▶ 商品服务（Product Service）                        │
│     │   └─▶ MongoDB                                         │
│     │                                                       │
│     └─▶ 支付服务（Payment Service）                        │
│         └─▶ MySQL                                           │
│                                                              │
│  服务注册与发现（Eureka/Consul）                            │
│  配置中心（Config Server）                                  │
│  消息队列（RabbitMQ/Kafka）                                 │
│  分布式追踪（Zipkin/Skywalking）                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**优点：**
- 服务独立部署
- 技术栈灵活
- 易于扩展
- 故障隔离

**缺点：**
- 系统复杂度增加
- 分布式事务
- 服务间通信开销
- 运维成本高

---

#### 7. 性能优化

**前端优化：**

```
✅ 资源优化
  - 代码分割（Code Splitting）
  - 懒加载（Lazy Loading）
  - 图片优化（WebP、压缩）
  - CDN 加速

✅ 渲染优化
  - 虚拟滚动
  - 防抖节流
  - 避免重排重绘
  - 使用 Web Workers

✅ 网络优化
  - HTTP/2
  - 资源预加载
  - 缓存策略
  - 减少请求数量
```

**后端优化：**

```
✅ 数据库优化
  - 索引优化
  - 查询优化
  - 连接池配置
  - 读写分离

✅ 缓存优化
  - Redis 缓存
  - 本地缓存
  - CDN 缓存
  - 浏览器缓存

✅ 代码优化
  - 异步处理
  - 批量操作
  - 避免 N+1 查询
  - 使用消息队列
```

---

## B. 避坑指南

### 常见误区

| 误区 | 正确理解 |
|------|----------|
| 全栈 = 前端 + 后端 | 还需要数据库、运维等技能 |
| RESTful 只是 URL 规范 | 还包括 HTTP 方法、状态码等 |
| JWT 绝对安全 | 需要 HTTPS + 合理过期时间 |
| 微服务适合所有项目 | 小项目不适合微服务 |
| 跨域只能用 CORS | 还可以用代理、JSONP 等 |

### 最佳实践

```
✅ 前后端分离
✅ RESTful API 设计
✅ 统一错误处理
✅ 日志记录
✅ 接口文档（Swagger）
✅ 单元测试
✅ CI/CD 自动化
✅ 监控告警
```

---

## C. 面试技巧

### 1. 回答框架

```
1. 概念定义
   - 全栈开发是什么
   - 核心技能
   - 技术栈选择

2. 技术细节
   - 前后端分离
   - RESTful API
   - 认证授权
   - 跨域处理

3. 实战经验
   - 项目架构
   - 技术选型
   - 问题解决
   - 性能优化

4. 对比分析
   - 不同技术栈对比
   - 架构模式对比
   - 认证方案对比
```

### 2. 加分项

```
✅ 掌握多个技术栈
✅ 有完整项目经验
✅ 了解微服务架构
✅ 掌握性能优化
✅ 熟悉 DevOps
✅ 有开源贡献
✅ 持续学习能力

❌ 只会基础 CRUD
❌ 没有项目经验
❌ 不了解架构设计
❌ 不会性能优化
```

### 3. 高频问题

```
1. 什么是全栈开发？
2. 前后端分离架构？
3. RESTful API 设计原则？
4. JWT 认证流程？
5. 如何解决跨域问题？
6. 微服务架构优缺点？
7. 如何进行性能优化？
8. 如何保证接口安全？
9. 如何设计数据库？
10. 项目部署流程？
```

---

## D. 参考资料

### 学习资源

- [freeCodeCamp](https://www.freecodecamp.org/)
- [The Odin Project](https://www.theodinproject.com/)
- [Full Stack Open](https://fullstackopen.com/)

### 技术栈

- [MERN Stack](https://www.mongodb.com/mern-stack)
- [MEAN Stack](https://www.meanstack.com/)
- [Spring Boot + Vue](https://spring.io/)

### 实战项目

- 博客系统
- 电商平台
- 社交网络
- 任务管理系统

### 学习路线

```
初级（2-3个月）：
- 前端基础（HTML/CSS/JS）
- 后端基础（Node.js/Java）
- 数据库基础（MySQL）
- 简单项目实战

中级（3-6个月）：
- 前端框架（React/Vue）
- 后端框架（Express/Spring Boot）
- RESTful API 设计
- 认证授权
- 中等项目实战

高级（6-12个月）：
- 微服务架构
- 性能优化
- DevOps
- 系统设计
- 大型项目实战
```
