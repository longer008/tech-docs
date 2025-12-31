# Express 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:Express 的中间件执行模型？
- 标准答案:请求按注册顺序进入中间件链，函数签名为 `(req,res,next)`；通过 `next()` 进入下一个，若传入错误对象则走错误处理中间件；可挂载路径或路由级中间件。
- 追问点:如何终止链路；`app.use` 与 `app.get` 的差异；异步中间件的异常冒泡。
- 参考:https://expressjs.com/en/guide/using-middleware.html

### Q2:错误处理中间件如何编写？
- 标准答案:签名 `(err,req,res,next)`；需在其他中间件之后注册；可统一格式化响应与日志，避免重复 `try/catch`；注意不要遗忘 `next(err)` 导致吞异常。
- 追问点:区分 4xx/5xx 的方式；生产环境隐藏栈信息；与 `domain`/`process.on('unhandledRejection')` 配合。
- 参考:https://expressjs.com/en/guide/error-handling.html

### Q3:Router 的用途？
- 标准答案:`express.Router()` 提供子应用路由容器，支持前缀挂载、局部中间件、拆分模块；可用于版本化或业务域分层。
- 追问点:如何复用参数校验中间件；合并路由文件的最佳实践；动态前缀的处理。
- 参考:https://expressjs.com/en/guide/routing.html

### Q4:处理异步错误的正确方式？
- 标准答案:返回 Promise 的中间件需要 `catch` 后调用 `next(err)`；可封装 `asyncHandler(fn)` 包装器；避免未处理拒绝导致进程退出。
- 追问点:Express 5 内置 Promise 支持现状；与 `await` 的关系；日志链路追踪。
- 参考:https://expressjs.com/en/guide/error-handling.html

### Q5:静态资源与缓存优化？
- 标准答案:使用 `express.static` 提供文件，结合 `maxAge`、ETag、Gzip/Brotli；区分不可缓存与版本化资源；注意路径穿越风险。
- 追问点:CDN 与反向代理配置；图片压缩策略；大文件分片/Range 请求。
- 参考:https://expressjs.com/en/starter/static-files.html

### Q6:Session 与鉴权选择？
- 标准答案:状态保持可用 cookie-session/express-session+store(redis)；无状态可用 JWT/OAuth2；根据业务是否需要服务端会话失效来选。
- 追问点:Session 固定攻击防护；同源/跨域场景的 cookie 属性；刷新令牌/滑动过期。
- 参考:https://expressjs.com/en/resources/middleware/session.html

### Q7:安全加固手段？
- 标准答案:Helmet 统一设置安全头；限制请求体大小防 DoS；开启 CORS 白名单；参数校验防注入；使用 `csrf` 中间件在需要时防跨站。
- 追问点:上传文件白名单；速率限制 middleware；依赖漏洞扫描。
- 参考:https://expressjs.com/en/advanced/best-practice-security.html

### Q8:日志与可观测性？
- 标准答案:使用 morgan/pino 记录访问日志，添加 request-id 便于链路追踪；错误日志落盘或送至 APM；健康检查与指标导出供监控。
- 追问点:日志切分与异步写；敏感信息脱敏；压测与告警阈值。
- 参考:https://expressjs.com/en/advanced/best-practice-performance.html

## 场景/排查
### Q1:路由匹配顺序导致 404，如何定位？
- 标准答案:检查注册顺序与具体路径/通配符；利用 `app._router.stack` 或调试日志查看命中情况；在 catch-all 之前放置具体路由；必要时添加前缀。
- 追问点:区分 `app.use('/api',router)` 与 `router.get('/api')`；大小写敏感/严格模式。
- 参考:https://expressjs.com/en/guide/routing.html

### Q2:请求高峰导致事件循环卡顿怎么办？
- 标准答案:确保 CPU 密集逻辑移出主线程（worker_threads/child_process/队列）；开启 gzip 等中间件时注意同步操作；使用 pm2/cluster 多进程并配合无状态设计。
- 追问点:如何识别阻塞代码（clinic doctor/0x）；反压与限流策略；Node 版本对性能的影响。
- 参考:https://nodejs.org/en/docs/guides/getting-started-guide

## 反问
### Q1:生产环境部署方式？单机多进程还是容器/无服务器？
- 标准答案:帮助了解运维架构与发布流程，确认对无状态的要求。
- 追问点:灰度/回滚机制；日志与监控统一方案。
- 参考:团队内部规范

### Q2:接口规范与中间件栈是否已有约定？
- 标准答案:确认团队是否统一错误码、鉴权、限流等，减少重复造轮子。
- 追问点:API 文档工具（OpenAPI/Swagger）；Mock/契约测试策略。
- 参考:团队内部规范
