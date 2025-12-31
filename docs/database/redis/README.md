# Redis

## 元信息
- 定位与场景：高性能内存数据结构存储，常用于缓存、会话、计数器与队列。
- 版本范围：以主流稳定版本为基线，关注主版本变更（以 Release Notes 为准）。
- 相关生态：Redis Cluster、Sentinel、Redis Insight。

## 研究记录（Exa）
- 查询 1："Redis interview questions 2024 2025"
- 查询 2："Redis best practices documentation"
- 查询 3："Redis key eviction maxmemory-policy"
- 来源摘要：已基于官方文档与面试题库整理。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Redis 支持哪些数据结构？
  - A：字符串、哈希、列表、集合、有序集合等。
- Q2：RDB 与 AOF 的区别？
  - A：RDB 是快照，恢复快；AOF 是追加日志，数据更完整但体积更大。
- Q3：常见缓存问题（击穿/穿透/雪崩）如何解决？
  - A：布隆过滤器、互斥锁、热点预热、随机过期等。
- Q4：Redis Cluster 与 Sentinel 的区别？
  - A：Cluster 解决水平扩展与分片；Sentinel 主要做高可用与主从切换。
- Q5：过期策略与淘汰策略是什么？
  - A：过期删除是按策略清理；淘汰策略根据 `maxmemory-policy` 选择 LRU/LFU 等。

### 进阶/场景题
- Q1：如何保证缓存与数据库一致性？
  - A：采用延时双删/消息队列/写入后失效策略，避免脏读。
- Q2：高并发下如何避免缓存击穿？
  - A：热点 key 加互斥锁或使用请求合并。

### 避坑指南
- 仅依赖缓存作为唯一数据源，导致数据丢失。
- 没有设置过期时间，导致内存不可控。
- 盲目开启持久化但不评估性能影响。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Redis 官方文档：https://redis.io/docs/
- 淘汰策略：https://redis.io/docs/latest/develop/reference/eviction
- 命令参考：https://redis.io/commands/
```

### 常用代码片段
```txt
# 常用命令示例
SET user:1 "tom"
GET user:1
HSET user:1 name "tom" age 18
LPUSH queue "job1"
RPOP queue
EXPIRE user:1 3600
```

### 版本差异
- 主版本在 ACL、安全、性能与集群能力上持续演进。
- 迁移升级需参考官方 Release Notes 与配置变更说明。
