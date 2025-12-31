# MySQL 优化面试题集

> MySQL 性能优化核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. SQL 优化原则

```sql
-- 1. 只查询需要的列
-- Bad
SELECT * FROM users WHERE id = 1;
-- Good
SELECT id, name, email FROM users WHERE id = 1;

-- 2. 避免 SELECT DISTINCT（消耗大）
-- Bad
SELECT DISTINCT department FROM employees;
-- Good
SELECT department FROM employees GROUP BY department;

-- 3. 用 EXISTS 替代 IN（子查询大时）
-- Bad
SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 1);
-- Good
SELECT * FROM orders o WHERE EXISTS (
    SELECT 1 FROM users u WHERE u.id = o.user_id AND u.status = 1
);

-- 4. 小表驱动大表
-- Bad（大表驱动小表）
SELECT * FROM big_table b LEFT JOIN small_table s ON b.id = s.bid;
-- Good（小表驱动大表）
SELECT * FROM small_table s LEFT JOIN big_table b ON s.bid = b.id;

-- 5. 避免 OR，用 UNION ALL
-- Bad
SELECT * FROM users WHERE status = 1 OR status = 2;
-- Good
SELECT * FROM users WHERE status = 1
UNION ALL
SELECT * FROM users WHERE status = 2;

-- 6. 批量操作代替循环
-- Bad（循环插入）
INSERT INTO users VALUES (1, 'a');
INSERT INTO users VALUES (2, 'b');
-- Good（批量插入）
INSERT INTO users VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- 7. LIMIT 优化大分页
-- Bad
SELECT * FROM orders ORDER BY id LIMIT 1000000, 10;
-- Good（延迟关联）
SELECT o.* FROM orders o
INNER JOIN (SELECT id FROM orders ORDER BY id LIMIT 1000000, 10) t
ON o.id = t.id;
-- Good（游标分页，记住上次位置）
SELECT * FROM orders WHERE id > 1000000 ORDER BY id LIMIT 10;
```

---

#### 2. JOIN 优化

```sql
-- JOIN 类型选择
-- INNER JOIN：只返回匹配行
-- LEFT JOIN：返回左表所有行
-- 优先使用 INNER JOIN（性能更好）

-- 确保 JOIN 列有索引
CREATE INDEX idx_user_id ON orders(user_id);

-- 避免笛卡尔积
-- Bad
SELECT * FROM users, orders;  -- 笛卡尔积
-- Good
SELECT * FROM users u INNER JOIN orders o ON u.id = o.user_id;

-- 多表 JOIN 优化
-- 1. 小表驱动大表
-- 2. 确保关联字段有索引
-- 3. 避免超过 3 表关联

-- 嵌套循环 JOIN（Nested Loop Join）
-- 适用于小结果集，需要索引

-- 块嵌套循环 JOIN（Block Nested Loop Join）
-- 使用 join_buffer_size 缓存

-- 查看 JOIN 类型
EXPLAIN SELECT * FROM users u JOIN orders o ON u.id = o.user_id;
```

---

#### 3. 慢查询分析

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
SET GLOBAL long_query_time = 2;  -- 超过 2 秒记录

-- 查看慢查询状态
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- 使用 mysqldumpslow 分析
-- mysqldumpslow -s t -t 10 /var/log/mysql/slow.log

-- EXPLAIN 分析
EXPLAIN SELECT * FROM users WHERE name = 'Tom';

-- EXPLAIN 输出关键字段
-- type: 访问类型（const > eq_ref > ref > range > index > ALL）
-- key: 使用的索引
-- rows: 预估扫描行数
-- Extra: 额外信息（Using index, Using filesort, Using temporary）

-- EXPLAIN ANALYZE（MySQL 8.0+）
EXPLAIN ANALYZE SELECT * FROM users WHERE name = 'Tom';
-- 显示实际执行时间和行数

-- 查看查询执行状态
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;

-- 分析查询性能
SHOW STATUS LIKE 'Handler%';
SHOW STATUS LIKE 'Created_tmp%';
```

---

#### 4. 表结构优化

```sql
-- 1. 选择合适的数据类型
-- 数值类型
TINYINT     -- 1字节，-128~127
SMALLINT    -- 2字节
MEDIUMINT   -- 3字节
INT         -- 4字节
BIGINT      -- 8字节

-- 字符类型
CHAR(n)     -- 定长，适合固定长度（如状态码）
VARCHAR(n)  -- 变长，适合可变长度
TEXT        -- 大文本，避免频繁使用

-- 时间类型
DATE        -- 3字节，日期
DATETIME    -- 8字节，日期时间
TIMESTAMP   -- 4字节，时间戳（受时区影响）

-- 2. 合理使用 NOT NULL
-- NULL 需要额外存储空间和处理逻辑
CREATE TABLE users (
    id INT NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT '',
    age INT NOT NULL DEFAULT 0
);

-- 3. 主键选择
-- 推荐自增 INT/BIGINT
-- 避免 UUID（随机导致页分裂）
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
);

-- 4. 适度反范式
-- 冗余存储减少 JOIN
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    user_name VARCHAR(100),  -- 冗余用户名，减少 JOIN
    amount DECIMAL(10, 2)
);

-- 5. 垂直拆分
-- 将不常用字段拆到单独表
CREATE TABLE user_basic (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE user_detail (
    user_id BIGINT PRIMARY KEY,
    address TEXT,
    bio TEXT
);
```

---

#### 5. 参数调优

```ini
# my.cnf 关键参数

# 缓冲池大小（推荐物理内存的 60-80%）
innodb_buffer_pool_size = 8G

# 缓冲池实例数（减少锁争用）
innodb_buffer_pool_instances = 8

# 日志文件大小
innodb_log_file_size = 1G

# 日志缓冲区大小
innodb_log_buffer_size = 64M

# 刷新策略（1=每次提交刷盘，2=每秒刷盘）
innodb_flush_log_at_trx_commit = 1

# 并发线程数
innodb_thread_concurrency = 0

# 读写 I/O 线程
innodb_read_io_threads = 8
innodb_write_io_threads = 8

# 排序缓冲区
sort_buffer_size = 4M

# JOIN 缓冲区
join_buffer_size = 4M

# 查询缓存（MySQL 8.0 已移除）
# query_cache_type = 0

# 连接数
max_connections = 500

# 临时表大小
tmp_table_size = 64M
max_heap_table_size = 64M
```

---

### 进阶题

#### 6. 分库分表

```
┌─────────────────────────────────────────────────────────┐
│                    分库分表策略                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  垂直拆分                                                │
│  ├── 垂直分库：按业务拆分数据库                           │
│  │   用户库、订单库、商品库                               │
│  └── 垂直分表：按字段拆分表                               │
│      user_basic, user_detail                            │
│                                                          │
│  水平拆分                                                │
│  ├── 水平分库：同一表数据分到多个库                        │
│  │   user_0, user_1, user_2                             │
│  └── 水平分表：同一库同一表拆成多个表                      │
│      order_0, order_1, order_2                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**分片策略：**

```java
// 1. 范围分片
// user_id 1-1000000 → db0
// user_id 1000001-2000000 → db1
int dbIndex = userId / 1000000;

// 2. Hash 分片
int dbIndex = userId % dbCount;
int tableIndex = userId % tableCount;

// 3. 一致性 Hash
// 解决扩容时数据迁移问题

// 分片键选择原则
// - 选择高频查询字段
// - 数据分布均匀
// - 避免跨分片查询
```

**分库分表问题：**
- 跨分片查询
- 分布式事务
- 全局唯一 ID
- 跨分片 JOIN

---

#### 7. 读写分离

```
┌─────────────────────────────────────────────────────────┐
│                    主从架构                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│         ┌──────────┐                                    │
│         │  应用层   │                                    │
│         └────┬─────┘                                    │
│              │                                           │
│         ┌────┴─────┐                                    │
│         │  中间件   │  (MyCat/ShardingSphere)           │
│         └────┬─────┘                                    │
│         ┌────┴────┐                                     │
│         ▼         ▼                                     │
│   ┌─────────┐ ┌─────────┐                               │
│   │  Master │ │  Slave  │                               │
│   │  (写)   │ │  (读)   │                               │
│   └────┬────┘ └─────────┘                               │
│        │           ▲                                    │
│        └───────────┘                                    │
│          Binlog 同步                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**主从延迟问题：**
```sql
-- 查看主从延迟
SHOW SLAVE STATUS\G
-- Seconds_Behind_Master

-- 解决方案
-- 1. 强制读主库（写后读）
-- 2. 半同步复制
-- 3. 并行复制
-- 4. 读写时间窗口判断
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "索引越多越好" | 索引影响写入性能，按需创建 |
| "JOIN 性能一定差" | 合理的 JOIN 比子查询更优 |
| "分库分表解决一切" | 先优化单库，分表带来复杂度 |
| "查询缓存提升性能" | MySQL 8.0 已废弃，频繁更新时反而降低性能 |
| "LIMIT 1000000 很快" | 大偏移量性能差，需要优化 |

---

## B. 实战文档

### SQL 审核清单

```
□ 是否使用 SELECT *
□ WHERE 条件是否使用索引
□ JOIN 是否有索引支持
□ 是否有大分页问题
□ 是否有隐式类型转换
□ 是否有函数导致索引失效
□ ORDER BY 是否能使用索引
□ 是否有不必要的排序
□ 子查询是否可以优化为 JOIN
□ LIMIT 是否合理
```

### 监控指标

```sql
-- QPS（每秒查询数）
SHOW GLOBAL STATUS LIKE 'Questions';

-- TPS（每秒事务数）
SHOW GLOBAL STATUS LIKE 'Com_commit';
SHOW GLOBAL STATUS LIKE 'Com_rollback';

-- 连接数
SHOW GLOBAL STATUS LIKE 'Threads_connected';
SHOW GLOBAL STATUS LIKE 'Max_used_connections';

-- 缓冲池命中率
SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_read%';
-- 命中率 = 1 - (Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests)

-- 慢查询数
SHOW GLOBAL STATUS LIKE 'Slow_queries';
```
