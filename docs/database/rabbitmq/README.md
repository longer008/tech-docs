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

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：交换机（Exchange）与队列（Queue）的关系？
  - A：交换机路由消息到队列。
- Q2：常见交换机类型有哪些？
  - A：direct/topic/fanout/headers。
- Q3：消息确认机制？
  - A：ACK/NACK 保证可靠消费。
- Q4：持久化如何实现？
  - A：声明持久化队列与消息。
- Q5：死信队列的用途？
  - A：处理失败消息与延迟队列。

### 进阶/场景题
- Q1：如何做高可用部署？
  - A：集群、镜像队列与监控。
- Q2：如何优化吞吐？
  - A：合理预取、批量确认、优化网络。

### 避坑指南
- 未设置持久化导致消息丢失。
- 无 ACK 导致消息堆积或丢失。

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
