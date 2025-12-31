# Spring Boot 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:Spring Boot 自动配置的工作原理？
- 标准答案:依赖 `spring-boot-autoconfigure`，通过 `@EnableAutoConfiguration` / `SpringFactoriesLoader` 读取 `spring.factories` 中的 `AutoConfiguration` 类；条件注解 `@Conditional*` 判断是否生效；最终合并到应用上下文。
- 追问点:如何排查某个自动配置未生效；`@ImportAutoConfiguration` 用法；Spring Boot 3 使用 `AutoConfiguration.imports` 的变化。
- 参考:https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.developing-auto-configuration

### Q2:Starter 的作用与自定义步骤？
- 标准答案:Starter 封装依赖与默认配置，引用后即开箱即用；自定义时拆为 autoconfigure 模块+starter 模块，提供配置属性、自动配置类与默认 Bean，并发布到私仓。
- 追问点:如何避免 Bean 覆盖；条件装配策略；示例：多数据源 starter。
- 参考:https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.starters

### Q3:`@ConfigurationProperties` 与 `@Value` 差异？
- 标准答案:`@ConfigurationProperties` 成批绑定、支持类型转换/校验/元数据；适合配置类；`@Value` 适合零散注入或 SpEL；两者可结合 JSR-303 校验。
- 追问点:需要绑定 map/list 的写法；`@ConstructorBinding`；配置文件加密方案。
- 参考:https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config

### Q4:Actuator 能提供什么？
- 标准答案:暴露健康检查、指标、线程/日志级别、环境信息等端点；支持 Micrometer 将指标上报 Prometheus/InfluxDB；可通过 `management.endpoints.web.exposure` 控制暴露列表。
- 追问点:如何保护敏感端点；自定义健康检查；与 Spring Boot Admin 集成。
- 参考:https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html

### Q5:Profiles 使用场景？
- 标准答案:通过 `application-{profile}.yml` 区分环境；`spring.profiles.active/include` 组合；`@Profile` 控制 Bean；常用于 dev/test/prod 分环境配置。
- 追问点:命令行/环境变量激活方式；多 profile 优先级；配置中心融合。
- 参考:https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.profiles

### Q6:Bean 生命周期与初始化顺序？
- 标准答案:实例化→依赖注入→`Aware` 回调→`@PostConstruct`→`InitializingBean`→`SmartLifecycle`/事件→销毁前 `@PreDestroy`；可用 `@DependsOn`、`SmartLifecycle#phase` 控制顺序。
- 追问点:懒加载 Bean；`BeanFactoryPostProcessor` 与 `BeanPostProcessor` 区别；循环依赖触发点。
- 参考:https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-lifecycle

### Q7:@Transactional 的行为与限制？
- 标准答案:基于 AOP 代理，默认只作用于 `public` 方法；同类内部调用不会触发；支持传播特性、隔离级别、回滚规则；需使用代理对象调用。
- 追问点:为什么不推荐在构造函数中使用；只读事务对性能的影响；事务与异步/多线程的关系。
- 参考:https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction

### Q8:如何精简启动时间？
- 标准答案:排查不必要的自动配置(`spring.autoconfigure.exclude`)、减少包扫描范围、开启延迟初始化、使用 Native Image/AOT、调优依赖。
- 追问点:Spring Boot 3 AOT 特性；分层打包对冷启动的作用；Profile 下的差异。
- 参考:https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.spring-application.lazy-initialization

## 场景/排查
### Q1:遇到循环依赖时如何处理？
- 标准答案:先定位具体 Bean 链路（启动日志、`--debug`、`Actuator/beans`）；判断是否可改为构造注入；拆分配置或引入接口/事件解耦；必要时使用 `@Lazy`/`ObjectFactory` 临时缓解但避免滥用。
- 追问点:三级缓存在解决字段注入循环依赖时的作用；原型作用域为何更敏感；AOP 代理与循环依赖。
- 参考:https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-circular-dependencies

### Q2:启动失败提示包冲突/版本不兼容怎么办？
- 标准答案:查看 `dependency:tree` 或 Gradle dependencies，识别冲突；使用 `spring-boot-dependencies` 管理版本；锁定 BOM；必要时排除传递依赖；保持 Spring 生态版本一致。
- 追问点:Spring Boot 与 Spring Cloud 版本矩阵；如何在多模块统一管理。
- 参考:https://spring.io/projects/spring-boot

## 反问
### Q1:生产环境监控链路如何落地？是否使用 Actuator + Micrometer？
- 标准答案:了解团队可观测性成熟度与指标采集/告警策略。
- 追问点:日志规范；traceId 透传；看板与告警阈值。
- 参考:团队内部规范

### Q2:配置管理与密钥分发方案？
- 标准答案:确认是否使用配置中心/密钥管理(KMS/Vault)，以及变更发布流程。
- 追问点:灰度/回滚；多集群一致性；审计要求。
- 参考:团队内部规范

### Q3:版本升级策略（如 2.x→3.x）及兼容性验证方式？
- 标准答案:了解技术债管理与回归测试范围，评估对 Native/AOT 的态度。
- 追问点:升级窗口；依赖矩阵；性能回归基线。
- 参考:团队内部规范
