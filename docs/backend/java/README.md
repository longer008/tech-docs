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

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：JDK、JRE、JVM 的区别？
  - A：JDK 含开发工具与运行环境；JRE 是运行环境；JVM 是执行字节码的虚拟机。
- Q2：`HashMap` 的底层结构与扩容机制？
  - A：数组 + 链表/红黑树，负载因子触发扩容。
- Q3：`equals` 与 `hashCode` 必须满足什么约定？
  - A：相等对象必须有相同 hashCode，否则集合类行为异常。
- Q4：线程与进程的区别？常见线程创建方式？
  - A：线程是进程内执行单元；常见方式为继承 `Thread`、实现 `Runnable/Callable`。
- Q5：常见 GC 算法与分代思想？
  - A：标记-清除、复制、标记-整理；年轻代/老年代分代回收。

### 进阶/场景题
- Q1：线上服务 CPU 飙高与 GC 频繁的排查思路？
  - A：结合 `jstack`/`jmap`/GC 日志定位热点线程与内存分配热点。
- Q2：线程池参数如何确定？
  - A：根据 CPU/IO 密集度、任务时长与目标吞吐设置核心线程、队列与拒绝策略。

### 避坑指南
- 误用 `==` 比较字符串，忽略 `equals`。
- 未重写 `hashCode` 导致集合行为异常。
- 并发场景使用非线程安全集合。
- 忽视资源关闭与异常处理，造成泄漏。

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
