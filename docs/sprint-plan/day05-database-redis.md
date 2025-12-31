# Day 5: 数据库索引和事务

> 第五天重点：MySQL 索引原理、事务隔离级别、Redis 缓存

## 今日目标

- [ ] 掌握 B+ 树索引原理
- [ ] 理解索引失效场景
- [ ] 熟悉事务 ACID 和隔离级别
- [ ] 掌握 MVCC 原理
- [ ] 理解 Redis 数据结构和缓存策略

---

## Part A: MySQL 索引

### 1. 索引原理

#### Q1: 为什么 MySQL 使用 B+ 树而不是 B 树或红黑树？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    B+ 树 vs 其他数据结构                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  B+ 树特点：                                                │
│  ├── 非叶子节点只存索引，不存数据                           │
│  ├── 所有数据都在叶子节点                                   │
│  ├── 叶子节点形成双向链表                                   │
│  └── 树高度低（3-4 层可存千万级数据）                       │
│                                                              │
│  为什么不用 B 树：                                          │
│  1. B 树的每个节点都存数据，扇出度低                        │
│  2. 范围查询需要中序遍历，效率低                            │
│  3. B+ 树叶子节点链表，范围查询高效                         │
│                                                              │
│  为什么不用红黑树：                                          │
│  1. 红黑树是二叉树，高度太高                                │
│  2. 磁盘 I/O 次数 = 树高度                                  │
│  3. 1000万数据：红黑树高度约24，B+树高度约3                 │
│                                                              │
│  为什么不用 Hash：                                          │
│  1. 不支持范围查询                                          │
│  2. 不支持排序                                              │
│  3. 存在哈希冲突                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**B+ 树结构：**
```
                    [15 | 28]                    非叶子节点（索引）
                   /    |    \
            [5|10]    [20|25]    [30|35]         非叶子节点
           /  |  \   /   |  \   /   |  \
         [1,3,5] → [10,12] → [20,22,25] → [30,35,40]  叶子节点（数据+链表）
```

---

#### Q2: 聚簇索引和非聚簇索引的区别？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    索引类型                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  聚簇索引（Clustered Index）：                              │
│  ├── 主键索引                                               │
│  ├── 叶子节点存储完整行数据                                 │
│  ├── 一个表只能有一个                                       │
│  └── InnoDB 必须有聚簇索引                                  │
│      - 有主键则使用主键                                     │
│      - 无主键则使用第一个唯一非空索引                       │
│      - 都没有则生成隐藏的 rowid                             │
│                                                              │
│  非聚簇索引（Secondary Index）：                            │
│  ├── 二级索引/辅助索引                                      │
│  ├── 叶子节点存储主键值                                     │
│  ├── 需要回表查询                                           │
│  └── 一个表可以有多个                                       │
│                                                              │
│  查询过程：                                                  │
│  SELECT * FROM user WHERE name = 'Alice';                   │
│  1. 在 name 索引中找到 name='Alice' 对应的主键 id=5         │
│  2. 回表：用 id=5 在聚簇索引中查找完整数据                  │
│                                                              │
│  覆盖索引（避免回表）：                                     │
│  SELECT id, name FROM user WHERE name = 'Alice';            │
│  如果 (name, id) 是联合索引，直接在索引中获取数据           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### Q3: 什么情况下索引会失效？

**答案：**
```sql
-- 创建联合索引
CREATE INDEX idx_abc ON table (a, b, c);

-- 1. 不满足最左前缀原则
SELECT * FROM table WHERE b = 1;         -- 失效
SELECT * FROM table WHERE b = 1 AND c = 2;  -- 失效
SELECT * FROM table WHERE a = 1 AND c = 2;  -- 部分使用（只用 a）

-- 2. 对索引列使用函数或运算
SELECT * FROM table WHERE YEAR(create_time) = 2024;  -- 失效
SELECT * FROM table WHERE id + 1 = 5;                 -- 失效
-- 改为：
SELECT * FROM table WHERE create_time >= '2024-01-01';

-- 3. 类型不匹配（隐式转换）
-- phone 是 varchar 类型
SELECT * FROM table WHERE phone = 13800138000;  -- 失效
-- 改为：
SELECT * FROM table WHERE phone = '13800138000';

-- 4. 使用 OR 连接非索引列
SELECT * FROM table WHERE a = 1 OR d = 2;  -- 失效

-- 5. LIKE 左模糊
SELECT * FROM table WHERE name LIKE '%abc';    -- 失效
SELECT * FROM table WHERE name LIKE 'abc%';    -- 有效

-- 6. IS NULL 可能失效（取决于数据分布）
SELECT * FROM table WHERE a IS NULL;

-- 7. NOT IN、NOT EXISTS、!=、<>
-- 可能导致全表扫描

-- 8. 范围查询后的列失效
SELECT * FROM table WHERE a = 1 AND b > 2 AND c = 3;
-- a 和 b 使用索引，c 失效
```

---

#### Q4: 如何优化慢查询？

**答案：**
```sql
-- 1. 使用 EXPLAIN 分析
EXPLAIN SELECT * FROM users WHERE name = 'Alice';

/*
重要字段：
- type: 访问类型（从好到差）
  system > const > eq_ref > ref > range > index > ALL

- key: 实际使用的索引
- rows: 扫描行数
- Extra:
  - Using index: 覆盖索引
  - Using where: 需要回表过滤
  - Using filesort: 需要额外排序
  - Using temporary: 使用临时表
*/

-- 2. 优化策略
-- 添加合适的索引
CREATE INDEX idx_name ON users(name);

-- 使用覆盖索引避免回表
SELECT id, name FROM users WHERE name = 'Alice';

-- 避免 SELECT *
SELECT id, name, email FROM users WHERE id = 1;

-- 分页优化
-- 不好
SELECT * FROM users LIMIT 1000000, 10;
-- 好：延迟关联
SELECT * FROM users u
JOIN (SELECT id FROM users LIMIT 1000000, 10) t
ON u.id = t.id;
-- 或使用游标分页
SELECT * FROM users WHERE id > last_id LIMIT 10;

-- 3. 索引设计原则
-- 选择区分度高的列
-- 联合索引把常用的列放前面
-- 避免冗余索引
```

---

## Part B: MySQL 事务

### 1. 事务基础

#### Q5: 事务的 ACID 特性是什么？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    ACID 特性                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  A - 原子性（Atomicity）                                    │
│  ├── 事务是不可分割的最小单位                               │
│  ├── 要么全部成功，要么全部失败                             │
│  └── 通过 undo log 实现回滚                                 │
│                                                              │
│  C - 一致性（Consistency）                                  │
│  ├── 事务执行前后，数据保持一致状态                         │
│  ├── 如：转账前后总金额不变                                 │
│  └── 是事务的最终目标，AID 是手段                           │
│                                                              │
│  I - 隔离性（Isolation）                                    │
│  ├── 并发事务之间相互隔离                                   │
│  ├── 一个事务的中间状态对其他事务不可见                     │
│  └── 通过锁和 MVCC 实现                                     │
│                                                              │
│  D - 持久性（Durability）                                   │
│  ├── 事务提交后，修改永久保存                               │
│  └── 通过 redo log 实现                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### Q6: 事务隔离级别有哪些？各解决什么问题？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    事务隔离级别                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  并发问题：                                                  │
│                                                              │
│  脏读（Dirty Read）：                                       │
│  读取到其他事务未提交的数据                                  │
│                                                              │
│  不可重复读（Non-Repeatable Read）：                        │
│  同一事务内，两次读取同一数据结果不同（被其他事务修改）      │
│                                                              │
│  幻读（Phantom Read）：                                      │
│  同一事务内，两次查询结果集不同（被其他事务插入/删除）       │
│                                                              │
│  隔离级别：                                                  │
│  ──────────────────────────────────────────────────────────│
│  级别              脏读    不可重复读    幻读                │
│  ──────────────────────────────────────────────────────────│
│  READ UNCOMMITTED  可能    可能          可能               │
│  READ COMMITTED    防止    可能          可能               │
│  REPEATABLE READ   防止    防止          可能*              │
│  SERIALIZABLE      防止    防止          防止               │
│                                                              │
│  * MySQL InnoDB 的 REPEATABLE READ 通过 MVCC + 间隙锁       │
│    在很大程度上避免了幻读                                    │
│                                                              │
│  MySQL 默认：REPEATABLE READ                                │
│  Oracle 默认：READ COMMITTED                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### Q7: MVCC 是什么？如何实现？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    MVCC 原理                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  MVCC（Multi-Version Concurrency Control）：                │
│  多版本并发控制，通过保存数据的多个版本实现非阻塞读         │
│                                                              │
│  实现机制：                                                  │
│                                                              │
│  1. 隐藏列                                                  │
│     - DB_TRX_ID: 最后修改该行的事务 ID                      │
│     - DB_ROLL_PTR: 指向 undo log 的指针                     │
│     - DB_ROW_ID: 隐藏主键                                   │
│                                                              │
│  2. Undo Log                                                │
│     - 保存数据的历史版本                                    │
│     - 形成版本链                                            │
│                                                              │
│  3. Read View（快照）                                       │
│     - m_ids: 活跃事务 ID 列表                               │
│     - min_trx_id: 最小活跃事务 ID                           │
│     - max_trx_id: 下一个事务 ID                             │
│     - creator_trx_id: 创建该 ReadView 的事务 ID             │
│                                                              │
│  可见性判断：                                                │
│  1. trx_id == creator_trx_id → 可见（自己修改的）           │
│  2. trx_id < min_trx_id → 可见（已提交）                    │
│  3. trx_id >= max_trx_id → 不可见（未来事务）               │
│  4. trx_id in m_ids → 不可见（未提交）                      │
│  5. 其他 → 可见                                             │
│                                                              │
│  RC vs RR 的区别：                                          │
│  - RC: 每次 SELECT 都创建新的 ReadView                      │
│  - RR: 只在第一次 SELECT 创建 ReadView                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### Q8: MySQL 有哪些锁？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    MySQL 锁分类                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  按粒度分：                                                  │
│  ├── 表锁：锁整张表，开销小，并发低                         │
│  ├── 行锁：锁单行，开销大，并发高                           │
│  └── 间隙锁：锁一个范围，防止幻读                           │
│                                                              │
│  按类型分：                                                  │
│  ├── 共享锁（S 锁）：读锁，多个事务可同时持有               │
│  │   SELECT ... LOCK IN SHARE MODE                          │
│  │                                                          │
│  └── 排他锁（X 锁）：写锁，独占                             │
│      SELECT ... FOR UPDATE                                  │
│      INSERT / UPDATE / DELETE                               │
│                                                              │
│  InnoDB 行锁类型：                                          │
│  ├── 记录锁（Record Lock）：锁定一行                        │
│  ├── 间隙锁（Gap Lock）：锁定一个范围（不含记录）           │
│  └── 临键锁（Next-Key Lock）：记录锁 + 间隙锁               │
│                                                              │
│  意向锁：                                                    │
│  ├── 意向共享锁（IS）：准备加行级 S 锁                      │
│  └── 意向排他锁（IX）：准备加行级 X 锁                      │
│  用于快速判断表中是否有行锁                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**死锁示例：**
```sql
-- 事务 A
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- 持有 id=1 的锁

-- 事务 B
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 2;
-- 持有 id=2 的锁

-- 事务 A
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
-- 等待 id=2 的锁

-- 事务 B
UPDATE accounts SET balance = balance + 100 WHERE id = 1;
-- 等待 id=1 的锁
-- 死锁！

-- 预防：按固定顺序访问资源
```

---

## Part C: Redis

### 1. 数据结构

#### Q9: Redis 有哪些数据类型及应用场景？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    Redis 数据类型                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  String（字符串）：                                         │
│  - 缓存、计数器、分布式锁                                   │
│  SET key value                                              │
│  INCR counter                                               │
│  SETNX lock value  # 分布式锁                               │
│                                                              │
│  Hash（哈希）：                                             │
│  - 对象存储                                                 │
│  HSET user:1 name "Alice" age 25                            │
│  HGET user:1 name                                           │
│  HGETALL user:1                                             │
│                                                              │
│  List（列表）：                                             │
│  - 消息队列、最新列表                                       │
│  LPUSH news:latest article1                                 │
│  RPOP queue                                                 │
│  LRANGE news:latest 0 9                                     │
│                                                              │
│  Set（集合）：                                              │
│  - 去重、交集并集（共同好友）                               │
│  SADD tags:article1 tech redis                              │
│  SINTER user1:friends user2:friends                         │
│                                                              │
│  ZSet（有序集合）：                                         │
│  - 排行榜、延迟队列                                         │
│  ZADD leaderboard 100 user1                                 │
│  ZREVRANGE leaderboard 0 9 WITHSCORES                       │
│                                                              │
│  其他类型：                                                  │
│  - Bitmap：签到、在线状态                                   │
│  - HyperLogLog：UV 统计                                     │
│  - Geo：地理位置                                            │
│  - Stream：消息队列（5.0+）                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. 缓存问题

#### Q10: 缓存穿透、击穿、雪崩是什么？如何解决？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    缓存问题                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  缓存穿透：                                                  │
│  - 查询不存在的数据，每次都穿透到数据库                     │
│  - 解决方案：                                               │
│    1. 缓存空值（设置短过期时间）                            │
│    2. 布隆过滤器（过滤不存在的 key）                        │
│    3. 接口限流                                              │
│                                                              │
│  缓存击穿：                                                  │
│  - 热点 key 过期瞬间，大量请求直接打到数据库                │
│  - 解决方案：                                               │
│    1. 热点 key 永不过期                                     │
│    2. 互斥锁（只允许一个线程重建缓存）                      │
│    3. 逻辑过期（后台异步更新）                              │
│                                                              │
│  缓存雪崩：                                                  │
│  - 大量 key 同时过期，或 Redis 宕机                         │
│  - 解决方案：                                               │
│    1. 过期时间加随机值，分散过期                            │
│    2. 多级缓存（本地缓存 + Redis）                          │
│    3. Redis 集群高可用                                      │
│    4. 限流降级                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**互斥锁解决缓存击穿：**
```javascript
async function getWithLock(key) {
  let data = await redis.get(key);
  if (data) return JSON.parse(data);

  // 尝试获取锁
  const lockKey = `lock:${key}`;
  const locked = await redis.set(lockKey, 1, 'NX', 'EX', 10);

  if (locked) {
    try {
      // 双重检查
      data = await redis.get(key);
      if (data) return JSON.parse(data);

      // 查询数据库
      data = await db.query(key);

      // 写入缓存
      await redis.set(key, JSON.stringify(data), 'EX', 3600);
      return data;
    } finally {
      await redis.del(lockKey);
    }
  } else {
    // 等待重试
    await sleep(100);
    return getWithLock(key);
  }
}
```

---

### 3. 持久化

#### Q11: Redis 持久化机制有哪些？

**答案：**
```
┌─────────────────────────────────────────────────────────────┐
│                    Redis 持久化                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  RDB（Redis Database）：                                    │
│  ├── 定时生成数据快照                                       │
│  ├── 二进制文件，恢复速度快                                 │
│  ├── 可能丢失最后一次快照后的数据                           │
│  └── 配置：save 900 1  # 900秒内有1次修改则保存            │
│                                                              │
│  AOF（Append Only File）：                                  │
│  ├── 记录每个写命令                                         │
│  ├── 文本文件，可读性好                                     │
│  ├── 数据安全性高                                           │
│  ├── 文件体积大，恢复慢                                     │
│  └── 策略：                                                 │
│      - always: 每次写入都同步（最安全，最慢）               │
│      - everysec: 每秒同步（推荐）                           │
│      - no: 由系统决定（最快，不安全）                       │
│                                                              │
│  混合持久化（4.0+）：                                        │
│  ├── RDB + AOF 结合                                         │
│  ├── 重写时先写 RDB，再追加 AOF                             │
│  └── 兼顾恢复速度和数据安全                                 │
│                                                              │
│  选择建议：                                                  │
│  - 允许分钟级丢失：RDB                                      │
│  - 要求高数据安全：AOF（everysec）                          │
│  - 推荐：混合持久化                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

#### Q12: Redis 如何实现分布式锁？

**答案：**
```javascript
// 基本实现
async function acquireLock(lockKey, value, expireTime) {
  // SET key value NX EX seconds
  const result = await redis.set(lockKey, value, 'NX', 'EX', expireTime);
  return result === 'OK';
}

async function releaseLock(lockKey, value) {
  // Lua 脚本保证原子性
  const script = `
    if redis.call('get', KEYS[1]) == ARGV[1] then
      return redis.call('del', KEYS[1])
    else
      return 0
    end
  `;
  return await redis.eval(script, 1, lockKey, value);
}

// 使用示例
async function doWithLock() {
  const lockKey = 'lock:resource';
  const value = uuid();  // 唯一标识

  try {
    if (await acquireLock(lockKey, value, 30)) {
      // 执行业务逻辑
      await doBusiness();
    }
  } finally {
    await releaseLock(lockKey, value);
  }
}

// 问题：
// 1. 锁过期但业务未完成 → 看门狗续期（Redisson）
// 2. 主从切换锁丢失 → RedLock 算法
```

---

## 复习检查清单

- [ ] 理解 B+ 树为什么适合做索引
- [ ] 掌握索引失效的常见场景
- [ ] 能解释 ACID 特性
- [ ] 理解四种隔离级别及解决的问题
- [ ] 能解释 MVCC 原理
- [ ] 掌握 Redis 数据类型和应用场景
- [ ] 理解缓存穿透、击穿、雪崩及解决方案
- [ ] 掌握 Redis 持久化机制

---

> 明日预告：Day 6 - 设计模式
