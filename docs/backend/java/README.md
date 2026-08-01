# Java

## 元信息
- 定位与场景：企业级后端主力语言，适用于高并发服务与复杂业务系统。
- 版本范围：以主流 LTS 版本为基线，关注版本升级差异。
- 相关生态：Spring Boot/Spring Cloud、MyBatis、JUC。

## 研究记录（Exa）
- 查询 1："Java interview questions 2024 2025"
- 查询 2："Java best practices documentation"
- 查询 3："Java architecture diagram"
- 来源摘要：已建立示例结构，内容需按来源更新为最新版本。

## A. 面试题库（Interview Bank）

> 详细题库与解析请查看：
> - [Java 面试题速查](interview-bank.md) —— 高频问答速查
> - [Java 核心面试题集](java-core-interview.md)
> - [JUC 并发面试题集](juc-interview.md)
> - [MyBatis 面试题集](mybatis-interview.md)
> - [Spring Boot 面试题集](spring-boot-interview.md)
> - [Spring Cloud 面试题集](spring-cloud-interview.md)

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Java 官方文档： https://docs.oracle.com/en/java/
- OpenJDK： https://openjdk.org/
```

### 常用代码片段
```java
// try-with-resources 资源自动关闭
try (var in = new FileInputStream("/tmp/a.txt")) {
  // 处理流
}

// CompletableFuture 简单异步组合
CompletableFuture.supplyAsync(() -> query())
  .thenApply(result -> transform(result))
  .thenAccept(out -> save(out));
```

### 版本差异
- 关注主流 LTS 版本特性变化与迁移成本。
- 语言特性与标准库的演进（如简化语法、并发与网络库增强）。
- 升级以官方 release notes 与迁移指南为准。
