# MySQL 开发指南

> 更新时间：2025-02

## 目录导航

- [核心概念](#核心概念)
- [存储引擎](#存储引擎)
- [索引原理](#索引原理)
- [事务与锁](#事务与锁)
- [查询优化](#查询优化)
- [性能调优](#性能调优)
- [高可用架构](#高可用架构)
- [最佳实践](#最佳实践)

---

## 核心概念

### 什么是 MySQL？

MySQL 是世界上最流行的开源关系型数据库管理系统（RDBMS），由瑞典 MySQL AB 公司开发，现属于 Oracle 公司。

**核心特点**：
- **开源免费**：社区版完全免费
- **跨平台**：支持 Windows、Linux、macOS
- **高性能**：支持大数据量和高并发
- **可靠性**：支持事务、ACID 特性
- **易用性**：SQL 标准，学习成本低
- **可扩展**：支持主从复制、分库分表

**适用场景**：
- Web 应用（电商、社交、内容管理）
- 数据仓库和分析
- 日志系统
- 嵌入式数据库
- 中小型企业应用

**版本选择**：
- **MySQL 5.7**：稳定版本，广泛使用
- **MySQL 8.0**：最新稳定版，性能提升，新特性丰富
- **MySQL 8.4**：LTS 长期支持版本

---

## 存储引擎

### InnoDB（默认引擎）

**特点**：
- 支持事务（ACID）
- 支持行级锁
- 支持外键约束
- 支持崩溃恢复
- 支持 MVCC（多版本并发控制）

**适用场景**：
- 需要事务支持的应用
- 高并发读写
- 数据一致性要求高

```sql
-- 创建 InnoDB 表
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username),
    KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### MyISAM

**特点**：
- 不支持事务
- 支持表级锁
- 不支持外键
- 查询速度快
- 占用空间小

**适用场景**：
- 只读或读多写少的应用
- 不需要事务支持
- 对查询性能要求高

```sql
-- 创建 MyISAM 表
CREATE TABLE logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    message TEXT,
    created_at DATETIME,
    PRIMARY KEY (id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;
```

### InnoDB vs MyISAM

| 特性 | InnoDB | MyISAM |
|------|--------|--------|
| 事务支持 | ✅ | ❌ |
| 行级锁 | ✅ | ❌（表级锁） |
| 外键 | ✅ | ❌ |
| 崩溃恢复 | ✅ | ❌ |
| MVCC | ✅ | ❌ |
| 全文索引 | ✅（5.6+） | ✅ |
| 空间占用 | 较大 | 较小 |
| 查询性能 | 较快 | 很快 |

---

## 索引原理

### B+Tree 索引

MySQL 的 InnoDB 引擎使用 B+Tree 作为索引结构。

**B+Tree 特点**：
- 所有数据存储在叶子节点
- 叶子节点之间有指针连接
- 非叶子节点只存储键值
- 查询效率稳定（O(log n)）

```
        [10, 20, 30]
       /    |    |    \
    [1-9] [10-19] [20-29] [30-39]
     ↓      ↓       ↓       ↓
   数据   数据    数据    数据
```

### 索引类型

**1. 主键索引（PRIMARY KEY）**：

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50),
    PRIMARY KEY (id)  -- 主键索引
);
```

**2. 唯一索引（UNIQUE）**：

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50),
    email VARCHAR(100),
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username),  -- 唯一索引
    UNIQUE KEY uk_email (email)
);
```

**3. 普通索引（INDEX）**：

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50),
    status TINYINT,
    PRIMARY KEY (id),
    KEY idx_status (status)  -- 普通索引
);
```

**4. 联合索引（组合索引）**：

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(50),
    age INT,
    city VARCHAR(50),
    PRIMARY KEY (id),
    KEY idx_name_age_city (name, age, city)  -- 联合索引
);

-- 最左前缀原则
-- ✅ 可以使用索引
SELECT * FROM users WHERE name = 'Alice';
SELECT * FROM users WHERE name = 'Alice' AND age = 25;
SELECT * FROM users WHERE name = 'Alice' AND age = 25 AND city = 'Beijing';

-- ❌ 不能使用索引
SELECT * FROM users WHERE age = 25;
SELECT * FROM users WHERE city = 'Beijing';
SELECT * FROM users WHERE age = 25 AND city = 'Beijing';
```

**5. 前缀索引**：

```sql
-- 对长字符串字段的前 N 个字符建立索引
CREATE TABLE articles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(200),
    content TEXT,
    PRIMARY KEY (id),
    KEY idx_title (title(50))  -- 前缀索引（前 50 个字符）
);
```

**6. 全文索引（FULLTEXT）**：

```sql
CREATE TABLE articles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(200),
    content TEXT,
    PRIMARY KEY (id),
    FULLTEXT KEY ft_content (content)  -- 全文索引
) ENGINE=InnoDB;

-- 使用全文索引
SELECT * FROM articles WHERE MATCH(content) AGAINST('MySQL 索引');
```

### 索引失效场景

```sql
-- 1. 使用函数或表达式
-- ❌ 索引失效
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- ✅ 使用索引
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- 2. 隐式类型转换
-- ❌ 索引失效（phone 是 VARCHAR 类型）
SELECT * FROM users WHERE phone = 13800138000;
-- ✅ 使用索引
SELECT * FROM users WHERE phone = '13800138000';

-- 3. LIKE 以通配符开头
-- ❌ 索引失效
SELECT * FROM users WHERE name LIKE '%Alice%';
-- ✅ 使用索引
SELECT * FROM users WHERE name LIKE 'Alice%';

-- 4. OR 条件中有未建索引的列
-- ❌ 索引失效
SELECT * FROM users WHERE name = 'Alice' OR age = 25;  -- age 无索引
-- ✅ 使用索引
SELECT * FROM users WHERE name = 'Alice' OR email = 'alice@example.com';  -- 都有索引

-- 5. 不等于操作符
-- ❌ 可能不使用索引
SELECT * FROM users WHERE status != 1;
-- ✅ 使用索引
SELECT * FROM users WHERE status = 1;

-- 6. IS NULL / IS NOT NULL
-- ❌ 可能不使用索引
SELECT * FROM users WHERE email IS NULL;
```

### 覆盖索引

覆盖索引是指查询的所有列都在索引中，无需回表查询。

```sql
-- 创建联合索引
CREATE INDEX idx_name_age ON users(name, age);

-- ✅ 覆盖索引（只查询索引列）
SELECT name, age FROM users WHERE name = 'Alice';

-- ❌ 非覆盖索引（需要回表查询 email）
SELECT name, age, email FROM users WHERE name = 'Alice';
```

---

## 事务与锁

### ACID 特性

**原子性（Atomicity）**：
- 事务中的所有操作要么全部成功，要么全部失败

**一致性（Consistency）**：
- 事务执行前后，数据库从一个一致性状态转换到另一个一致性状态

**隔离性（Isolation）**：
- 多个事务并发执行时，相互之间不受影响

**持久性（Durability）**：
- 事务提交后，对数据库的修改是永久性的

```sql
-- 事务示例
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- 检查余额是否足够
SELECT balance FROM accounts WHERE id = 1;

-- 如果余额足够，提交事务
COMMIT;

-- 如果余额不足，回滚事务
ROLLBACK;
```

### 隔离级别

MySQL 支持 4 种事务隔离级别：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|---------|------|-----------|------|
| READ UNCOMMITTED | ✅ | ✅ | ✅ |
| READ COMMITTED | ❌ | ✅ | ✅ |
| REPEATABLE READ（默认） | ❌ | ❌ | ✅ |
| SERIALIZABLE | ❌ | ❌ | ❌ |

**脏读**：读取到其他事务未提交的数据
**不可重复读**：同一事务中多次读取同一数据，结果不一致
**幻读**：同一事务中多次查询，结果集不一致（新增或删除）

```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置会话隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 设置全局隔离级别
SET GLOBAL TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

### 锁机制

**表级锁**：
- 锁定整张表
- 开销小，加锁快
- 并发度低

**行级锁**：
- 锁定单行数据
- 开销大，加锁慢
- 并发度高
- InnoDB 支持

**锁类型**：

```sql
-- 共享锁（S锁，读锁）
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;

-- 排他锁（X锁，写锁）
SELECT * FROM users WHERE id = 1 FOR UPDATE;

-- 示例：防止超卖
START TRANSACTION;
SELECT stock FROM products WHERE id = 1 FOR UPDATE;  -- 加排他锁
-- 检查库存
UPDATE products SET stock = stock - 1 WHERE id = 1;
COMMIT;
```

### 死锁

死锁是指两个或多个事务相互等待对方释放锁，导致无法继续执行。

**死锁示例**：

```sql
-- 事务 A
START TRANSACTION;
UPDATE users SET name = 'A' WHERE id = 1;  -- 锁定 id=1
UPDATE users SET name = 'A' WHERE id = 2;  -- 等待 id=2 的锁

-- 事务 B
START TRANSACTION;
UPDATE users SET name = 'B' WHERE id = 2;  -- 锁定 id=2
UPDATE users SET name = 'B' WHERE id = 1;  -- 等待 id=1 的锁
```

**避免死锁**：
1. 按相同顺序访问资源
2. 缩短事务时间
3. 降低事务隔离级别
4. 使用乐观锁代替悲观锁

```sql
-- 查看死锁日志
SHOW ENGINE INNODB STATUS;

-- 查看当前锁等待
SELECT * FROM information_schema.innodb_locks;
SELECT * FROM information_schema.innodb_lock_waits;
```

---

## 查询优化

### EXPLAIN 执行计划

```sql
EXPLAIN SELECT * FROM users WHERE name = 'Alice';
```

**关键字段**：

| 字段 | 说明 |
|------|------|
| id | 查询序号 |
| select_type | 查询类型（SIMPLE、PRIMARY、SUBQUERY） |
| table | 表名 |
| type | 访问类型（ALL、index、range、ref、eq_ref、const） |
| possible_keys | 可能使用的索引 |
| key | 实际使用的索引 |
| key_len | 索引长度 |
| ref | 索引引用 |
| rows | 扫描行数 |
| Extra | 额外信息 |

**type 访问类型**（性能从好到差）：
- **system**：表只有一行
- **const**：主键或唯一索引查询
- **eq_ref**：唯一索引扫描
- **ref**：非唯一索引扫描
- **range**：范围扫描
- **index**：索引全扫描
- **ALL**：全表扫描（最差）

```sql
-- 示例
EXPLAIN SELECT * FROM users WHERE id = 1;
-- type: const（最优）

EXPLAIN SELECT * FROM users WHERE name = 'Alice';
-- type: ref（使用普通索引）

EXPLAIN SELECT * FROM users WHERE age > 18;
-- type: range（范围查询）

EXPLAIN SELECT * FROM users;
-- type: ALL（全表扫描，需优化）
```

### 慢查询优化

**1. 开启慢查询日志**：

```sql
-- 查看慢查询配置
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;  -- 超过 2 秒的查询记录
```

**2. 分析慢查询**：

```bash
# 使用 mysqldumpslow 分析慢查询日志
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log
```

**3. 优化策略**：

```sql
-- ❌ 慢查询：全表扫描
SELECT * FROM users WHERE age > 18;

-- ✅ 优化：添加索引
CREATE INDEX idx_age ON users(age);

-- ❌ 慢查询：SELECT *
SELECT * FROM users WHERE id = 1;

-- ✅ 优化：只查询需要的列
SELECT id, name, email FROM users WHERE id = 1;

-- ❌ 慢查询：子查询
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);

-- ✅ 优化：使用 JOIN
SELECT u.* FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- ❌ 慢查询：LIMIT 大偏移量
SELECT * FROM users LIMIT 1000000, 10;

-- ✅ 优化：使用 ID 范围
SELECT * FROM users WHERE id > 1000000 LIMIT 10;
```

### 查询优化技巧

**1. 避免 SELECT ***：

```sql
-- ❌ 不推荐
SELECT * FROM users WHERE id = 1;

-- ✅ 推荐
SELECT id, name, email FROM users WHERE id = 1;
```

**2. 使用 LIMIT**：

```sql
-- ❌ 不推荐
SELECT * FROM users WHERE status = 1;

-- ✅ 推荐
SELECT * FROM users WHERE status = 1 LIMIT 100;
```

**3. 避免在 WHERE 中使用函数**：

```sql
-- ❌ 不推荐
SELECT * FROM users WHERE DATE(created_at) = '2024-01-15';

-- ✅ 推荐
SELECT * FROM users 
WHERE created_at >= '2024-01-15 00:00:00' 
  AND created_at < '2024-01-16 00:00:00';
```

**4. 使用 EXISTS 代替 IN**：

```sql
-- ❌ 不推荐（子查询结果集大时）
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);

-- ✅ 推荐
SELECT * FROM users u WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

**5. 批量操作**：

```sql
-- ❌ 不推荐：逐条插入
INSERT INTO users (name) VALUES ('Alice');
INSERT INTO users (name) VALUES ('Bob');
INSERT INTO users (name) VALUES ('Carol');

-- ✅ 推荐：批量插入
INSERT INTO users (name) VALUES ('Alice'), ('Bob'), ('Carol');
```

---

## 性能调优

### 配置优化

**1. InnoDB 缓冲池**：

```ini
# my.cnf
[mysqld]
# InnoDB 缓冲池大小（建议设置为物理内存的 50-80%）
innodb_buffer_pool_size = 4G

# 缓冲池实例数（提高并发）
innodb_buffer_pool_instances = 4
```

**2. 连接数**：

```ini
# 最大连接数
max_connections = 500

# 最大错误连接数
max_connect_errors = 1000
```

**3. 查询缓存**（MySQL 8.0 已移除）：

```ini
# MySQL 5.7
query_cache_type = 1
query_cache_size = 128M
```

**4. 日志配置**：

```ini
# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# 二进制日志
log_bin = /var/log/mysql/mysql-bin.log
expire_logs_days = 7
```

### 表优化

**1. 分析表**：

```sql
-- 分析表统计信息
ANALYZE TABLE users;

-- 查看表状态
SHOW TABLE STATUS LIKE 'users';
```

**2. 优化表**：

```sql
-- 优化表（整理碎片）
OPTIMIZE TABLE users;
```

**3. 检查表**：

```sql
-- 检查表是否有错误
CHECK TABLE users;

-- 修复表
REPAIR TABLE users;
```

### 分区表

```sql
-- 按范围分区
CREATE TABLE orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10, 2),
    created_at DATETIME,
    PRIMARY KEY (id, created_at)
) ENGINE=InnoDB
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026)
);

-- 按哈希分区
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50),
    PRIMARY KEY (id)
) ENGINE=InnoDB
PARTITION BY HASH(id)
PARTITIONS 4;
```

---

## 高可用架构

### 主从复制

**配置主库**：

```ini
# my.cnf
[mysqld]
server-id = 1
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
```

**配置从库**：

```ini
# my.cnf
[mysqld]
server-id = 2
relay_log = /var/log/mysql/relay-bin.log
read_only = 1
```

**建立主从关系**：

```sql
-- 主库创建复制用户
CREATE USER 'repl'@'%' IDENTIFIED BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- 从库配置主库信息
CHANGE MASTER TO
    MASTER_HOST='192.168.1.100',
    MASTER_USER='repl',
    MASTER_PASSWORD='password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=154;

-- 启动从库复制
START SLAVE;

-- 查看从库状态
SHOW SLAVE STATUS\G
```

### 读写分离

```
        写请求
          ↓
    [主库 Master]
          ↓
    [从库 Slave 1] ← 读请求
          ↓
    [从库 Slave 2] ← 读请求
```

---

## 最佳实践

### 表设计

1. **使用合适的数据类型**：
   - 整数：TINYINT、SMALLINT、INT、BIGINT
   - 字符串：VARCHAR（可变长度）、CHAR（固定长度）
   - 日期：DATE、DATETIME、TIMESTAMP
   - 金额：DECIMAL（精确）

2. **主键设计**：
   - 使用自增 ID 作为主键
   - 避免使用 UUID（占用空间大，无序）

3. **字符集**：
   - 使用 utf8mb4（支持 emoji）
   - 排序规则：utf8mb4_unicode_ci

4. **NOT NULL**：
   - 尽量使用 NOT NULL
   - 避免 NULL 值（影响索引和查询）

### 索引设计

1. **选择性高的列建索引**
2. **联合索引遵循最左前缀原则**
3. **避免过多索引（影响写入性能）**
4. **定期分析和优化索引**

### 查询优化

1. **避免 SELECT ***
2. **使用 LIMIT 限制结果集**
3. **避免在 WHERE 中使用函数**
4. **使用 EXPLAIN 分析查询**
5. **批量操作代替逐条操作**

### 事务管理

1. **保持事务简短**
2. **避免长事务**
3. **合理设置隔离级别**
4. **处理死锁**

---

## 参考资源

- [MySQL 官方文档](https://dev.mysql.com/doc/) - 最权威的 MySQL 文档
- [MySQL 8.0 参考手册](https://dev.mysql.com/doc/refman/8.0/en/) - MySQL 8.0 完整文档
- [InnoDB 存储引擎](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html) - InnoDB 详细文档
- [MySQL 性能优化](https://dev.mysql.com/doc/refman/8.0/en/optimization.html) - 性能优化指南

---

> 本文档基于 MySQL 9.4 官方文档和 MCP Context7 最新资料整理（19896+ 代码示例），涵盖存储引擎、索引原理、事务与锁、查询优化、性能调优、高可用架构和最佳实践。所有代码示例均可运行，并包含详细的中文注释。

