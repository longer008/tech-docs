# MySQL 事务面试题集

> MySQL 事务与锁机制核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. 事务 ACID 特性

```
┌─────────────────────────────────────────────────────────┐
│                     ACID 特性                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  A - Atomicity（原子性）                                  │
│      事务要么全部成功，要么全部失败回滚                    │
│                                                          │
│  C - Consistency（一致性）                                │
│      事务前后数据库完整性约束不被破坏                      │
│                                                          │
│  I - Isolation（隔离性）                                  │
│      并发事务之间互不干扰                                 │
│                                                          │
│  D - Durability（持久性）                                 │
│      事务提交后数据永久保存                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

```sql
-- 事务基本操作
START TRANSACTION;  -- 或 BEGIN

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

COMMIT;  -- 提交事务
-- 或
ROLLBACK;  -- 回滚事务

-- 保存点
START TRANSACTION;
INSERT INTO orders VALUES (1, 'order1');
SAVEPOINT sp1;
INSERT INTO orders VALUES (2, 'order2');
ROLLBACK TO sp1;  -- 回滚到保存点
COMMIT;
```

---

#### 2. 事务隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|---------|------|-----------|------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 |
| READ COMMITTED | 不会 | 可能 | 可能 |
| REPEATABLE READ | 不会 | 不会 | 可能* |
| SERIALIZABLE | 不会 | 不会 | 不会 |

> *InnoDB 的 REPEATABLE READ 通过 MVCC + 间隙锁解决了大部分幻读

```sql
-- 查看隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET GLOBAL TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 在事务开始时设置
START TRANSACTION;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

**并发问题示例：**

```sql
-- 脏读：读取未提交数据
-- 事务A                          -- 事务B
START TRANSACTION;
UPDATE users SET age = 25
WHERE id = 1;
                                  START TRANSACTION;
                                  SELECT age FROM users WHERE id = 1;
                                  -- 读到 25（未提交）
ROLLBACK;
                                  -- 实际上 age 不是 25

-- 不可重复读：同一事务两次读取结果不同
-- 事务A                          -- 事务B
START TRANSACTION;
SELECT age FROM users WHERE id = 1;
-- 读到 20
                                  UPDATE users SET age = 25 WHERE id = 1;
                                  COMMIT;
SELECT age FROM users WHERE id = 1;
-- 读到 25（不一致）

-- 幻读：同一事务两次查询行数不同
-- 事务A                          -- 事务B
START TRANSACTION;
SELECT * FROM users WHERE age > 20;
-- 返回 3 行
                                  INSERT INTO users VALUES (4, 25);
                                  COMMIT;
SELECT * FROM users WHERE age > 20;
-- 返回 4 行（幻读）
```

---

#### 3. InnoDB 锁类型

```sql
-- 1. 共享锁 (S Lock) - 读锁
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;
SELECT * FROM users WHERE id = 1 FOR SHARE;  -- MySQL 8.0+

-- 2. 排他锁 (X Lock) - 写锁
SELECT * FROM users WHERE id = 1 FOR UPDATE;
-- INSERT/UPDATE/DELETE 自动加排他锁

-- 3. 意向锁 (Intention Lock)
-- 表级锁，用于表锁和行锁共存
-- IS: 意向共享锁
-- IX: 意向排他锁
```

| 锁类型 | 兼容性 |
|--------|-------|
| S 与 S | 兼容 |
| S 与 X | 不兼容 |
| X 与 X | 不兼容 |

**行锁类型：**

```sql
-- Record Lock（记录锁）
-- 锁定索引记录
SELECT * FROM users WHERE id = 1 FOR UPDATE;  -- 锁定 id=1 的记录

-- Gap Lock（间隙锁）
-- 锁定索引记录之间的间隙，防止插入
-- 假设 id 有 1, 5, 10
SELECT * FROM users WHERE id BETWEEN 2 AND 4 FOR UPDATE;
-- 锁定 (1, 5) 间隙，阻止插入 id=2,3,4

-- Next-Key Lock（临键锁）
-- Record Lock + Gap Lock
-- 锁定记录及其前面的间隙
SELECT * FROM users WHERE id > 5 FOR UPDATE;
-- 锁定 (5, +∞) 范围
```

---

#### 4. MVCC 多版本并发控制

```
┌─────────────────────────────────────────────────────────┐
│                    MVCC 原理                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  每行数据隐藏字段：                                        │
│  - DB_TRX_ID: 最后修改该行的事务 ID                        │
│  - DB_ROLL_PTR: 回滚指针，指向 undo log                   │
│  - DB_ROW_ID: 隐藏自增 ID（无主键时使用）                  │
│                                                          │
│  Undo Log 链：                                           │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐              │
│  │ 当前版本 │───→│ 上一版本 │───→│ 更早版本 │              │
│  └─────────┘    └─────────┘    └─────────┘              │
│                                                          │
│  Read View：事务快照                                      │
│  - m_ids: 活跃事务 ID 列表                                │
│  - min_trx_id: 最小活跃事务 ID                            │
│  - max_trx_id: 下一个分配的事务 ID                        │
│  - creator_trx_id: 创建该 Read View 的事务 ID             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**可见性判断：**
```
1. DB_TRX_ID < min_trx_id → 可见（事务已提交）
2. DB_TRX_ID >= max_trx_id → 不可见（事务未开始）
3. DB_TRX_ID in m_ids → 不可见（事务未提交）
4. DB_TRX_ID not in m_ids → 可见（事务已提交）
5. DB_TRX_ID = creator_trx_id → 可见（自己修改的）
```

**Read View 创建时机：**
- READ COMMITTED：每次 SELECT 创建新 Read View
- REPEATABLE READ：事务首次 SELECT 创建，后续复用

---

#### 5. 死锁

```sql
-- 死锁示例
-- 事务A                          -- 事务B
START TRANSACTION;                START TRANSACTION;
UPDATE users SET age = 25
WHERE id = 1;                     UPDATE users SET age = 30
                                  WHERE id = 2;
UPDATE users SET age = 26
WHERE id = 2;                     UPDATE users SET age = 31
-- 等待事务B释放 id=2 的锁         WHERE id = 1;
                                  -- 等待事务A释放 id=1 的锁
                                  -- 死锁！

-- 查看死锁日志
SHOW ENGINE INNODB STATUS;

-- 死锁检测与处理
-- InnoDB 自动检测死锁，回滚代价小的事务
SET innodb_deadlock_detect = ON;  -- 开启死锁检测
SET innodb_lock_wait_timeout = 50; -- 锁等待超时（秒）
```

**避免死锁：**
1. 按固定顺序访问表和行
2. 大事务拆分为小事务
3. 使用低隔离级别
4. 为表添加合适索引（避免锁升级）

---

### 进阶题

#### 6. 锁分析

```sql
-- 查看当前锁等待
SELECT * FROM information_schema.INNODB_LOCK_WAITS;

-- 查看锁信息（MySQL 8.0+）
SELECT * FROM performance_schema.data_locks;
SELECT * FROM performance_schema.data_lock_waits;

-- 查看当前事务
SELECT * FROM information_schema.INNODB_TRX;

-- 查看锁阻塞
SELECT
    r.trx_id AS waiting_trx_id,
    r.trx_mysql_thread_id AS waiting_thread,
    r.trx_query AS waiting_query,
    b.trx_id AS blocking_trx_id,
    b.trx_mysql_thread_id AS blocking_thread,
    b.trx_query AS blocking_query
FROM information_schema.INNODB_LOCK_WAITS w
JOIN information_schema.INNODB_TRX b ON b.trx_id = w.blocking_trx_id
JOIN information_schema.INNODB_TRX r ON r.trx_id = w.requesting_trx_id;

-- 终止阻塞会话
KILL <thread_id>;
```

---

#### 7. 日志系统

```
┌─────────────────────────────────────────────────────────┐
│                    事务日志系统                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Redo Log（重做日志）                                     │
│  - 保证事务持久性                                         │
│  - 记录物理修改（某页某偏移做了什么修改）                  │
│  - 写入方式：循环写入，覆盖旧日志                         │
│  - 崩溃恢复时用于重做已提交事务                           │
│                                                          │
│  Undo Log（回滚日志）                                     │
│  - 保证事务原子性                                         │
│  - 记录逻辑修改（用于回滚）                               │
│  - 用于 MVCC 实现                                        │
│                                                          │
│  Binlog（二进制日志）                                     │
│  - MySQL Server 层日志                                   │
│  - 记录所有修改操作                                       │
│  - 用于主从复制、数据恢复                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**两阶段提交：**
```
1. Prepare 阶段
   - 写入 Redo Log（prepare 状态）

2. Commit 阶段
   - 写入 Binlog
   - 修改 Redo Log 状态为 commit
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "InnoDB 默认 RC 隔离级别" | InnoDB 默认 REPEATABLE READ |
| "MVCC 完全解决幻读" | 快照读无幻读，当前读需要间隙锁 |
| "行锁只锁一行" | 可能是记录锁+间隙锁组合 |
| "SELECT 不加锁" | 普通 SELECT 不加锁，FOR UPDATE 加锁 |
| "死锁会导致系统卡死" | InnoDB 自动检测并回滚一个事务 |

---

## B. 实战文档

### 事务最佳实践

```sql
-- 1. 事务尽量短小
START TRANSACTION;
-- 只做必要操作
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- 2. 避免长事务
-- 查看长事务
SELECT * FROM information_schema.INNODB_TRX
WHERE TIME_TO_SEC(TIMEDIFF(NOW(), trx_started)) > 60;

-- 3. 合理使用索引避免锁升级
-- 无索引时锁表，有索引时锁行
UPDATE users SET age = 25 WHERE name = 'Tom';  -- name 需要有索引

-- 4. 按主键顺序操作避免死锁
UPDATE users SET age = 25 WHERE id = 1;
UPDATE users SET age = 26 WHERE id = 2;
-- 总是按 id 升序操作
```

### 锁监控配置

```sql
-- 开启锁等待超时
SET innodb_lock_wait_timeout = 10;

-- 查看锁等待超时设置
SHOW VARIABLES LIKE 'innodb_lock_wait_timeout';

-- 死锁日志输出到错误日志
SET GLOBAL innodb_print_all_deadlocks = ON;
```
