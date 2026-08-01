# React 参考资料来源

**更新时间**: 2026-08

## 📚 官方资源

### React 官方文档
- **React 官方文档**: https://react.dev/
  - 最新的 React 文档，包含完整的 API 参考和学习指南
  - React 19 新特性说明
  - 交互式示例和教程

- **React API 参考**: https://react.dev/reference/react
  - 完整的 Hooks API 文档
  - 组件 API 参考
  - React DOM API

- **React 博客**: https://react.dev/blog
  - React 19 发布说明: https://react.dev/blog/2024/12/05/react-19
  - React 18 发布说明: https://react.dev/blog/2022/03/29/react-v18
  - React Conf 2024 回顾: https://react.dev/blog/2024/05/22/react-conf-2024-recap

### React 规则和最佳实践
- **Rules of React**: https://react.dev/reference/rules
  - Hooks 规则: https://react.dev/reference/rules/rules-of-hooks
  - 组件和 Hooks 必须是纯函数
  - React 调用组件和 Hooks

- **ESLint 插件**: https://www.npmjs.com/package/eslint-plugin-react-hooks
  - 自动检测 Hooks 规则违规
  - exhaustive-deps 规则

## 🔍 MCP Context7 查询记录

### 查询 1: React 19 最新特性
- **查询内容**: "React 19 最新特性、Hooks 最佳实践、性能优化、并发渲染、Server Components"
- **查询时间**: 2026-05-25
- **主要发现**:
  - React 19 允许 ref 作为 prop，无需 forwardRef
  - Server Components 支持服务端渲染
  - Actions 简化表单处理
  - use Hook 读取 Promise 和 Context

### 查询 2: React Hooks 使用场景
- **查询内容**: "React 面试常见问题：useState useEffect useMemo useCallback 使用场景和注意事项"
- **查询时间**: 2026-05-25
- **主要发现**:
  - useMemo 缓存计算结果，避免重复计算
  - useCallback 缓存函数引用，配合 React.memo 使用
  - useEffect 依赖数组必须包含所有使用的外部变量
  - 函数式更新避免闭包陷阱

### 查询 3: React 常见错误和陷阱
- **查询内容**: "React Hooks 常见错误和陷阱：依赖数组、闭包问题、无限循环、key 的使用"
- **查询时间**: 2026-05-25
- **主要发现**:
  - Hooks 只能在函数顶层调用
  - 不能在条件、循环、嵌套函数中调用 Hooks
  - 依赖数组遗漏导致闭包陷阱
  - 使用数组索引作为 key 导致状态错位

### 查询 4: React 性能优化
- **查询内容**: "React 性能优化：React.memo、虚拟列表、代码分割、懒加载、避免不必要的重新渲染"
- **查询时间**: 2026-05-25
- **主要发现**:
  - React.memo 进行浅比较，避免不必要的重新渲染
  - lazy + Suspense 实现代码分割
  - 虚拟列表（react-window）优化大列表渲染
  - 拆分组件隔离状态变化

### 查询 5: React 高级特性
- **查询内容**: "React 高级特性：lazy loading、Suspense、Error Boundary、Portal、StrictMode、Profiler"
- **查询时间**: 2026-05-25
- **主要发现**:
  - Suspense 协调异步操作的加载状态
  - Portal 将子节点渲染到 DOM 树的不同位置
  - Error Boundary 捕获组件树中的错误
  - lazy() 实现组件懒加载

### 查询 6: React 面试原理题
- **查询内容**: "React 面试常见问题：虚拟DOM、Fiber架构、事件系统、生命周期、错误边界、Portal"
- **查询时间**: 2026-05-25
- **主要发现**:
  - Fiber 是 React 16 的新协调引擎
  - 支持可中断的渲染和优先级调度
  - 虚拟 DOM 通过 Diff 算法优化更新
  - 事件系统使用事件委托

## 📖 推荐学习资源

### 官方教程
- **Thinking in React**: https://react.dev/learn/thinking-in-react
  - React 思维方式
  - 组件设计原则

- **React 学习路线**: https://react.dev/learn
  - 从零开始学习 React
  - 交互式教程

### 深入理解 React
- **React 技术揭秘**: https://react.iamkasong.com/
  - 深入理解 React 原理
  - Fiber 架构详解
  - Hooks 实现原理

- **React 设计模式**: https://www.patterns.dev/posts/react-patterns
  - 常用设计模式
  - 最佳实践

### 性能优化
- **React 性能优化**: https://kentcdodds.com/blog/usememo-and-usecallback
  - Kent C. Dodds 的博客
  - useMemo 和 useCallback 使用指南

- **React DevTools Profiler**: https://react.dev/learn/react-developer-tools
  - 性能分析工具
  - 组件渲染追踪

## 🛠️ 相关工具和库

### 状态管理
- **Redux Toolkit**: https://redux-toolkit.js.org/
  - 官方推荐的 Redux 工具集
  - 简化 Redux 配置

- **Zustand**: https://github.com/pmndrs/zustand
  - 轻量级状态管理
  - 简单易用

- **Jotai**: https://jotai.org/
  - 原子化状态管理
  - 细粒度更新

- **React Query**: https://tanstack.com/query/latest
  - 服务端状态管理
  - 自动缓存和重试

### 路由
- **React Router**: https://reactrouter.com/
  - 官方路由库
  - v6 最新版本

### UI 组件库
- **Ant Design**: https://ant.design/
  - 企业级 UI 组件库
  - 中文文档

- **Material-UI**: https://mui.com/
  - Google Material Design
  - 丰富的组件

- **Chakra UI**: https://chakra-ui.com/
  - 可访问性优先
  - 主题定制

- **shadcn/ui**: https://ui.shadcn.com/
  - 基于 Radix UI
  - 可复制粘贴的组件

### 表单处理
- **React Hook Form**: https://react-hook-form.com/
  - 高性能表单库
  - 最小重新渲染

- **Formik**: https://formik.org/
  - 表单状态管理
  - 验证和错误处理

### 动画
- **Framer Motion**: https://www.framer.com/motion/
  - 声明式动画库
  - 手势支持

- **React Spring**: https://www.react-spring.dev/
  - 基于物理的动画
  - 流畅的过渡

### 测试
- **React Testing Library**: https://testing-library.com/react
  - 用户行为测试
  - 最佳实践

- **Jest**: https://jestjs.io/
  - JavaScript 测试框架
  - 快照测试

## 📝 面试资源

### 面试题库
- **React 面试题集**: https://github.com/sudheerj/reactjs-interview-questions
  - 500+ 面试题
  - 详细解答

- **前端面试手册**: https://www.frontendinterviewhandbook.com/
  - 前端面试指南
  - React 专题

### 实战项目
- **Real World React**: https://github.com/gothinkster/react-redux-realworld-example-app
  - 真实项目示例
  - 最佳实践

- **React 项目集合**: https://github.com/topics/react-projects
  - GitHub 项目集合
  - 学习参考

## 🎥 视频教程

### 官方视频
- **React Conf 2024**: https://www.youtube.com/watch?v=T8TZQ6k4SLE
  - React 19 发布会
  - 新特性介绍

### 推荐频道
- **Fireship**: https://www.youtube.com/@Fireship
  - 快速教程
  - 技术对比

- **Web Dev Simplified**: https://www.youtube.com/@WebDevSimplified
  - React 教程
  - 实战项目

## 📊 数据来源说明

本文档内容基于以下来源整理：

1. **官方文档**: React 官方文档（react.dev）
2. **MCP Context7**: 使用 Context7 MCP 服务获取最新的 React 官方文档内容
3. **社区资源**: GitHub、Stack Overflow、Reddit 等社区讨论
4. **实战经验**: 真实项目开发和面试经验总结

## 🆕 React 19.2 学习链接（2025-2026）

### 官方文档与发布说明
- **React 19 发布说明**: https://react.dev/blog/2024/12/05/react-19
  - React 19 正式发布，ref 作为 prop、Actions、use() 等特性
- **React 版本信息**: https://react.dev/versions
  - 最新稳定版本号与变更日志（19.2.x，最新补丁 19.2.6）

### 新特性文档
- **Activity**: https://react.dev/reference/react/Activity
  - 后台渲染组件，让异步 UI 在后台保持渲染与状态（离屏渲染）
- **useEffectEvent**: https://react.dev/reference/react/useEffectEvent
  - 稳定的 Effect 事件，effect 内部调用且不参与依赖数组
- **use**: https://react.dev/reference/react/use
  - 渲染期读取 Promise 与 Context，配合 Suspense 使用
- **cache**: https://react.dev/reference/react/cache
  - React Cache，基于请求作用域的缓存，配合 use() 使用
- **React Compiler**: https://react.dev/learn/react-compiler
  - 编译期自动 memo 化，减少手动 useMemo/useCallback
- **Actions 相关 Hooks**: https://react.dev/reference/react/useActionState
  - 表单与服务端动作，含 useActionState / useOptimistic / useFormStatus

### 社区资源
- **React 官方博客**: https://react.dev/blog
  - 最新版本发布与特性介绍
- **React Conf 2024 回顾**: https://react.dev/blog/2024/05/22/react-conf-2024-recap
  - React Compiler 开源等重大消息

## Next.js 16 学习链接（2025-2026）

### 官方文档与发布说明
- **Next.js 16 发布公告**: https://nextjs.org/blog/next-16
  - Turbopack 默认打包器、React Compiler 稳定支持、Cache Components、proxy.ts 等新特性说明
- **Next.js 15 升级到 16 指南**: https://nextjs.org/docs/app/guides/upgrading/version-16
  - 官方升级指南，覆盖 Turbopack 默认、middleware 更名 proxy、Node.js 20.9+ 等破坏性变更
- **Next.js 16 (beta) 发布公告**: https://nextjs.org/blog/next-16-beta
  - beta 版本特性预览（Turbopack 稳定、React Compiler 集成）
- **Next.js 版本信息**: https://github.com/vercel/next.js/releases
  - 各小版本发布说明与变更日志（16.2.x）

### 新特性文档
- **proxy 文档**: https://nextjs.org/docs/app/getting-started/proxy
  - proxy.ts 取代 middleware.ts 的用法与迁移说明
- **Cache Components 迁移指南**: https://nextjs.org/docs/app/guides/migrating-to-cache-components
  - 从 PPR / 旧缓存模型迁移到 use cache 指令

### 社区资源
- **Next.js 16 迁移指南（Code With Seb）**: https://www.codewithseb.com/blog/nextjs-16-migration-guide-breaking-changes
  - 覆盖所有破坏性变更的社区迁移指南
- **Next.js 16 迁移详解（DEV Community）**: https://dev.to/pockit_tools/nextjs-16-migration-guide-turbopack-proxy-cache-components-and-every-breaking-change-explained-35ci
  - Turbopack、proxy、Cache Components 逐项解读

## 🔄 更新记录

- **2026-08-01**: 
  - 补充 React 19.2 新特性学习链接（Activity、useEffectEvent、React Cache、React Compiler 等）
  - 补充 Next.js 16 学习链接（Turbopack 默认、Cache Components、proxy.ts）
  - 同步更新时间戳

- **2026-05-25**: 
  - 使用 MCP Context7 验证 React 19 最新特性
  - 补充 Hooks 最佳实践和常见陷阱
  - 添加性能优化和高级特性参考
  - 更新面试题库和学习资源

- **2025-01-04**: 
  - 初始化文档
  - 添加基础参考资料

---

**维护说明**: 本文档会定期更新，确保内容与 React 官方文档保持同步。如有疑问或建议，请参考官方文档或提交 Issue。

