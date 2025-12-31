# 技术栈学习路线图

> 全栈开发者成长路径指南

## 前端开发路线图

```
基础阶段 (0-6个月)
├── HTML5 语义化标签
├── CSS3 布局 (Flex/Grid)
├── JavaScript ES6+
│   ├── 变量与作用域
│   ├── 函数与闭包
│   ├── 原型与继承
│   ├── 异步编程 (Promise/async-await)
│   └── 模块化 (ES Module)
└── 开发工具
    ├── Git 版本控制
    ├── Chrome DevTools
    └── VS Code 配置

进阶阶段 (6-12个月)
├── TypeScript
│   ├── 类型系统
│   ├── 泛型
│   └── 工具类型
├── 框架选择 (二选一深入)
│   ├── Vue.js
│   │   ├── Vue 2 Options API
│   │   ├── Vue 3 Composition API
│   │   ├── Vue Router
│   │   ├── Pinia/Vuex
│   │   └── Nuxt.js (SSR)
│   └── React
│       ├── Hooks
│       ├── Context/Redux
│       ├── React Router
│       └── Next.js (SSR)
├── 工程化
│   ├── Webpack/Vite 配置
│   ├── Babel 转译
│   ├── ESLint/Prettier
│   └── 单元测试 (Jest/Vitest)
└── 网络与浏览器
    ├── HTTP/HTTPS
    ├── 浏览器渲染原理
    └── 性能优化

高级阶段 (12-24个月)
├── 跨端开发
│   ├── 微信小程序
│   ├── Uniapp
│   └── React Native/Flutter
├── 架构设计
│   ├── 微前端
│   ├── 组件库开发
│   └── 脚手架开发
├── 性能专项
│   ├── 首屏优化
│   ├── 运行时优化
│   └── 监控与埋点
└── 源码阅读
    ├── Vue/React 响应式原理
    ├── 虚拟 DOM 与 Diff
    └── 状态管理实现
```

## 后端开发路线图 (Java)

```
基础阶段 (0-6个月)
├── Java SE
│   ├── 面向对象
│   ├── 集合框架
│   ├── IO/NIO
│   ├── 多线程基础
│   └── JVM 基础
├── 数据库
│   ├── MySQL 基础
│   ├── SQL 语法
│   └── JDBC
└── 开发工具
    ├── Maven/Gradle
    ├── IDEA
    └── Git

进阶阶段 (6-12个月)
├── Spring 生态
│   ├── Spring Framework
│   │   ├── IoC/DI
│   │   ├── AOP
│   │   └── 事务管理
│   ├── Spring Boot
│   │   ├── 自动配置
│   │   ├── Starter 机制
│   │   └── Actuator 监控
│   └── Spring MVC
│       ├── RESTful API
│       └── 拦截器/过滤器
├── ORM 框架
│   ├── MyBatis
│   └── JPA/Hibernate
├── 数据库进阶
│   ├── 索引优化
│   ├── 事务隔离
│   └── 分库分表
└── 缓存
    ├── Redis 基础
    └── 缓存策略

高级阶段 (12-24个月)
├── 微服务
│   ├── Spring Cloud
│   │   ├── 服务注册 (Nacos/Eureka)
│   │   ├── 服务调用 (Feign)
│   │   ├── 网关 (Gateway)
│   │   └── 配置中心
│   └── 服务治理
│       ├── 限流熔断 (Sentinel)
│       ├── 链路追踪
│       └── 分布式事务
├── 消息队列
│   ├── RabbitMQ
│   └── Kafka
├── JVM 调优
│   ├── GC 原理
│   ├── 性能监控
│   └── 调优实战
└── 架构设计
    ├── DDD 领域驱动
    ├── 高并发设计
    └── 高可用设计
```

## 后端开发路线图 (Node.js)

```
基础阶段 (0-6个月)
├── Node.js 运行时
│   ├── 模块系统
│   ├── 事件循环
│   ├── 流 (Stream)
│   └── 文件系统
├── npm/pnpm 包管理
└── Express 框架
    ├── 路由
    ├── 中间件
    └── 错误处理

进阶阶段 (6-12个月)
├── Koa/NestJS 框架
├── 数据库
│   ├── MySQL + Sequelize/TypeORM
│   ├── MongoDB + Mongoose
│   └── Redis
├── 认证授权
│   ├── JWT
│   └── OAuth 2.0
└── API 设计
    ├── RESTful
    └── GraphQL

高级阶段 (12-24个月)
├── 微服务
│   ├── gRPC
│   └── 消息队列
├── 性能优化
│   ├── 集群模式
│   ├── PM2 部署
│   └── 性能监控
└── 全栈实践
    ├── SSR (Nuxt/Next)
    └── BFF 架构
```

## 数据库学习路线

```
MySQL 路线
├── 基础
│   ├── SQL 语法
│   ├── 数据类型
│   └── 表设计
├── 进阶
│   ├── 索引原理 (B+树)
│   ├── 事务 (ACID)
│   ├── 锁机制
│   └── MVCC
└── 高级
    ├── SQL 优化
    ├── 执行计划分析
    ├── 主从复制
    └── 分库分表

Redis 路线
├── 基础
│   ├── 五大数据类型
│   ├── 常用命令
│   └── 持久化
├── 进阶
│   ├── 主从复制
│   ├── 哨兵模式
│   └── Cluster 集群
└── 高级
    ├── 缓存策略
    ├── 分布式锁
    └── 消息队列
```

## DevOps 学习路线

```
基础阶段
├── Linux 基础
│   ├── 常用命令
│   ├── Shell 脚本
│   └── 权限管理
├── Git 工作流
│   ├── 分支策略
│   ├── Commit 规范
│   └── Code Review
└── Docker
    ├── 镜像与容器
    ├── Dockerfile
    └── Docker Compose

进阶阶段
├── Kubernetes
│   ├── Pod/Deployment
│   ├── Service/Ingress
│   └── ConfigMap/Secret
├── CI/CD
│   ├── Jenkins
│   ├── GitHub Actions
│   └── GitLab CI
└── 监控告警
    ├── Prometheus
    ├── Grafana
    └── ELK Stack
```

## 学习资源推荐

### 官方文档
| 技术 | 文档地址 |
|------|---------|
| Vue.js | https://vuejs.org/ |
| React | https://react.dev/ |
| Spring Boot | https://spring.io/projects/spring-boot |
| Node.js | https://nodejs.org/docs/ |
| MySQL | https://dev.mysql.com/doc/ |
| Redis | https://redis.io/docs/ |

### 在线学习平台
- 掘金、思否、CSDN（中文技术社区）
- MDN Web Docs（前端权威文档）
- Baeldung（Java/Spring 教程）
- 极客时间、慕课网（付费课程）

### 实战项目建议
1. **前端**：搭建个人博客/后台管理系统
2. **后端**：实现电商/社交应用 API
3. **全栈**：完整的 SaaS 应用

---

> 学习建议：先广后深，选择一个技术栈深入，再横向扩展
