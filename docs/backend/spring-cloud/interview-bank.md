# Spring Cloud 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:注册中心的作用及实现差异（Eureka/Nacos/Consul）？
- 标准答案:提供服务注册发现、健康检查；Eureka 强调 AP，客户端续约；Nacos 支持 AP/CP 切换并集成配置；Consul 默认 CP 有一致性校验；选择取决于一致性/生态需求。
- 追问点:心跳与剔除阈值；自我保护机制；跨机房注册同步。
- 参考:https://spring.io/projects/spring-cloud

### Q2:Spring Cloud Gateway 与 Zuul 的差别？
- 标准答案:Gateway 基于 WebFlux/Netty，支持响应式、过滤器链、路由断言；Zuul1 基于 Servlet 阻塞模式；新项目推荐 Gateway，支持限流/熔断/灰度。
- 追问点:自定义过滤器顺序；路由匹配；与安全/鉴权的集成。
- 参考:https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/

### Q3:Feign 的使用与超时重试？
- 标准答案:声明式 HTTP 客户端，支持契约、拦截器、日志；需配置连接/读超时、重试策略、降级；结合 Spring Cloud LoadBalancer 进行客户端负载。
- 追问点:Feign 与 RestTemplate/WebClient 取舍；如何传递请求上下文；压缩与日志脱敏。
- 参考:https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/

### Q4:熔断/限流方案（Hystrix/Resilience4j）？
- 标准答案:Hystrix 已停更，推荐 Resilience4j；提供隔离、熔断、限流、重试、缓存；通过注解或编程式配置，使用 Bulkhead/RateLimiter/Retry/CircuitBreaker 组合。
- 追问点:线程池隔离 vs 信号量隔离；熔断滑动窗口参数；与 Gateway 过滤器结合。
- 参考:https://resilience4j.readme.io/

### Q5:配置中心（Spring Cloud Config/Nacos Config）？
- 标准答案:集中管理配置，支持动态刷新 `@RefreshScope`；配置存储可在 Git/Nacos；需控制权限与灰度；与加密/密钥管理结合。
- 追问点:bootstrap vs application.yml 加载顺序；配置推送与拉取；刷新范围。
- 参考:https://docs.spring.io/spring-cloud-config/docs/current/reference/html/

### Q6:链路追踪与日志关联？
- 标准答案:Spring Cloud Sleuth 为请求注入 traceId/spanId，导出到 Zipkin/Jaeger；需要在日志格式中输出；与 Gateway/Feign/RestTemplate 自动透传。
- 追问点:异步线程池中 trace 传递；采样率配置；自定义 tag。
- 参考:https://docs.spring.io/spring-cloud-sleuth/docs/current/reference/html/

### Q7:客户端负载均衡如何实现？
- 标准答案:Spring Cloud 2022+ 使用 Spring Cloud LoadBalancer 替代 Ribbon；根据服务实例列表选择算法(轮询/权重/自定义)；可结合健康指标。
- 追问点:缓存刷新；实例筛选；与注册中心交互。
- 参考:https://docs.spring.io/spring-cloud-commons/docs/current/reference/html/#spring-cloud-loadbalancer

### Q8:服务间认证与安全？
- 标准答案:常见方案有 mTLS、JWT、网关统一鉴权；内部调用可使用签名或 AK/SK；避免在服务内保存凭证；结合配置中心管理密钥。
- 追问点:灰度与 A/B；权限下沉；安全审计。
- 参考:https://spring.io/guides

## 场景/排查
### Q1:注册表频繁抖动/实例被踢如何处理？
- 标准答案:检查实例心跳与超时配置，避免容器休眠导致；确认时钟同步；网络分区时考虑自我保护/双注册中心；增加实例权重或剔除策略。
- 追问点:K8s readiness 与注册联动；Eureka 自我保护的利弊；Nacos 权限/限流。
- 参考:https://spring.io/projects/spring-cloud

### Q2:链路调用延迟飙升排查步骤？
- 标准答案:从网关开始查看日志与追踪；检查下游熔断/限流是否触发；观察线程池/连接池耗尽；查看注册中心是否返回旧实例；必要时降级或限流。
- 追问点:批量请求合并；连接池配置(Feign/HttpClient/OKHttp/WebClient)；异步化策略。
- 参考:https://resilience4j.readme.io/

## 反问
### Q1:公司使用的 Spring Cloud 版本与 Release Train？
- 标准答案:确认与 Spring Boot 的兼容矩阵，评估升级风险。
- 追问点:是否使用 Alibaba 生态；AOT/Native 支持；维护窗口。
- 参考:团队内部规范

### Q2:服务治理配套设施？
- 标准答案:了解注册中心/配置中心/网关/限流熔断/链路追踪/日志监控的一致性，避免自建重复。
- 追问点:SLO/SLA；多活容灾；配置审核流程。
- 参考:团队内部规范
