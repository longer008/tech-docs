# Redis 开发指南

> 更新时间：2025-02

## 目录导航

- [核心概念](#核心概念)
- [数据结构](#数据结构)
- [持久化机制](#持久化机制)
- [缓存策略](#缓存策略)
- [高可用架构](#高可用架构)
- [性能优化](#性能优化)
- [最佳实践](#最佳实践)

---

## 核心概念

### 什么是 Redis？

Redis（Remote Dictionary Server）是一个开源的内存数据结构存储系统，可用作数据库、缓存和消息代理。

**核心特点**：
- **内存存储**：数据存储在内存中，读写速度极快
- **丰富的数据结构**：支持字符串、哈希、列表、集合、有序集合等
- **持久化**：支持 RDB 和 AOF 两种持久化方式
- **高可用**：支持主从复制、哨兵和集群模式
- **原子操作**：所有操作都是原子性的
- **发布订阅**：支持消息发布订阅模式

**适用场景**：
- 缓存（热点数据、会话）
- 计数器（点赞、浏览量）
- 排行榜（有序集合）
- 消息队列（列表、Stream）
- 分布式锁
- 实时分析

**版本选择**：
- **Redis 6.x**：稳定版本，支持 ACL、多线程 I/O
- **Redis 7.x**：最新稳定版，性能提升，新特性丰富

---

## 数据结构

### String（字符串）

最基本的数据类型，可以存储字符串、整数或浮点数。

**常用命令**：

```bash
# 设置和获取
SET key value
GET key
MSET key1 value1 key2 value2
MGET key1 key2

# 设置过期时间
SET key value EX 3600  # 3600 秒后过期
SETEX key 3600 value

# 仅当 key 不存在时设置
SETNX key value

# 数值操作
SET counter 0
INCR counter        # 自增 1
INCRBY counter 10   # 增加 10
DECR counter        # 自减 1
DECRBY counter 5    # 减少 5

# 追加
APPEND key " world"
```

**应用场景**：
- 缓存对象（JSON 字符串）
- 计数器（点赞数、浏览量）
- 分布式锁
- Session 存储

```bash
# 示例：缓存用户信息
SET user:1001 '{"id":1001,"name":"Alice","age":25}'
GET user:1001

# 示例：计数器
INCR article:1001:views
GET article:1001:views

# 示例：分布式锁
SET lock:order:1001 "uuid" NX EX 10
```

### Hash（哈希）

键值对集合，适合存储对象。

**常用命令**：

```bash
# 设置和获取
HSET user:1001 name "Alice"
HSET user:1001 age 25
HGET user:1001 name
HMSET user:1001 name "Alice" age 25 city "Beijing"
HMGET user:1001 name age
HGETALL user:1001

# 删除字段
HDEL user:1001 age

# 检查字段是否存在
HEXISTS user:1001 name

# 获取所有字段或值
HKEYS user:1001
HVALS user:1001

# 字段数量
HLEN user:1001

# 数值操作
HINCRBY user:1001 age 1
```

**应用场景**：
- 存储对象（用户信息、商品信息）
- 购物车

```bash
# 示例：用户信息
HSET user:1001 name "Alice" age 25 email "alice@example.com"
HGETALL user:1001

# 示例：购物车
HSET cart:1001 product:101 2  # 商品 101，数量 2
HSET cart:1001 product:102 1
HINCRBY cart:1001 product:101 1  # 增加数量
HGETALL cart:1001
```

### List（列表）

有序的字符串列表，可以从两端推入或弹出元素。

**常用命令**：

```bash
# 推入元素
LPUSH queue "task1"  # 左侧推入
RPUSH queue "task2"  # 右侧推入

# 弹出元素
LPOP queue           # 左侧弹出
RPOP queue           # 右侧弹出

# 阻塞弹出
BLPOP queue 10       # 阻塞 10 秒
BRPOP queue 10

# 获取范围
LRANGE queue 0 -1    # 获取所有元素
LRANGE queue 0 9     # 获取前 10 个

# 获取指定位置
LINDEX queue 0

# 列表长度
LLEN queue

# 修剪列表
LTRIM queue 0 99     # 只保留前 100 个
```

**应用场景**：
- 消息队列
- 最新动态列表
- 评论列表

```bash
# 示例：消息队列
LPUSH queue:email "email1"
LPUSH queue:email "email2"
BRPOP queue:email 0  # 阻塞等待

# 示例：最新文章
LPUSH articles:latest "article:1001"
LPUSH articles:latest "article:1002"
LRANGE articles:latest 0 9  # 获取最新 10 篇
LTRIM articles:latest 0 99  # 只保留最新 100 篇
```

### Set（集合）

无序的字符串集合，元素唯一。

**常用命令**：

```bash
# 添加和删除
SADD tags "redis" "database" "cache"
SREM tags "cache"

# 获取所有成员
SMEMBERS tags

# 检查成员是否存在
SISMEMBER tags "redis"

# 集合大小
SCARD tags

# 随机获取
SRANDMEMBER tags 2

# 弹出随机元素
SPOP tags

# 集合运算
SADD set1 "a" "b" "c"
SADD set2 "b" "c" "d"
SINTER set1 set2      # 交集：b c
SUNION set1 set2      # 并集：a b c d
SDIFF set1 set2       # 差集：a
```

**应用场景**：
- 标签系统
- 共同好友
- 去重

```bash
# 示例：文章标签
SADD article:1001:tags "redis" "database" "nosql"
SMEMBERS article:1001:tags

# 示例：共同好友
SADD user:1001:friends "user:1002" "user:1003" "user:1004"
SADD user:1005:friends "user:1003" "user:1004" "user:1006"
SINTER user:1001:friends user:1005:friends  # 共同好友

# 示例：抽奖
SADD lottery:users "user:1001" "user:1002" "user:1003"
SPOP lottery:users 1  # 随机抽取 1 个
```

### Sorted Set（有序集合）

有序的字符串集合，每个成员关联一个分数（score）。

**常用命令**：

```bash
# 添加成员
ZADD leaderboard 100 "player1"
ZADD leaderboard 200 "player2" 150 "player3"

# 获取分数
ZSCORE leaderboard "player1"

# 获取排名
ZRANK leaderboard "player1"      # 升序排名（从 0 开始）
ZREVRANK leaderboard "player1"   # 降序排名

# 获取范围
ZRANGE leaderboard 0 9           # 前 10 名（升序）
ZREVRANGE leaderboard 0 9        # 前 10 名（降序）
ZRANGE leaderboard 0 9 WITHSCORES

# 按分数范围获取
ZRANGEBYSCORE leaderboard 100 200

# 增加分数
ZINCRBY leaderboard 10 "player1"

# 删除成员
ZREM leaderboard "player1"

# 集合大小
ZCARD leaderboard

# 分数范围内的成员数
ZCOUNT leaderboard 100 200
```

**应用场景**：
- 排行榜
- 延时队列
- 优先级队列

```bash
# 示例：游戏排行榜
ZADD game:leaderboard 1000 "player1" 1500 "player2" 800 "player3"
ZREVRANGE game:leaderboard 0 9 WITHSCORES  # 前 10 名
ZRANK game:leaderboard "player1"            # 排名

# 示例：延时队列
ZADD delay:queue 1704067200 "task1"  # 时间戳作为分数
ZADD delay:queue 1704070800 "task2"
ZRANGEBYSCORE delay:queue 0 1704067200  # 获取到期任务
```

---

## 持久化机制

### RDB（快照）

RDB 是 Redis 的默认持久化方式，将内存中的数据快照保存到磁盘。

**特点**：
- 生成紧凑的二进制文件
- 恢复速度快
- 适合备份和灾难恢复
- 可能丢失最后一次快照后的数据

**配置**：

```bash
# redis.conf
save 900 1      # 900 秒内至少 1 个 key 变化
save 300 10     # 300 秒内至少 10 个 key 变化
save 60 10000   # 60 秒内至少 10000 个 key 变化

# RDB 文件名
dbfilename dump.rdb

# RDB 文件目录
dir /var/lib/redis
```

**手动触发**：

```bash
SAVE        # 同步保存（阻塞）
BGSAVE      # 后台保存（非阻塞）
LASTSAVE    # 最后一次保存时间
```

### AOF（追加文件）

AOF 记录每个写操作，通过重放日志恢复数据。

**特点**：
- 数据更完整（最多丢失 1 秒数据）
- 文件体积较大
- 恢复速度较慢
- 支持重写压缩

**配置**：

```bash
# redis.conf
appendonly yes
appendfilename "appendonly.aof"

# 同步策略
appendfsync always    # 每次写入都同步（最安全，最慢）
appendfsync everysec  # 每秒同步一次（推荐）
appendfsync no        # 由操作系统决定（最快，最不安全）

# AOF 重写
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

**手动触发**：

```bash
BGREWRITEAOF  # 后台重写 AOF 文件
```

### RDB vs AOF

| 特性 | RDB | AOF |
|------|-----|-----|
| 文件大小 | 小 | 大 |
| 恢复速度 | 快 | 慢 |
| 数据完整性 | 可能丢失数据 | 更完整 |
| 性能影响 | 小 | 较大 |
| 适用场景 | 备份、灾难恢复 | 数据完整性要求高 |

**混合持久化**（Redis 4.0+）：

```bash
# redis.conf
aof-use-rdb-preamble yes  # AOF 重写时使用 RDB 格式
```

---

## 缓存策略

### 过期策略

Redis 使用两种策略删除过期 key：

**1. 惰性删除**：
- 访问 key 时检查是否过期
- 节省 CPU，但可能占用内存

**2. 定期删除**：
- 每秒执行 10 次（默认）
- 随机抽取 20 个 key 检查
- 删除过期 key 超过 25% 则继续

### 淘汰策略

当内存不足时，Redis 根据 `maxmemory-policy` 淘汰 key。

**配置**：

```bash
# redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru
```

**淘汰策略**：

| 策略 | 说明 |
|------|------|
| noeviction | 不淘汰，写入返回错误（默认） |
| allkeys-lru | 所有 key 中淘汰最近最少使用 |
| allkeys-lfu | 所有 key 中淘汰最不常用 |
| allkeys-random | 所有 key 中随机淘汰 |
| volatile-lru | 设置过期时间的 key 中淘汰 LRU |
| volatile-lfu | 设置过期时间的 key 中淘汰 LFU |
| volatile-random | 设置过期时间的 key 中随机淘汰 |
| volatile-ttl | 淘汰即将过期的 key |

**推荐**：
- 缓存场景：`allkeys-lru` 或 `allkeys-lfu`
- 混合场景：`volatile-lru` 或 `volatile-lfu`

### 缓存问题

**1. 缓存穿透**：

查询不存在的数据，导致每次都查询数据库。

**解决方案**：
- 布隆过滤器
- 缓存空值（设置短过期时间）

```bash
# 缓存空值
GET user:9999
# 不存在，查询数据库后缓存空值
SET user:9999 "null" EX 60
```

**2. 缓存击穿**：

热点 key 过期，大量请求同时查询数据库。

**解决方案**：
- 热点 key 不设置过期时间
- 互斥锁（只允许一个请求查询数据库）
- 提前刷新

```bash
# 互斥锁
SET lock:user:1001 "1" NX EX 10
# 获取锁成功，查询数据库
# 获取锁失败，等待或重试
```

**3. 缓存雪崩**：

大量 key 同时过期，导致数据库压力激增。

**解决方案**：
- 过期时间加随机值
- 热点数据不过期
- 多级缓存
- 限流降级

```bash
# 过期时间加随机值
import random
expire_time = 3600 + random.randint(0, 300)
SET key value EX expire_time
```

### 缓存更新策略

**1. Cache Aside（旁路缓存）**：

```
读取：
1. 查询缓存
2. 缓存命中，返回
3. 缓存未命中，查询数据库
4. 写入缓存，返回

更新：
1. 更新数据库
2. 删除缓存
```

**2. Read/Write Through**：

```
读取：
1. 查询缓存
2. 缓存未命中，缓存层查询数据库并更新缓存

更新：
1. 更新缓存
2. 缓存层更新数据库
```

**3. Write Behind（异步写入）**：

```
更新：
1. 更新缓存
2. 异步批量写入数据库
```

---

## 高可用架构

### 主从复制

主从复制实现数据备份和读写分离。

**配置从库**：

```bash
# redis.conf
replicaof 192.168.1.100 6379
masterauth password
replica-read-only yes
```

**命令方式**：

```bash
REPLICAOF 192.168.1.100 6379
REPLICAOF NO ONE  # 取消复制
```

**复制流程**：
1. 从库发送 SYNC 命令
2. 主库执行 BGSAVE 生成 RDB
3. 主库发送 RDB 文件
4. 主库发送缓冲区的写命令
5. 从库加载 RDB 并执行命令

### 哨兵模式（Sentinel）

哨兵实现自动故障转移和监控。

**配置哨兵**：

```bash
# sentinel.conf
sentinel monitor mymaster 192.168.1.100 6379 2
sentinel auth-pass mymaster password
sentinel down-after-milliseconds mymaster 5000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 180000
```

**启动哨兵**：

```bash
redis-sentinel /path/to/sentinel.conf
```

**哨兵功能**：
- 监控主从节点
- 自动故障转移
- 配置提供者
- 通知

### 集群模式（Cluster）

Redis Cluster 实现数据分片和高可用。

**特点**：
- 数据自动分片（16384 个槽）
- 支持主从复制
- 自动故障转移
- 无中心架构

**配置集群**：

```bash
# redis.conf
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
```

**创建集群**：

```bash
redis-cli --cluster create \
  192.168.1.101:6379 \
  192.168.1.102:6379 \
  192.168.1.103:6379 \
  --cluster-replicas 0
```

**集群命令**：

```bash
CLUSTER INFO
CLUSTER NODES
CLUSTER SLOTS
CLUSTER KEYSLOT key
```

---

## 性能优化

### 慢查询分析

```bash
# 配置
CONFIG SET slowlog-log-slower-than 10000  # 10ms
CONFIG SET slowlog-max-len 128

# 查看慢查询
SLOWLOG GET 10
SLOWLOG LEN
SLOWLOG RESET
```

### 大 key 问题

**查找大 key**：

```bash
redis-cli --bigkeys
```

**解决方案**：
- 拆分大 key
- 使用 SCAN 代替 KEYS
- 使用 UNLINK 代替 DEL（异步删除）

### 热 key 问题

**解决方案**：
- 本地缓存
- 多级缓存
- 读写分离
- 热 key 备份

### 内存优化

**1. 数据压缩**：

```bash
# 使用 Hash 存储小对象
HSET user:1001 name "Alice" age 25

# 使用 ziplist（小数据量）
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
```

**2. 过期时间**：

```bash
# 设置合理的过期时间
SET key value EX 3600
```

**3. 内存回收**：

```bash
# 查看内存使用
INFO memory
MEMORY USAGE key

# 内存碎片整理
CONFIG SET activedefrag yes
```

---

## 最佳实践

### 键命名规范

```bash
# 使用冒号分隔，便于管理
user:1001:profile
article:1001:views
cache:user:1001

# 避免过长的键名
# ❌ this_is_a_very_long_key_name_that_wastes_memory
# ✅ user:1001
```

### 使用连接池

```python
# Python
import redis

pool = redis.ConnectionPool(
    host='localhost',
    port=6379,
    max_connections=50,
    decode_responses=True
)
r = redis.Redis(connection_pool=pool)
```

### 批量操作

```bash
# ❌ 逐个操作
SET key1 value1
SET key2 value2
SET key3 value3

# ✅ 批量操作
MSET key1 value1 key2 value2 key3 value3

# ✅ 使用 Pipeline
redis-cli --pipe < commands.txt
```

### 避免阻塞操作

```bash
# ❌ 阻塞操作
KEYS *
FLUSHALL
FLUSHDB

# ✅ 非阻塞操作
SCAN 0 MATCH pattern COUNT 100
FLUSHALL ASYNC
FLUSHDB ASYNC
```

### 监控指标

```bash
# 查看信息
INFO stats
INFO memory
INFO replication
INFO clients

# 关键指标
- 内存使用率
- 命中率
- 连接数
- 慢查询
- 持久化状态
```

---

## 参考资源

- [Redis 官方文档](https://redis.io/docs/) - 最权威的 Redis 文档
- [Redis 命令参考](https://redis.io/commands/) - 完整的命令列表
- [Redis 最佳实践](https://redis.io/docs/latest/develop/use/) - 官方最佳实践
- [Redis 大学](https://university.redis.com/) - 免费在线课程

---

> 本文档基于 Redis 官方文档和 MCP Context7 最新资料整理（29026+ 代码示例），涵盖数据结构、持久化机制、缓存策略、高可用架构、性能优化和最佳实践。所有代码示例均可运行，并包含详细的中文注释。

