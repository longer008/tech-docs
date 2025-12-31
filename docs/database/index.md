---
title: 数据库与中间件
---

# 数据库与中间件

数据存储与中间件技术栈涵盖关系型数据库、缓存、文档数据库及消息队列。

## 模块概览

| 分类 | 技术 | 链接 |
|------|------|------|
| 关系型数据库 | MySQL (索引/事务/调优) | [查看](/database/mysql/mysql-index-interview) |
| 缓存 | Redis (数据结构/集群/持久化) | [查看](/database/redis/redis-interview) |
| 文档数据库 | MongoDB | [查看](/database/mongodb/mongodb-interview) |
| 消息队列 | Kafka, RabbitMQ | [查看](/database/mq/kafka-interview) |

## 学习路线

```
MySQL 基础 → 索引优化 → 事务/锁 → Redis 缓存 → 消息队列
```

::: warning 面试重点
- MySQL: B+树索引、事务 ACID、MVCC、锁机制
- Redis: 数据类型、持久化、缓存穿透/击穿/雪崩
- MQ: 消息可靠性、顺序性、幂等性
:::
