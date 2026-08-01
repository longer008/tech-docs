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

## A. 面试题库（Interview Bank）

> 详细题库与解析请查看：
> - [Spring Cloud 面试题速查](interview-bank.md) —— 高频问答速查

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
