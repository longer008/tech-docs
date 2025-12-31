# MongoDB

## 元信息
- 定位与场景：面向文档的 NoSQL 数据库，适合高并发读写与灵活模型。
- 版本范围：关注主流稳定版本，迁移以官方 Release Notes 为准。
- 相关生态：MongoDB Atlas、聚合管道、复制集、分片。

## 研究记录（Exa）
- 查询 1："MongoDB interview questions 2024 2025"
- 查询 2："MongoDB best practices documentation"
- 查询 3："MongoDB sharding replication"
- 来源摘要：以官方文档为主要参考，补充常见面试关注点。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：MongoDB 与关系型数据库的核心差异？
  - A：文档模型、无固定 schema、水平扩展能力更强。
- Q2：索引的作用与常见类型？
  - A：提升查询性能；常见有单字段、复合、文本、地理空间、多键索引等。
- Q3：复制集（Replica Set）解决什么问题？
  - A：高可用与故障转移。
- Q4：分片（Sharding）的目的是什么？
  - A：水平扩展数据与吞吐。
- Q5：聚合管道（Aggregation Pipeline）应用场景？
  - A：复杂统计、数据清洗与聚合分析。

### 进阶/场景题
- Q1：如何选择分片键避免热点？
  - A：基于访问模式选择高基数且分布均匀的字段。
- Q2：文档建模时嵌入 vs 引用如何取舍？
  - A：读多写少与强一致场景倾向嵌入；跨集合共享与更新频繁倾向引用。

### 避坑指南
- 缺失索引导致全表扫描与性能瓶颈。
- 选择不合理的分片键导致热点。
- 文档过大或数组无界增长。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- MongoDB 官方文档：https://www.mongodb.com/docs/
- 分片：https://www.mongodb.com/docs/manual/sharding/
- 复制集：https://www.mongodb.com/docs/manual/replication/
- 索引：https://www.mongodb.com/docs/manual/indexes/
```

### 常用代码片段
```js
// 创建索引
 db.users.createIndex({ email: 1 })

// 简单聚合
 db.orders.aggregate([
   { $match: { status: 'PAID' } },
   { $group: { _id: '$userId', total: { $sum: '$amount' } } }
 ])
```

### 版本差异
- 主版本升级涉及存储引擎、复制与分片能力变更。
- 迁移需参考官方 Release Notes 与兼容性说明。
