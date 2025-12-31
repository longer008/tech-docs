# Redis 速查手册

> Redis 常用命令速查

## 通用命令

```bash
# 键操作
KEYS pattern          # 查找匹配的 key（生产慎用）
SCAN cursor [MATCH pattern] [COUNT count]  # 增量遍历
EXISTS key [key ...]  # 检查 key 是否存在
TYPE key              # 返回 key 类型
DEL key [key ...]     # 删除 key
UNLINK key [key ...]  # 异步删除 key
RENAME key newkey     # 重命名 key
EXPIRE key seconds    # 设置过期时间（秒）
PEXPIRE key ms        # 设置过期时间（毫秒）
EXPIREAT key timestamp # 设置过期时间点
TTL key               # 剩余过期时间（秒）
PTTL key              # 剩余过期时间（毫秒）
PERSIST key           # 移除过期时间
DUMP key              # 序列化 key
RESTORE key ttl value # 反序列化

# 数据库
SELECT db             # 切换数据库（0-15）
DBSIZE                # 当前库 key 数量
FLUSHDB [ASYNC]       # 清空当前库
FLUSHALL [ASYNC]      # 清空所有库
```

## String 类型

```bash
SET key value [EX seconds] [PX ms] [NX|XX]
GET key
GETEX key [EX seconds|PX ms|EXAT timestamp|PXAT timestamp|PERSIST]
GETDEL key            # 获取并删除
SETNX key value       # key 不存在时设置
SETEX key seconds value
PSETEX key ms value
MSET key value [key value ...]
MGET key [key ...]
MSETNX key value [key value ...]  # 全部不存在时设置
APPEND key value      # 追加
STRLEN key            # 字符串长度
GETRANGE key start end
SETRANGE key offset value

# 数值操作
INCR key
DECR key
INCRBY key increment
DECRBY key decrement
INCRBYFLOAT key increment

# 位操作
SETBIT key offset value
GETBIT key offset
BITCOUNT key [start end]
BITOP operation destkey key [key ...]
BITPOS key bit [start [end]]
```

## Hash 类型

```bash
HSET key field value [field value ...]
HGET key field
HMSET key field value [field value ...]
HMGET key field [field ...]
HGETALL key
HDEL key field [field ...]
HEXISTS key field
HKEYS key
HVALS key
HLEN key
HSETNX key field value
HINCRBY key field increment
HINCRBYFLOAT key field increment
HSCAN key cursor [MATCH pattern] [COUNT count]
```

## List 类型

```bash
LPUSH key element [element ...]
RPUSH key element [element ...]
LPUSHX key element    # key 存在时推入
RPUSHX key element
LPOP key [count]
RPOP key [count]
LRANGE key start stop
LINDEX key index
LSET key index element
LLEN key
LINSERT key BEFORE|AFTER pivot element
LREM key count element
LTRIM key start stop
LPOS key element [RANK rank] [COUNT count] [MAXLEN len]

# 阻塞操作
BLPOP key [key ...] timeout
BRPOP key [key ...] timeout
BRPOPLPUSH source destination timeout
LMOVE source destination LEFT|RIGHT LEFT|RIGHT
BLMOVE source destination LEFT|RIGHT LEFT|RIGHT timeout
```

## Set 类型

```bash
SADD key member [member ...]
SREM key member [member ...]
SMEMBERS key
SISMEMBER key member
SMISMEMBER key member [member ...]
SCARD key
SPOP key [count]
SRANDMEMBER key [count]
SMOVE source destination member
SSCAN key cursor [MATCH pattern] [COUNT count]

# 集合运算
SINTER key [key ...]        # 交集
SINTERSTORE destination key [key ...]
SUNION key [key ...]        # 并集
SUNIONSTORE destination key [key ...]
SDIFF key [key ...]         # 差集
SDIFFSTORE destination key [key ...]
```

## Sorted Set 类型

```bash
ZADD key [NX|XX] [GT|LT] [CH] [INCR] score member [score member ...]
ZREM key member [member ...]
ZSCORE key member
ZRANK key member          # 升序排名
ZREVRANK key member       # 降序排名
ZCARD key
ZCOUNT key min max
ZINCRBY key increment member
ZRANGE key start stop [BYSCORE|BYLEX] [REV] [LIMIT offset count] [WITHSCORES]
ZREVRANGE key start stop [WITHSCORES]
ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]
ZRANGEBYLEX key min max [LIMIT offset count]
ZREMRANGEBYRANK key start stop
ZREMRANGEBYSCORE key min max
ZREMRANGEBYLEX key min max
ZPOPMIN key [count]
ZPOPMAX key [count]
BZPOPMIN key [key ...] timeout
BZPOPMAX key [key ...] timeout
ZSCAN key cursor [MATCH pattern] [COUNT count]

# 集合运算
ZUNIONSTORE destination numkeys key [key ...] [WEIGHTS weight] [AGGREGATE SUM|MIN|MAX]
ZINTERSTORE destination numkeys key [key ...] [WEIGHTS weight] [AGGREGATE SUM|MIN|MAX]
```

## 发布订阅

```bash
SUBSCRIBE channel [channel ...]
UNSUBSCRIBE [channel [channel ...]]
PSUBSCRIBE pattern [pattern ...]
PUNSUBSCRIBE [pattern [pattern ...]]
PUBLISH channel message
PUBSUB CHANNELS [pattern]
PUBSUB NUMSUB [channel [channel ...]]
PUBSUB NUMPAT
```

## 事务

```bash
MULTI                 # 开始事务
EXEC                  # 执行事务
DISCARD               # 取消事务
WATCH key [key ...]   # 监视 key
UNWATCH               # 取消监视
```

## Lua 脚本

```bash
EVAL script numkeys key [key ...] arg [arg ...]
EVALSHA sha1 numkeys key [key ...] arg [arg ...]
SCRIPT LOAD script
SCRIPT EXISTS sha1 [sha1 ...]
SCRIPT FLUSH
SCRIPT KILL
```

## 服务器命令

```bash
# 信息与统计
INFO [section]
DEBUG OBJECT key
MEMORY USAGE key
MEMORY STATS
CLIENT LIST
CLIENT GETNAME
CLIENT SETNAME name
CLIENT KILL [ID id] [TYPE type] [ADDR addr]

# 配置
CONFIG GET parameter
CONFIG SET parameter value
CONFIG REWRITE
CONFIG RESETSTAT

# 持久化
BGSAVE
BGREWRITEAOF
LASTSAVE

# 复制
REPLICAOF host port
REPLICAOF NO ONE

# 集群
CLUSTER INFO
CLUSTER NODES
CLUSTER SLOTS
CLUSTER KEYSLOT key
CLUSTER COUNTKEYSINSLOT slot
CLUSTER GETKEYSINSLOT slot count
CLUSTER FAILOVER [FORCE|TAKEOVER]

# 慢查询
SLOWLOG GET [count]
SLOWLOG LEN
SLOWLOG RESET

# 其他
PING [message]
ECHO message
TIME
SHUTDOWN [NOSAVE|SAVE]
DEBUG SLEEP seconds
```

## 常用配置

```bash
# redis.conf 关键配置

# 网络
bind 127.0.0.1
port 6379
timeout 0
tcp-keepalive 300

# 安全
requirepass password
rename-command FLUSHALL ""

# 内存
maxmemory 4gb
maxmemory-policy allkeys-lru

# 持久化
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

# 复制
replicaof <masterip> <masterport>
masterauth <password>
replica-read-only yes

# 集群
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000

# 日志
loglevel notice
logfile /var/log/redis/redis.log
slowlog-log-slower-than 10000
slowlog-max-len 128
```

## 连接示例

```python
# Python (redis-py)
import redis

# 单机
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# 连接池
pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
r = redis.Redis(connection_pool=pool)

# 哨兵
from redis.sentinel import Sentinel
sentinel = Sentinel([('localhost', 26379)], socket_timeout=0.1)
master = sentinel.master_for('mymaster', socket_timeout=0.1)
slave = sentinel.slave_for('mymaster', socket_timeout=0.1)

# 集群
from redis.cluster import RedisCluster
rc = RedisCluster(host='localhost', port=6379)
```

```javascript
// Node.js (ioredis)
const Redis = require('ioredis');

// 单机
const redis = new Redis({ host: 'localhost', port: 6379 });

// 哨兵
const redis = new Redis({
  sentinels: [{ host: 'localhost', port: 26379 }],
  name: 'mymaster'
});

// 集群
const Redis = require('ioredis');
const cluster = new Redis.Cluster([
  { port: 6379, host: '127.0.0.1' },
  { port: 6380, host: '127.0.0.1' }
]);
```
