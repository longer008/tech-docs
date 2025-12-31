# Koa 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:Koa 的“洋葱模型”是什么？
- 标准答案:中间件以 async/await 形式串联，先自外向内执行前置逻辑，再从内向外执行后置逻辑；`await next()` 将控制权交给下一个中间件。
- 追问点:与 Express 线性模型的差别；如何在 finally 里做收尾；异常冒泡路径。
- 参考:https://koajs.com/#application

### Q2:`ctx`/`request`/`response` 关系？
- 标准答案:`ctx` 封装 Node 原生 req/res，`ctx.request/ctx.response` 为 Koa 对象，常用快捷属性如 `ctx.body`、`ctx.status`；避免直接操作原生对象以免绕过中间件。
- 追问点:如何挂载自定义上下文属性；读取表单/JSON 的方式；获取真实 IP。
- 参考:https://koajs.com/#context

### Q3:错误处理的最佳实践？
- 标准答案:编写全局错误处理中间件包裹在最外层，使用 try/catch 捕获 `await next()` 的异常并统一输出；监听 `app.on('error')` 记录日志；注意不要吞掉 404。
- 追问点:异步未捕获的 Promise；与 pm2/进程监控结合；返回格式规范。
- 参考:https://koajs.com/#application

### Q4:Koa 与 Express 的差异？
- 标准答案:Koa 更轻量、无内置路由/中间件，默认基于 Promise/async；Context 封装更友好；需要自行选择路由/Body 解析等插件；Express 内置更多功能但耦合。
- 追问点:迁移成本；性能差异；生态选择。
- 参考:https://koajs.com/

### Q5:路由实现常用方案？
- 标准答案:常用 `koa-router` 或 `@koa/router` 提供 RESTful 路由、参数/前缀支持；也可用 `koa-compose` 手写；需注意版本与 Koa3 兼容。
- 追问点:路由拆分与模块化；中间件顺序；动态路由性能。
- 参考:https://github.com/koajs/router

### Q6:请求体解析与文件上传？
- 标准答案:JSON 表单可用 `koa-bodyparser`；多部分上传用 `koa-multer`/`koa-body`；需限制体积、文件类型并将临时文件存储到安全位置。
- 追问点:大文件分片；流式处理；安全校验。
- 参考:https://github.com/koajs/bodyparser

### Q7:Session 与鉴权？
- 标准答案:有状态可用 `koa-session` 搭配 Redis 存储；无状态可用 JWT 中间件；跨域时注意 cookie SameSite、签名密钥与过期策略。
- 追问点:CSRF 防护；多端登录互踢；刷新令牌。
- 参考:https://github.com/koajs/session

### Q8:性能与安全基线？
- 标准答案:使用 gzip/brotli、缓存头；避免同步阻塞；启用 Helmet/CSRF/限流；为日志添加 request-id；线上用 pm2/cluster/K8s 管理多进程。
- 追问点:背压处理；调优 Node 线程池；常见中间件安全隐患。
- 参考:https://koajs.com/

## 场景/排查
### Q1:中间件顺序导致鉴权失效，如何排查？
- 标准答案:确认鉴权中间件放在路由之前；通过日志打印顺序；使用 `app.middleware` 查看注册列表；拆分路由模块时记得在子路由前添加公共中间件。
- 追问点:异常时返回格式；白名单路由处理；多实例共享 session。
- 参考:https://koajs.com/#application

### Q2:CPU 高占用如何定位？
- 标准答案:使用 `clinic doctor` 或 `0x` 抓取火焰图；检查同步阻塞代码/JSON 大对象；将计算移到 worker_threads；必要时限流或降级。
- 追问点:日志打点对性能的影响；GC 调优；反压实现。
- 参考:https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick

## 反问
### Q1:团队常用的中间件栈与编码规范？
- 标准答案:了解现有最佳实践，避免重复造轮子。
- 追问点:错误码标准；日志追踪方案；安全合规要求。
- 参考:团队内部规范

### Q2:部署方式及多进程策略？
- 标准答案:确认是否使用 pm2/cluster/K8s，方便评估会话存储和健康检查方案。
- 追问点:滚动发布/灰度；资源配额；性能基线。
- 参考:团队内部规范
