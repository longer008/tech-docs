# MongoDB 面试题集

> MongoDB 核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. MongoDB 核心概念

| SQL 概念 | MongoDB 概念 |
|---------|-------------|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Index | Index |
| Primary Key | _id |

```javascript
// 文档示例
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "Tom",
  age: 25,
  email: "tom@example.com",
  tags: ["developer", "nodejs"],
  address: {
    city: "Shanghai",
    country: "China"
  },
  createdAt: ISODate("2024-01-15T10:30:00Z")
}
```

---

#### 2. CRUD 操作

```javascript
// 插入
db.users.insertOne({ name: "Tom", age: 25 })
db.users.insertMany([
  { name: "Alice", age: 30 },
  { name: "Bob", age: 28 }
])

// 查询
db.users.find()
db.users.find({ age: { $gt: 25 } })
db.users.findOne({ name: "Tom" })

// 查询操作符
{ age: { $eq: 25 } }      // 等于
{ age: { $ne: 25 } }      // 不等于
{ age: { $gt: 25 } }      // 大于
{ age: { $gte: 25 } }     // 大于等于
{ age: { $lt: 25 } }      // 小于
{ age: { $lte: 25 } }     // 小于等于
{ age: { $in: [25, 30] } }  // 在数组中
{ age: { $nin: [25, 30] } } // 不在数组中
{ $and: [{}, {}] }        // 与
{ $or: [{}, {}] }         // 或
{ $not: {} }              // 非
{ name: { $regex: /^T/ } } // 正则

// 投影
db.users.find({}, { name: 1, age: 1, _id: 0 })

// 排序、分页
db.users.find().sort({ age: -1 }).skip(10).limit(10)

// 更新
db.users.updateOne(
  { name: "Tom" },
  { $set: { age: 26 } }
)
db.users.updateMany(
  { age: { $lt: 30 } },
  { $inc: { age: 1 } }
)

// 更新操作符
{ $set: { field: value } }     // 设置字段
{ $unset: { field: "" } }      // 删除字段
{ $inc: { field: 1 } }         // 增加
{ $mul: { field: 2 } }         // 乘法
{ $push: { array: value } }    // 数组追加
{ $pull: { array: value } }    // 数组删除
{ $addToSet: { array: value }} // 数组去重添加

// 删除
db.users.deleteOne({ name: "Tom" })
db.users.deleteMany({ age: { $lt: 18 } })
```

---

#### 3. 索引

```javascript
// 创建索引
db.users.createIndex({ name: 1 })           // 升序
db.users.createIndex({ age: -1 })           // 降序
db.users.createIndex({ name: 1, age: -1 })  // 复合索引
db.users.createIndex({ name: 1 }, { unique: true })  // 唯一索引
db.users.createIndex({ location: "2dsphere" })  // 地理索引
db.users.createIndex({ content: "text" })   // 文本索引
db.users.createIndex({ field: 1 }, { expireAfterSeconds: 3600 })  // TTL 索引

// 查看索引
db.users.getIndexes()

// 删除索引
db.users.dropIndex("name_1")
db.users.dropIndexes()

// 执行计划
db.users.find({ name: "Tom" }).explain("executionStats")
```

**索引类型：**
| 类型 | 说明 |
|------|------|
| 单字段索引 | 单个字段的索引 |
| 复合索引 | 多个字段的组合索引 |
| 多键索引 | 数组字段的索引 |
| 文本索引 | 全文搜索索引 |
| 地理空间索引 | 地理位置数据索引 |
| 哈希索引 | 哈希分片使用 |
| TTL 索引 | 自动过期删除 |

---

#### 4. 聚合管道

```javascript
db.orders.aggregate([
  // $match - 过滤
  { $match: { status: "completed" } },

  // $group - 分组
  { $group: {
    _id: "$userId",
    totalAmount: { $sum: "$amount" },
    count: { $sum: 1 },
    avgAmount: { $avg: "$amount" }
  }},

  // $sort - 排序
  { $sort: { totalAmount: -1 } },

  // $limit - 限制
  { $limit: 10 },

  // $project - 投影
  { $project: {
    userId: "$_id",
    totalAmount: 1,
    count: 1,
    _id: 0
  }},

  // $lookup - 关联查询
  { $lookup: {
    from: "users",
    localField: "userId",
    foreignField: "_id",
    as: "user"
  }},

  // $unwind - 展开数组
  { $unwind: "$user" }
])

// 常用聚合操作符
$sum, $avg, $min, $max, $first, $last
$push, $addToSet
$count
```

---

#### 5. 复制集

```
┌─────────────────────────────────────────────────────────┐
│                    复制集架构                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│         ┌─────────────┐                                 │
│         │   Primary   │ ← 写操作                        │
│         │   (主节点)   │                                 │
│         └──────┬──────┘                                 │
│           ┌────┴────┐                                   │
│           ▼         ▼                                   │
│   ┌───────────┐ ┌───────────┐                          │
│   │ Secondary │ │ Secondary │ ← 读操作                 │
│   │ (从节点)   │ │ (从节点)   │                          │
│   └───────────┘ └───────────┘                          │
│                                                          │
│   可选：Arbiter（仲裁节点）- 只投票，不存数据             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

```javascript
// 复制集配置
rs.initiate({
  _id: "myReplicaSet",
  members: [
    { _id: 0, host: "mongo1:27017", priority: 2 },
    { _id: 1, host: "mongo2:27017", priority: 1 },
    { _id: 2, host: "mongo3:27017", priority: 1 }
  ]
})

// 查看状态
rs.status()

// 读偏好设置
db.users.find().readPref("secondary")
// primary, primaryPreferred, secondary, secondaryPreferred, nearest
```

---

### 进阶题

#### 6. 分片集群

```
┌─────────────────────────────────────────────────────────┐
│                    分片集群架构                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌───────────┐ ┌───────────┐ ┌───────────┐            │
│   │  mongos   │ │  mongos   │ │  mongos   │ ← 路由     │
│   └─────┬─────┘ └─────┬─────┘ └─────┬─────┘            │
│         └───────┬─────┴───────┬─────┘                   │
│                 │             │                          │
│         ┌───────▼─────┐       │                          │
│         │ Config Servers │ ← 元数据                     │
│         │ (复制集)      │                                │
│         └───────────────┘                                │
│                 │                                        │
│     ┌───────────┼───────────┐                           │
│     ▼           ▼           ▼                           │
│ ┌────────┐ ┌────────┐ ┌────────┐                       │
│ │ Shard1 │ │ Shard2 │ │ Shard3 │ ← 数据分片           │
│ │(复制集)│ │(复制集)│ │(复制集)│                       │
│ └────────┘ └────────┘ └────────┘                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

```javascript
// 启用分片
sh.enableSharding("mydb")

// 设置分片键
sh.shardCollection("mydb.users", { userId: "hashed" })  // 哈希分片
sh.shardCollection("mydb.logs", { timestamp: 1 })       // 范围分片

// 查看分片状态
sh.status()
```

**分片键选择：**
- 高基数（区分度高）
- 写分布均匀
- 查询局部性

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "MongoDB 不支持事务" | 4.0+ 支持多文档事务 |
| "_id 必须是 ObjectId" | _id 可以是任意类型 |
| "MongoDB 没有 Schema" | 可以用 Schema Validation |
| "嵌入文档没有限制" | 单文档最大 16MB |
| "索引越多越好" | 索引影响写入性能 |

---

## B. 实战文档

### 连接示例

```javascript
// Node.js (mongoose)
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 定义 Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  age: { type: Number, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
```

```python
# Python (pymongo)
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['mydb']
users = db['users']

# 插入
users.insert_one({'name': 'Tom', 'age': 25})

# 查询
user = users.find_one({'name': 'Tom'})
```
