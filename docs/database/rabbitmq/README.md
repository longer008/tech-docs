# RabbitMQ

## 元信息
- 定位与场景：AMQP 消息队列，适合异步解耦与任务队列。
- 版本范围：以官方稳定版本为准。
- 相关生态：插件体系、集群与镜像队列。

## 研究记录（Exa）
- 查询 1："RabbitMQ interview questions 2024 2025"
- 查询 2："RabbitMQ best practices documentation"
- 查询 3："RabbitMQ production checklist"
- 来源摘要：以官方文档为主。

## A. 面试题库（Interview Bank）

> 详细题库与解析请查看：
> - [RabbitMQ 面试题速查](interview-bank.md) —— 高频问答速查
> - [RabbitMQ 面试题集](../mq/rabbitmq-interview.md)

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- RabbitMQ 文档：https://www.rabbitmq.com/docs
- 最佳实践：https://www.rabbitmq.com/docs/best-practices
- 生产清单：https://www.rabbitmq.com/docs/production-checklist
```

### 常用代码片段
```txt
# 生产建议（示意）
# 1) 启用持久化
# 2) 开启消费端 ACK
# 3) 配置监控
```

### 版本差异
- 关注集群与存储机制的演进。
- 升级以官方 Release Notes 为准。
