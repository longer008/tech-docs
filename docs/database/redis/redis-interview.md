# Redis 面试题集

> Redis 核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. Redis 数据类型

```
┌─────────────────────────────────────────────────────────┐
│                    Redis 数据类型                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  String  - 字符串，最基本类型，最大 512MB                 │
│  Hash    - 哈希表，field-value 映射                      │
│  List    - 列表，有序可重复                               │
│  Set     - 集合，无序不重复                               │
│  ZSet    - 有序集合，带分数排序                          │
│                                                          │
│  Bitmap     - 位图，基于 String                          │
│  HyperLogLog - 基数统计                                  │
│  Geo        - 地理位置                                   │
│  Stream     - 消息队列（5.0+）                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

```bash
# String
SET key value [EX seconds] [NX|XX]
GET key
INCR key
DECR key
INCRBY key increment
APPEND key value
STRLEN key
MSET key1 value1 key2 value2
MGET key1 key2

# Hash
HSET key field value
HGET key field
HMSET key field1 value1 field2 value2
HMGET key field1 field2
HGETALL key
HDEL key field
HEXISTS key field
HINCRBY key field increment

# List
LPUSH key value1 value2
RPUSH key value1 value2
LPOP key
RPOP key
LRANGE key start stop
LINDEX key index
LLEN key
LREM key count value
BLPOP key timeout  # 阻塞弹出

# Set
SADD key member1 member2
SREM key member
SMEMBERS key
SISMEMBER key member
SCARD key
SINTER key1 key2      # 交集
SUNION key1 key2      # 并集
SDIFF key1 key2       # 差集

# ZSet
ZADD key score1 member1 score2 member2
ZREM key member
ZRANGE key start stop [WITHSCORES]
ZREVRANGE key start stop [WITHSCORES]
ZRANGEBYSCORE key min max
ZSCORE key member
ZCARD key
ZINCRBY key increment member
ZRANK key member      # 排名（升序）
ZREVRANK key member   # 排名（降序）
```

---

#### 2. 数据结构底层实现

| 类型 | 底层实现 |
|------|---------|
| String | SDS（Simple Dynamic String）|
| Hash | ziplist / hashtable |
| List | quicklist（ziplist + linkedlist）|
| Set | intset / hashtable |
| ZSet | ziplist / skiplist + hashtable |

**SDS 优势：**
- O(1) 获取长度
- 二进制安全
- 防止缓冲区溢出
- 空间预分配、惰性释放

**跳表（Skip List）：**
```
Level 3:  1 ──────────────────────────→ 9 ───→ NULL
Level 2:  1 ──────────→ 5 ──────────→ 9 ───→ NULL
Level 1:  1 ───→ 3 ───→ 5 ───→ 7 ───→ 9 ───→ NULL
```
- 查询/插入/删除 O(log n)
- 实现简单，比红黑树更易维护

---

#### 3. 缓存问题

**缓存穿透：**
```
查询不存在的数据，请求直接打到数据库

解决方案：
1. 缓存空值（设置短过期时间）
2. 布隆过滤器
```

```python
# 布隆过滤器示例
def get_user(user_id):
    # 1. 布隆过滤器判断
    if not bloom_filter.contains(user_id):
        return None

    # 2. 查缓存
    user = redis.get(f"user:{user_id}")
    if user:
        return user

    # 3. 查数据库
    user = db.get_user(user_id)
    if user:
        redis.setex(f"user:{user_id}", 3600, user)
    else:
        # 缓存空值
        redis.setex(f"user:{user_id}", 60, "NULL")

    return user
```

**缓存击穿：**
```
热点 key 过期，大量请求同时查询数据库

解决方案：
1. 互斥锁
2. 热点数据永不过期 + 异步更新
```

```python
# 互斥锁方案
def get_hot_data(key):
    data = redis.get(key)
    if data:
        return data

    # 尝试获取锁
    lock_key = f"lock:{key}"
    if redis.setnx(lock_key, 1):
        redis.expire(lock_key, 10)
        try:
            # 查询数据库
            data = db.query(key)
            redis.setex(key, 3600, data)
            return data
        finally:
            redis.delete(lock_key)
    else:
        # 等待重试
        time.sleep(0.1)
        return get_hot_data(key)
```

**缓存雪崩：**
```
大量 key 同时过期，请求涌入数据库

解决方案：
1. 过期时间加随机值
2. 多级缓存（本地 + Redis）
3. 限流降级
```

```python
# 过期时间加随机值
import random

def set_with_random_expire(key, value, base_expire=3600):
    expire = base_expire + random.randint(0, 300)
    redis.setex(key, expire, value)
```

---

#### 4. 过期策略与淘汰策略

**过期策略：**
```
1. 定时删除：创建定时器，到期自动删除（CPU 消耗大）
2. 惰性删除：访问时检查是否过期（内存消耗大）
3. 定期删除：周期性随机检查删除（折中方案）

Redis 采用：惰性删除 + 定期删除
```

**淘汰策略：**
```bash
# 配置
maxmemory 4gb
maxmemory-policy allkeys-lru
```

| 策略 | 说明 |
|------|------|
| noeviction | 不淘汰，内存满时报错（默认） |
| allkeys-lru | 所有 key 中 LRU 淘汰 |
| allkeys-lfu | 所有 key 中 LFU 淘汰（4.0+） |
| allkeys-random | 所有 key 随机淘汰 |
| volatile-lru | 设置过期的 key 中 LRU 淘汰 |
| volatile-lfu | 设置过期的 key 中 LFU 淘汰 |
| volatile-random | 设置过期的 key 随机淘汰 |
| volatile-ttl | 淘汰 TTL 最短的 key |

---

#### 5. 持久化机制

**RDB（Redis Database）：**
```bash
# 配置
save 900 1      # 900 秒内有 1 次修改
save 300 10     # 300 秒内有 10 次修改
save 60 10000   # 60 秒内有 10000 次修改

# 手动触发
SAVE      # 阻塞
BGSAVE    # 后台异步
```

**AOF（Append Only File）：**
```bash
# 配置
appendonly yes
appendfilename "appendonly.aof"

# 同步策略
appendfsync always    # 每次写入同步（最安全，最慢）
appendfsync everysec  # 每秒同步（推荐）
appendfsync no        # 由操作系统决定

# AOF 重写
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

| 特性 | RDB | AOF |
|------|-----|-----|
| 文件大小 | 小（压缩） | 大 |
| 恢复速度 | 快 | 慢 |
| 数据安全 | 可能丢失 | 较安全 |
| 写入影响 | fork 时阻塞 | 追加写入 |

**混合持久化（4.0+）：**
```bash
aof-use-rdb-preamble yes
# AOF 文件 = RDB 头 + AOF 增量
```

---

### 进阶题

#### 6. 分布式锁

```python
# SETNX 方式（简单但有问题）
# 问题：设置过期时间不是原子操作
redis.setnx("lock", 1)
redis.expire("lock", 10)

# SET NX EX（推荐）
# 原子操作，value 用于标识锁持有者
def acquire_lock(key, value, expire=10):
    return redis.set(key, value, nx=True, ex=expire)

def release_lock(key, value):
    # Lua 脚本保证原子性
    script = """
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    """
    return redis.eval(script, 1, key, value)

# 使用示例
import uuid

lock_key = "order:lock:123"
lock_value = str(uuid.uuid4())

if acquire_lock(lock_key, lock_value):
    try:
        # 执行业务逻辑
        process_order()
    finally:
        release_lock(lock_key, lock_value)
```

**Redlock 算法：**
```
1. 获取当前时间
2. 依次向 N 个 Redis 节点请求锁
3. 计算获取锁花费的时间
4. 超过半数节点获取成功，且耗时小于锁有效期，则成功
5. 失败则向所有节点释放锁
```

---

#### 7. 高可用架构

**主从复制：**
```bash
# 从节点配置
replicaof 192.168.1.100 6379
```

**哨兵模式：**
```bash
# sentinel.conf
sentinel monitor mymaster 192.168.1.100 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel failover-timeout mymaster 180000
```

**Cluster 模式：**
```
┌─────────────────────────────────────────────────────────┐
│                    Redis Cluster                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   16384 个槽位，分布在多个主节点                          │
│                                                          │
│   Node1 (Master)     Node2 (Master)    Node3 (Master)   │
│   Slots: 0-5460      Slots: 5461-10922 Slots: 10923-16383│
│       │                  │                 │             │
│   Node1 (Slave)      Node2 (Slave)     Node3 (Slave)    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "Redis 是单线程的" | 6.0 后网络 I/O 多线程，命令执行仍是单线程 |
| "KEYS * 没问题" | KEYS 会阻塞，生产环境用 SCAN |
| "分布式锁用 SETNX 就行" | 需要考虑过期时间、锁续期、释放验证 |
| "RDB 完全无数据丢失" | RDB 有数据丢失风险，AOF 更安全 |
| "Redis 天然支持事务" | Redis 事务不支持回滚 |

---

## B. 实战文档

### 常用场景

```python
# 1. 缓存
redis.setex("user:1", 3600, json.dumps(user))

# 2. 计数器
redis.incr("page:views:123")

# 3. 排行榜
redis.zadd("ranking", {user_id: score})
redis.zrevrange("ranking", 0, 9, withscores=True)

# 4. 分布式 Session
redis.setex(f"session:{session_id}", 1800, json.dumps(user_data))

# 5. 限流
def is_rate_limited(user_id, limit=100, window=60):
    key = f"rate:{user_id}"
    current = redis.incr(key)
    if current == 1:
        redis.expire(key, window)
    return current > limit

# 6. 消息队列（简单场景）
# 生产者
redis.lpush("queue:tasks", json.dumps(task))
# 消费者
task = redis.brpop("queue:tasks", timeout=30)
```

### 性能优化

```bash
# 使用 Pipeline
pipe = redis.pipeline()
for i in range(1000):
    pipe.set(f"key:{i}", f"value:{i}")
pipe.execute()

# 使用 SCAN 代替 KEYS
cursor = 0
while True:
    cursor, keys = redis.scan(cursor, match="user:*", count=100)
    process(keys)
    if cursor == 0:
        break
```
