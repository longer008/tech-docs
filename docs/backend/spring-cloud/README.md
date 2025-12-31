# Spring Cloud

## 元信息
- 定位与场景：微服务基础设施组件集合（配置、注册发现、网关、熔断等）。
- 版本范围：与 Spring Boot 版本强绑定，需参考官方兼容矩阵。
- 相关生态：Config、Gateway、OpenFeign、Resilience4j、Sleuth/Tracing。

## 研究记录（Exa）
- 查询 1："Spring Cloud interview questions 2024 2025"
- 查询 2："Spring Cloud best practices documentation"
- 查询 3："Spring Cloud reference"
- 来源摘要：以官方项目与参考文档为主要依据。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Spring Cloud 解决的核心问题？
  - A：微服务的配置、注册发现、网关、容错、链路追踪。
- Q2：配置中心（Config Server）的作用？
  - A：统一配置管理与动态刷新。
- Q3：网关（Gateway）与 API 网关的职责？
  - A：统一鉴权、路由、限流与日志。
- Q4：熔断/限流/降级如何落地？
  - A：通过 Resilience4j 等组件提供策略控制。
- Q5：分布式链路追踪的意义？
  - A：定位跨服务性能瓶颈与错误。

### 进阶/场景题
- Q1：如何进行灰度发布与版本治理？
  - A：通过网关路由与配置中心做流量分流。
- Q2：服务调用超时与重试策略怎么设计？
  - A：设置合理超时、重试次数与熔断阈值。

### 避坑指南
- 配置中心未隔离环境，导致配置污染。
- 超时与重试策略不合理引发雪崩。
- 链路追踪未统一采样与日志规范。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Spring Cloud 项目页：https://spring.io/projects/spring-cloud
- Spring Cloud 参考文档：https://docs.spring.io/spring-cloud-release/reference/
```

### 常用代码片段
```yml
# application.yml（示例）
spring:
  application:
    name: demo-service
  cloud:
    config:
      uri: http://config-server:8888
```

### 版本差异
- Spring Cloud 与 Spring Boot 强绑定，升级需参考兼容矩阵。
- 组件迁移与废弃以官方 Release Notes 为准。
