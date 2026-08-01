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

## A. 面试题库（Interview Bank）

> 详细题库与解析请查看：
> - [MongoDB 面试题速查](interview-bank.md) —— 高频问答速查
> - [MongoDB 面试题集](mongodb-interview.md)

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
