# Spring Boot

## 元信息
- 定位与场景：Java 企业级应用主力框架，提供自动配置与生产级能力。
- 版本范围：以 Spring Boot 3 为主，兼容部分 2.x 迁移场景。
- 相关生态：Spring Framework、Spring Cloud、Actuator、Spring Data。

## 研究记录（Exa）
- 查询 1："Spring Boot interview questions 2024 2025"
- 查询 2："Spring Boot best practices documentation"
- 查询 3："Spring Boot auto configuration actuator"
- 来源摘要：已基于官方 Actuator 与自动配置资料整理。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Spring Boot 自动配置的核心原理？
  - A：基于 `@EnableAutoConfiguration` + 条件注解按需装配 Bean。
- Q2：Starter 依赖的作用？
  - A：聚合依赖并提供默认配置，简化依赖管理。
- Q3：`@ConfigurationProperties` 与 `@Value` 的差异？
  - A：前者批量绑定配置并支持校验，后者用于单个值注入。
- Q4：Actuator 有哪些常用端点？
  - A：`health`、`metrics`、`info`、`loggers` 等。
- Q5：Profiles 的作用与优先级？
  - A：用于分环境配置，优先级按命令行 > 环境变量 > 配置文件。

### 进阶/场景题
- Q1：为什么 `@Transactional` 可能不生效？
  - A：代理失效（内部调用、非 public 方法）或未启用事务管理。
- Q2：启动慢/Bean 冲突如何排查？
  - A：查看启动日志、`--debug`、条件装配报告与依赖冲突。

### 避坑指南
- `@Transactional` 写在私有方法或内部调用，导致事务失效。
- 配置文件优先级理解错误，导致环境配置混乱。
- 盲目暴露所有 Actuator 端点带来安全风险。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Spring Boot 官方文档：https://spring.io/projects/spring-boot
- Actuator 指南：https://docs.spring.io/spring-boot/how-to/actuator.html
```

### 常用代码片段
```java
@SpringBootApplication
public class Application {
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
```

```yml
# application.yml
server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: "health,info,metrics"
```

### 版本差异
- Spring Boot 3 基于 Jakarta EE（包名从 `javax.*` 迁移到 `jakarta.*`）。
- Spring Boot 3 最低 Java 版本提升（以官方文档为准）。
- 迁移需参考官方迁移指南与 Release Notes。
