# Node.js 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:事件循环的阶段与宏/微任务？
- 标准答案:事件循环按 timers→pending→idle→poll→check→close 轮转；微任务(NextTick/Promise jobs)在当前阶段结束后优先执行；宏任务在不同阶段调度；理解顺序是排查异步问题的核心。
- 追问点:setImmediate vs setTimeout；浏览器与 Node 的差异；`process.nextTick` 过量的风险。
- 参考:https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick

### Q2:CommonJS 与 ES Module 的区别？
- 标准答案:CJS 运行时加载、同步 `require`，`module.exports`; ESM 静态分析、`import/export`、默认严格模式、`top-level await` 支持；两者互操作需注意 `type` 字段和文件扩展名。
- 追问点:混用时的默认导出行为；构建工具如何处理；树摇优化需要 ESM。
- 参考:https://nodejs.org/api/esm.html

### Q3:异步编程几种方式及优缺点？
- 标准答案:回调(早期，易回调地狱)；Promise/async-await(可读性高，错误可用 try-catch)；事件/流(适合持续数据)；RxJS(声明式)；选择取决于场景与依赖。
- 追问点:并发与并行的实现；Promise.all 的 fail-fast 特性；串行化请求的写法。
- 参考:https://nodejs.org/api/async_hooks.html

### Q4:进程与线程模型？
- 标准答案:Node 主线程运行 JS，I/O 依赖 libuv 线程池；CPU 密集建议使用 worker_threads 或 child_process；cluster 多进程共享端口用于水平扩展。
- 追问点:worker 与 child 的差异；消息传递/共享内存；何时需要调整线程池大小。
- 参考:https://nodejs.org/api/worker_threads.html

### Q5:内存与 Buffer 管理？
- 标准答案:默认 64 位堆上限约 1.4~2GB，可通过 `--max-old-space-size` 调整；Buffer 是堆外内存，适合二进制处理；注意释放引用避免泄漏。
- 追问点:如何使用 `node --inspect` 排查泄漏；为何大文件要用流；V8 新生代/老年代差异。
- 参考:https://nodejs.org/api/buffer.html

### Q6:流(Stream)的优势及常见类型？
- 标准答案:流支持分段处理，降低内存占用；类型有 Readable/Writable/Duplex/Transform；配合 `pipe` 自动处理 backpressure；适合文件/网络传输。
- 追问点:背压如何体现；`pipeline` 与 `pipe` 区别；对象模式。
- 参考:https://nodejs.org/api/stream.html

### Q7:包管理与锁文件？
- 标准答案:npm、yarn、pnpm 均生成锁文件确保可重现安装；pnpm 通过全局内容寻址节省磁盘；发布包需注意语义化版本与 peerDependencies。
- 追问点:workspaces 支持；npm scripts 安全性；`npx` 与全局安装差异。
- 参考:https://docs.npmjs.com/

### Q8:错误处理最佳实践？
- 标准答案:同步代码用 try-catch；Promise 使用 catch/统一错误处理中间件；监听 `uncaughtException`/`unhandledRejection` 仅做兜底并快速退出；为每个请求附加请求 ID 与日志。
- 追问点:如何在 async handler 中捕获异常；进程退出前的清理；多进程情况下的错误聚合。
- 参考:https://nodejs.org/api/process.html#event-uncaughtexception

## 场景/排查
### Q1:线上内存持续上涨如何诊断？
- 标准答案:开启 `--inspect` 或 `clinic doctor` 捕获 heap snapshot；对比快照定位泄漏对象；检查长生命周期缓存、全局变量、事件监听未释放；避免读取大文件到内存，用流处理。
- 追问点:生产如何安全抓取快照；Buffer 泄漏的特征；GC 日志怎么看。
- 参考:https://nodejs.org/en/docs/guides/debugging-getting-started

### Q2:CPU 密集任务拖慢响应怎么办？
- 标准答案:将计算移到 worker_threads/子进程；使用消息队列异步化；或通过原生模块/wasm 提升性能；在主线程设置超时保护避免阻塞事件循环。
- 追问点:数据序列化成本；如何复用 worker；集群与负载均衡。
- 参考:https://nodejs.org/api/worker_threads.html

## 反问
### Q1:Node 服务的部署与进程管理方式？
- 标准答案:确认是否使用 pm2/systemd/K8s，了解日志采集、健康检查、滚动升级流程。
- 追问点:反压与限流位置；无停机发布策略。
- 参考:团队内部规范

### Q2:统一的编码风格与错误返回格式？
- 标准答案:确认是否有 ESLint/Prettier 规则及 API 错误码约定，便于快速融入。
- 追问点:接口契约测试；OpenAPI 文档工具。
- 参考:团队内部规范
