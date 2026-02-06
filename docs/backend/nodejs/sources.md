# Node.js 学习资源

> 更新时间：2025-02

## 官方资源

### 官方文档
- [Node.js 官方文档](https://nodejs.org/en/docs/) - 最权威的 Node.js 文档
- [Node.js API 文档](https://nodejs.org/api/) - 完整的 API 参考
- [Node.js 指南](https://nodejs.org/en/learn/) - 官方学习指南
- [Node.js 最佳实践](https://nodejs.org/en/learn/getting-started/security-best-practices) - 安全最佳实践

### 官方博客
- [Node.js 博客](https://nodejs.org/en/blog/) - 官方新闻和更新
- [Node.js 发布说明](https://nodejs.org/en/blog/release/) - 版本发布信息

---

## 学习教程

### 入门教程
- [Node.js 入门教程](https://nodejs.dev/learn) - 官方入门指南
- [Node.js 教程 - MDN](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs) - MDN 的 Node.js 教程
- [Node.js 中文网](https://nodejs.cn/) - 中文文档和教程

### 进阶教程
- [Node.js 设计模式](https://github.com/PacktPublishing/Node.js-Design-Patterns-Third-Edition) - 设计模式书籍
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices) - 社区最佳实践
- [Node.js 性能优化](https://nodejs.org/en/learn/getting-started/profiling) - 性能分析和优化

### 视频课程
- [Node.js 完整教程 - YouTube](https://www.youtube.com/results?search_query=nodejs+tutorial) - 免费视频教程
- [Node.js 
/) - TypeScript ORM

### 测试工具
- [Jest](https://jestjs.io/) - JavaScript 测试框架
- [Mocha](https://mochajs.org/) - 测试框架
- [Chai](https://www.chaijs.com/) - 断言库
- [Supertest](https://github.com/visionmedia/supertest) - HTTP 测试库

### 开发工具
- [Nodemon](https://nodemon.io/) - 自动重启工具
- [PM2](https://pm2.keymetrics.io/) - 进程管理器
- [ESLint](https://eslint.org/) - 代码检查工具
- [Prettier](https://prettier.io/) - 代码格式化工具

---

## 实战项目

### 开源项目
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices) - 最佳实践集合
- [Awesome Node.js](https://github.com/sindresorhus/awesome-nodejs) - Node.js 资源列表
- [Node.js 示例项目](https://github.com/nodejs/examples) - 官方示例项目

### 项目模板
- [Node.js Boilerplate](https://github.com/hagopj13/node-express-boilerplate) - Express 项目模板
- [NestJS Starter](https://github.com/nestjs/nest-cli) - NestJS 项目模板
- [TypeScript Node Starter](https://github.com/microsoft/TypeScript-Node-Starter) - TypeScript 项目模板

---

## 社区资源

### 问答社区
- [Stack Overflow - Node.js](https://stackoverflow.com/questions/tagged/node.js) - 技术问答
- [Reddit - Node.js](https://www.reddit.com/r/node/) - Node.js 社区
- [Node.js 中文社区](https://cnodejs.org/) - 中文技术社区

### 技术博客
- [Node.js 官方博客](https://nodejs.org/en/blog/) - 官方博客
- [RisingStack Blog](https://blog.risingstack.com/) - Node.js 技术博客
- [Node Weekly](https://nodeweekly.com/) - Node.js 周刊

### 社交媒体
- [Node.js Twitter](https://twitter.com/nodejs) - 官方 Twitter
- [Node.js GitHub](https://github.com/nodejs/node) - 官方 GitHub

---

## 书籍推荐

### 入门书籍
- 《Node.js 实战》（Node.js in Action）
- 《深入浅出 Node.js》（朴灵）
- 《Node.js 开发指南》

### 进阶书籍
- 《Node.js 设计模式》（Node.js Design Patterns）
- 《Node.js 高级编程》（Professional Node.js）
- 《Node.js 微服务》（Node.js Microservices）

---

## MCP 查询记录

### 查询历史
- **查询时间**：2025-02-04
- **查询内容**：Node.js 面试常见问题、事件循环、异步编程、模块系统、Stream、Buffer、进程线程、性能优化、错误处理
- **Library ID**：`/websites/nodejs_api`
- **代码示例数量**：8840+

### 关键发现
1. **事件循环机制**：
   - 6 个阶段：timers、pending callbacks、idle/prepare、poll、check、close callbacks
   - process.nextTick 在当前阶段结束后立即执行
   - setImmediate 在 check 阶段执行
   - 微任务队列在每个阶段结束后执行

2. **模块系统**：
   - CommonJS：运行时加载，同步，使用 require/module.exports
   - ES Modules：编译时加载，异步，使用 import/export
   - 模块缓存机制：require.cache

3. **Stream 流**：
   - 4 种类型：Readable、Writable、Duplex、Transform
   - 背压（Backpressure）处理
   - pipeline() 自动处理错误和背压

4. **性能优化**：
   - 避免阻塞事件循环
   - 使用 Worker Threads 处理 CPU 密集型任务
   - 使用 Cluster 实现负载均衡
   - 内存泄漏排查和预防

5. **错误处理**：
   - 同步错误：try-catch
   - 异步错误：回调、Promise.catch、async/await
   - 未捕获异常：uncaughtException、unhandledRejection
   - 自定义错误类

---

## 学习路线

### 初级（1-2 个月）
1. Node.js 基础（安装、REPL、模块系统）
2. 核心模块（fs、path、http、events）
3. NPM 包管理
4. 异步编程（回调、Promise、Async/Await）
5. Express 框架基础

### 中级（3-4 个月）
1. 事件循环深入理解
2. Stream 和 Buffer
3. 进程和线程（Cluster、Worker Threads）
4. 数据库操作（MongoDB、MySQL）
5. RESTful API 设计
6. 中间件开发
7. 错误处理和日志

### 高级（5-6 个月）
1. 性能优化和监控
2. 内存管理和泄漏排查
3. 微服务架构
4. GraphQL
5. WebSocket 实时通信
6. 安全最佳实践
7. 测试（单元测试、集成测试）
8. CI/CD 部署

---

## 常见问题

### Q1: Node.js 适合什么场景？
- I/O 密集型应用（API 服务、实时通信）
- 微服务架构
- 工具链开发（构建工具、CLI 工具）
- 服务端渲染（SSR）

### Q2: Node.js 不适合什么场景？
- CPU 密集型计算（可使用 Worker Threads 解决）
- 需要强类型的大型项目（建议使用 TypeScript）

### Q3: 如何选择 Node.js 版本？
- 生产环境：使用 LTS 版本（偶数版本）
- 开发环境：可以使用最新版本体验新特性
- 当前 LTS：Node.js 20.x、22.x

### Q4: 如何学习 Node.js？
1. 学习 JavaScript 基础
2. 阅读官方文档
3. 跟随教程实践
4. 阅读优秀开源项目源码
5. 参与社区讨论
6. 构建实际项目

---

> 本文档整理了 Node.js 学习的各类资源，包括官方文档、教程、框架、工具、项目、社区和书籍推荐。建议根据自己的学习阶段选择合适的资源，循序渐进地学习。
