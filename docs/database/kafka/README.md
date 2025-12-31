# Kafka

## 元信息
- 定位与场景：分布式流式平台，支持高吞吐消息与实时处理。
- 版本范围：以官方稳定版本为准，关注 KRaft 与集群架构演进。
- 相关生态：Kafka Connect、Kafka Streams、Schema Registry。

## 研究记录（Exa）
- 查询 1："Kafka interview questions 2024 2025"
- 查询 2："Kafka best practices documentation"
- 查询 3："Kafka partitions offset"
- 来源摘要：以官方文档为主要参考，补充面试关注点。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Topic/Partition/Offset 的作用？
  - A：Topic 是逻辑分类，Partition 提供并行与扩展，Offset 标识消费位置。
- Q2：Producer/Consumer 的职责？
  - A：Producer 发送消息，Consumer 订阅消费。
- Q3：消费者组与再均衡机制？
  - A：组内分摊分区，成员变化触发再均衡。
- Q4：ISR 与副本机制的意义？
  - A：保证可靠性与容灾。
- Q5：消息投递语义有哪些？
  - A：At most once / At least once / Exactly once。

### 进阶/场景题
- Q1：如何保证分区内消息顺序？
  - A：同一 key 路由到同一分区。
- Q2：如何处理高延迟与消费积压？
  - A：扩分区、扩消费者、优化处理逻辑。

### 避坑指南
- 分区数不足导致吞吐受限。
- 不合理的 key 导致热点分区。
- 频繁再均衡导致抖动。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Kafka 官方文档：https://kafka.apache.org/documentation
- 架构与设计：https://kafka.apache.org/documentation/#design
```

### 常用代码片段
```txt
# 常见配置要点（示例）
# enable.idempotence=true
# acks=all
# retries=整数
```

### 版本差异
- 关注集群元数据管理方式的演进（KRaft vs ZooKeeper）。
- 迁移升级以官方文档与 Release Notes 为准。
