# NestJS 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:模块化与依赖注入机制？
- 标准答案:应用由 Module 组织，Controller 处理路由，Provider 通过 IOC 容器注入；模块默认单例，可用 `@Global` 全局模块；支持自定义 provider token 与作用域。
- 追问点:模块循环依赖处理(forwardRef)；作用域 request/transient；动态模块。
- 参考:https://docs.nestjs.com/modules

### Q2:管道(Pipe)作用？
- 标准答案:用于转换与验证入参，执行于路由处理前；常用 ValidationPipe 结合 class-validator/class-transformer；可设置全局管道。
- 追问点:自动去除未知字段(whitelist/forbidUnknownValues)；自定义 Pipe 触发时机；性能影响。
- 参考:https://docs.nestjs.com/pipes

### Q3:守卫(Guard)与拦截器(Interceptor)区别？
- 标准答案:Guard 决定请求是否被处理（鉴权/角色），Interceptor 可修改执行前后逻辑、响应格式、日志、缓存等；异常过滤器处理抛出的异常。
- 追问点:执行顺序；全局/控制器/方法作用域；异常流转。
- 参考:https://docs.nestjs.com/guards

### Q4:异常过滤器(Exception Filter)？
- 标准答案:捕获抛出的异常并格式化响应，内置 HttpException；可自定义过滤器处理业务异常、记录日志；支持全局注册。
- 追问点:继承 BaseExceptionFilter；RPC/WebSocket 适配；多异常匹配。
- 参考:https://docs.nestjs.com/exception-filters

### Q5:中间件与拦截器的区别？
- 标准答案:中间件基于 express/fastify，处理原始 req/res，多用于跨领域逻辑；拦截器基于 Nest 容器，作用在控制器方法前后，可注入依赖。
- 追问点:fastify 适配；顺序；与守卫组合。
- 参考:https://docs.nestjs.com/middleware

### Q6:微服务与消息模式？
- 标准答案:Nest 提供 TCP/Redis/NATS/MQTT/Kafka 等 Transport；Controller 使用 MessagePattern 处理；ClientProxy 发送消息；支持序列化、重试、超时。
- 追问点:ACK/重复消费；Saga/CQRS；回压。
- 参考:https://docs.nestjs.com/microservices/basics

### Q7:测试策略？
- 标准答案:使用 TestingModule 配置依赖；单元测试用 Jest + DI mocking；E2E 测试用 Supertest 启动应用；可利用 Pact/contract 测试。
- 追问点:覆写 provider；生命周期钩子；测试隔离。
- 参考:https://docs.nestjs.com/fundamentals/testing

### Q8:配置与环境管理？
- 标准答案:@nestjs/config 加载 .env，支持 schema 校验与层级；可结合 ConfigService 注入；敏感信息使用外部存储。
- 追问点:多环境文件；缓存配置；与验证/管道结合。
- 参考:https://docs.nestjs.com/techniques/configuration

## 场景/排查
### Q1:ValidationPipe 未生效/漏校验怎么办？
- 标准答案:确认全局启用 `app.useGlobalPipes(new ValidationPipe({...}))`；类定义使用装饰器；启用 transform；对数组元素需设置 `each: true`；在子模块中避免多实例冲突。
- 追问点:class-transformer 与 fastify 兼容；性能调优；错误格式。
- 参考:https://docs.nestjs.com/pipes#global-scoped-pipes

### Q2:CPU 占用高/事件循环阻塞？
- 标准答案:检查同步阻塞逻辑；使用异步驱动；重计算移至 worker/任务队列；fastify 相比 express 性能更好；必要时使用缓存与限流。
- 追问点:拦截器中耗时操作；Logger IO；微服务 transport 的 backpressure。
- 参考:https://docs.nestjs.com/techniques/performance

## 反问
### Q1:生产环境选用 express 还是 fastify 适配器？
- 标准答案:影响性能与中间件生态，需了解团队统一选择。
- 追问点:兼容性；benchmark 基线；迁移成本。
- 参考:团队内部规范

### Q2:微服务通信协议及治理方案？
- 标准答案:确认使用 Kafka/Redis/NATS/TCP 等；是否有统一重试/熔断/追踪策略。
- 追问点:消息格式；幂等等级；部署与监控。
- 参考:团队内部规范
