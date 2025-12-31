# Redis 集群面试题集

> Redis 高可用与集群核心知识点

## A. 面试宝典

### 1. 主从复制

```
┌─────────────────────────────────────────────────────────┐
│                    主从复制架构                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│         ┌─────────────┐                                 │
│         │   Master    │ ← 写操作                        │
│         │  (主节点)   │                                 │
│         └──────┬──────┘                                 │
│           ┌────┴────┐                                   │
│           ▼         ▼                                   │
│   ┌───────────┐ ┌───────────┐                          │
│   │  Slave1   │ │  Slave2   │ ← 读操作                 │
│   │ (从节点)  │ │ (从节点)  │                          │
│   └───────────┘ └───────────┘                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**复制流程：**
```
1. 从节点发送 PSYNC 命令
2. 主节点判断是否全量复制
   - 首次连接：全量复制（BGSAVE + 缓冲区）
   - 断线重连：增量复制（根据 offset）
3. 主节点发送 RDB 文件和缓冲区数据
4. 从节点加载数据
5. 主节点持续发送写命令
```

```bash
# 从节点配置
replicaof 192.168.1.100 6379

# 查看复制信息
INFO replication

# 复制相关配置
replica-read-only yes              # 从节点只读
repl-diskless-sync no             # 是否无盘复制
repl-backlog-size 1mb             # 复制积压缓冲区大小
min-replicas-to-write 1           # 最少从节点数量
min-replicas-max-lag 10           # 从节点最大延迟
```

---

### 2. 哨兵模式 (Sentinel)

```
┌─────────────────────────────────────────────────────────┐
│                    哨兵模式架构                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌───────────┐ ┌───────────┐ ┌───────────┐            │
│   │ Sentinel1 │ │ Sentinel2 │ │ Sentinel3 │            │
│   └─────┬─────┘ └─────┬─────┘ └─────┬─────┘            │
│         │             │             │                   │
│         └──────┬──────┴──────┬──────┘                   │
│                │             │                          │
│         ┌──────▼──────┐      │                          │
│         │   Master    │◄─────┘                          │
│         └──────┬──────┘                                 │
│           ┌────┴────┐                                   │
│           ▼         ▼                                   │
│   ┌───────────┐ ┌───────────┐                          │
│   │  Slave1   │ │  Slave2   │                          │
│   └───────────┘ └───────────┘                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**哨兵功能：**
- 监控（Monitoring）：检查主从节点是否正常
- 通知（Notification）：发送故障通知
- 自动故障转移（Automatic Failover）：主节点故障时自动切换
- 配置提供者（Configuration Provider）：提供主节点地址

```bash
# sentinel.conf
port 26379
sentinel monitor mymaster 192.168.1.100 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 180000
sentinel auth-pass mymaster password

# 启动哨兵
redis-sentinel /path/to/sentinel.conf
# 或
redis-server /path/to/sentinel.conf --sentinel
```

**故障检测：**
```
主观下线 (SDOWN)：单个哨兵认为节点下线
客观下线 (ODOWN)：超过 quorum 个哨兵认为节点下线

故障转移流程：
1. 哨兵选举领导者（Raft 算法）
2. 领导者选择新主节点
   - 过滤不健康的从节点
   - 优先级高的优先
   - 复制偏移量大的优先
   - runid 小的优先
3. 执行故障转移
4. 更新配置
```

---

### 3. Cluster 模式

```
┌─────────────────────────────────────────────────────────┐
│                    Cluster 架构                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   16384 slots 分布在多个主节点                           │
│                                                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │  Node1    │  Node2    │  Node3    │  Node4    │   │
│   │  Master   │  Master   │  Master   │  Master   │   │
│   │ 0-4095    │ 4096-8191 │ 8192-12287│12288-16383│   │
│   └─────┬─────┴─────┬─────┴─────┬─────┴─────┬─────┘   │
│         │           │           │           │          │
│   ┌─────▼─────┬─────▼─────┬─────▼─────┬─────▼─────┐   │
│   │  Node1    │  Node2    │  Node3    │  Node4    │   │
│   │  Slave    │  Slave    │  Slave    │  Slave    │   │
│   └───────────┴───────────┴───────────┴───────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**数据分片：**
```python
# CRC16 算法计算槽位
slot = CRC16(key) % 16384

# Hash Tag（指定 key 的槽位）
# {user}:1 和 {user}:2 会分配到同一个槽位
SET {user}:1 value1
SET {user}:2 value2
```

**集群搭建：**
```bash
# 创建集群
redis-cli --cluster create \
    192.168.1.1:6379 192.168.1.2:6379 192.168.1.3:6379 \
    192.168.1.4:6379 192.168.1.5:6379 192.168.1.6:6379 \
    --cluster-replicas 1

# 集群配置
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
cluster-require-full-coverage no

# 集群命令
CLUSTER INFO                    # 集群信息
CLUSTER NODES                   # 节点信息
CLUSTER SLOTS                   # 槽位分布
CLUSTER KEYSLOT key             # 查询 key 的槽位
```

**集群限制：**
- 不支持多 key 操作（除非 key 在同一槽位）
- 不支持数据库切换（只有 db0）
- 事务只支持同槽位 key
- Lua 脚本只支持同槽位 key

---

### 4. 数据迁移与扩容

```bash
# 添加节点
redis-cli --cluster add-node new_host:new_port existing_host:existing_port

# 添加从节点
redis-cli --cluster add-node new_host:new_port existing_host:existing_port \
    --cluster-slave --cluster-master-id <master-id>

# 迁移槽位
redis-cli --cluster reshard host:port

# 删除节点
redis-cli --cluster del-node host:port node-id

# 重新平衡槽位
redis-cli --cluster rebalance host:port
```

**在线迁移流程：**
```
1. 目标节点设置导入状态：CLUSTER SETSLOT <slot> IMPORTING <source-node-id>
2. 源节点设置迁出状态：CLUSTER SETSLOT <slot> MIGRATING <target-node-id>
3. 获取槽位中的 key：CLUSTER GETKEYSINSLOT <slot> <count>
4. 迁移 key：MIGRATE target_host target_port key db timeout
5. 更新槽位归属：CLUSTER SETSLOT <slot> NODE <target-node-id>
```

---

### 5. 客户端路由

**MOVED 重定向：**
```
Client → Node1: GET user:1
Node1 → Client: MOVED 1234 192.168.1.2:6379
Client → Node2: GET user:1
Node2 → Client: value
```

**ASK 重定向：**
```
# 槽位正在迁移中
Client → Node1: GET user:1
Node1 → Client: ASK 1234 192.168.1.2:6379
Client → Node2: ASKING
Client → Node2: GET user:1
Node2 → Client: value
```

**Smart Client：**
```python
# 使用 redis-py-cluster
from rediscluster import RedisCluster

startup_nodes = [
    {"host": "192.168.1.1", "port": 6379},
    {"host": "192.168.1.2", "port": 6379},
    {"host": "192.168.1.3", "port": 6379},
]

rc = RedisCluster(startup_nodes=startup_nodes, decode_responses=True)
rc.set("key", "value")
```

---

## B. 实战文档

### 架构选型

| 模式 | 数据量 | 可用性 | 复杂度 | 适用场景 |
|------|--------|--------|--------|---------|
| 单机 | 小 | 低 | 低 | 开发测试 |
| 主从 | 中 | 中 | 低 | 读多写少 |
| 哨兵 | 中 | 高 | 中 | 需要自动故障转移 |
| Cluster | 大 | 高 | 高 | 大数据量、高并发 |

### 监控指标

```bash
# 关键指标
INFO memory           # 内存使用
INFO stats            # 命令统计
INFO replication      # 复制状态
INFO clients          # 客户端连接
INFO cluster          # 集群状态

# 慢查询日志
SLOWLOG GET 10
SLOWLOG LEN
SLOWLOG RESET

# 监控命令
MONITOR               # 实时命令监控（生产慎用）
CLIENT LIST           # 客户端列表
DEBUG SLEEP 0.1       # 测试阻塞
```

### 运维命令

```bash
# 手动故障转移
CLUSTER FAILOVER

# 强制故障转移
CLUSTER FAILOVER FORCE

# 节点忘记
CLUSTER FORGET <node-id>

# 重置集群
CLUSTER RESET [HARD|SOFT]

# 设置配置纪元
CLUSTER SET-CONFIG-EPOCH <epoch>

# 修复集群
redis-cli --cluster fix host:port
redis-cli --cluster check host:port
```
