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

## A. 面试题库（Interview Bank）

> 详细题库与解析请查看：
> - [Kafka 面试题速查](interview-bank.md) —— 高频问答速查
> - [Kafka 面试题集](../mq/kafka-interview.md)

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
