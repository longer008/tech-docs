# MySQL 索引面试题集

> MySQL 索引核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. 索引类型

```sql
-- 主键索引 (PRIMARY KEY)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);

-- 唯一索引 (UNIQUE)
CREATE UNIQUE INDEX idx_email ON users(email);
ALTER TABLE users ADD UNIQUE INDEX idx_phone(phone);

-- 普通索引 (INDEX)
CREATE INDEX idx_name ON users(name);
ALTER TABLE users ADD INDEX idx_age(age);

-- 组合索引 (复合索引)
CREATE INDEX idx_name_age ON users(name, age);

-- 全文索引 (FULLTEXT)
CREATE FULLTEXT INDEX idx_content ON articles(content);

-- 前缀索引
CREATE INDEX idx_email_prefix ON users(email(10));
```

| 索引类型 | 说明 | 特点 |
|---------|------|------|
| PRIMARY KEY | 主键索引 | 唯一、非空、一表一个 |
| UNIQUE | 唯一索引 | 允许 NULL，可多个 |
| INDEX | 普通索引 | 无唯一性约束 |
| FULLTEXT | 全文索引 | 用于文本搜索 |
| SPATIAL | 空间索引 | 用于地理数据 |

---

#### 2. B+Tree 索引结构

```
                    ┌─────────────┐
                    │  [20, 40]   │ ← 根节点
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │ [5, 10] │      │[25, 30] │      │[45, 50] │ ← 中间节点
    └────┬────┘      └────┬────┘      └────┬────┘
    ┌────┼────┐      ┌────┼────┐      ┌────┼────┐
    ▼    ▼    ▼      ▼    ▼    ▼      ▼    ▼    ▼
   [数据] [数据] [数据] [数据] [数据] [数据] [数据] [数据] [数据] ← 叶子节点
    ↔     ↔     ↔     ↔     ↔     ↔     ↔     ↔  (双向链表)
```

**B+Tree 特点：**
- 非叶子节点只存储键值，不存储数据
- 叶子节点存储所有数据，通过双向链表连接
- 所有查询都要到叶子节点
- 适合范围查询和排序

**InnoDB vs MyISAM 索引：**
| 特性 | InnoDB | MyISAM |
|------|--------|--------|
| 索引类型 | 聚簇索引 | 非聚簇索引 |
| 主键索引 | 叶子节点存数据 | 叶子节点存数据地址 |
| 二级索引 | 叶子节点存主键 | 叶子节点存数据地址 |
| 回表 | 需要 | 不需要 |

---

#### 3. 聚簇索引与非聚簇索引

```sql
-- InnoDB 表结构
CREATE TABLE users (
    id INT PRIMARY KEY,      -- 聚簇索引
    name VARCHAR(100),
    email VARCHAR(100),
    INDEX idx_name(name)     -- 二级索引（非聚簇）
);

-- 聚簇索引查询（直接获取数据）
SELECT * FROM users WHERE id = 1;

-- 二级索引查询（需要回表）
SELECT * FROM users WHERE name = 'Tom';
-- 1. 在 idx_name 索引中找到 name='Tom' 对应的主键 id
-- 2. 通过主键 id 在聚簇索引中找到完整数据（回表）

-- 覆盖索引（不需要回表）
SELECT id, name FROM users WHERE name = 'Tom';
-- idx_name 索引已包含 id 和 name，无需回表
```

**聚簇索引：**
- 数据与索引存储在一起
- 一个表只能有一个聚簇索引
- InnoDB 主键就是聚簇索引

**非聚簇索引（二级索引）：**
- 索引与数据分离存储
- 叶子节点存储主键值
- 查询时可能需要回表

---

#### 4. 最左前缀原则

```sql
-- 创建组合索引
CREATE INDEX idx_a_b_c ON t(a, b, c);

-- 可以使用索引的查询
WHERE a = 1                      -- 使用 a
WHERE a = 1 AND b = 2            -- 使用 a, b
WHERE a = 1 AND b = 2 AND c = 3  -- 使用 a, b, c
WHERE a = 1 AND c = 3            -- 只使用 a
WHERE a = 1 AND b > 2            -- 使用 a, b（范围查询后停止）
WHERE a = 1 AND b > 2 AND c = 3  -- 使用 a, b（c 无法使用）

-- 不能使用索引的查询
WHERE b = 2                      -- 缺少 a
WHERE b = 2 AND c = 3            -- 缺少 a
WHERE c = 3                      -- 缺少 a, b

-- 特殊情况
WHERE a = 1 ORDER BY b           -- 使用 a，ORDER BY 也能用索引
WHERE a = 1 AND b IN (1,2,3) AND c = 4  -- 使用 a, b, c（IN 视为等值）
```

**最左前缀原则：**
- 从索引最左列开始匹配
- 遇到范围查询（>, <, BETWEEN, LIKE）停止匹配
- IN 和 = 可以乱序，优化器会调整

---

#### 5. 索引失效场景

```sql
-- 1. 对索引列使用函数或运算
WHERE YEAR(create_time) = 2024     -- 失效
WHERE create_time >= '2024-01-01'  -- 有效

WHERE id + 1 = 10                  -- 失效
WHERE id = 10 - 1                  -- 有效

-- 2. 隐式类型转换
-- phone 是 VARCHAR 类型
WHERE phone = 13800138000          -- 失效（数字转字符串）
WHERE phone = '13800138000'        -- 有效

-- 3. LIKE 以 % 开头
WHERE name LIKE '%Tom'             -- 失效
WHERE name LIKE 'Tom%'             -- 有效
WHERE name LIKE '%Tom%'            -- 失效

-- 4. OR 条件（部分字段无索引）
WHERE name = 'Tom' OR age = 20     -- 如果 age 无索引，整体失效

-- 5. NOT IN / NOT EXISTS / <>
WHERE id NOT IN (1, 2, 3)          -- 可能失效
WHERE id <> 1                      -- 可能失效

-- 6. IS NULL / IS NOT NULL（取决于数据分布）
WHERE name IS NULL                 -- 可能失效

-- 7. 索引列参与计算
WHERE salary * 12 > 100000         -- 失效
WHERE salary > 100000 / 12         -- 有效
```

---

### 进阶题

#### 6. 索引优化策略

```sql
-- 1. 覆盖索引（避免回表）
CREATE INDEX idx_name_email ON users(name, email);
SELECT name, email FROM users WHERE name = 'Tom';  -- 覆盖索引

-- 2. 索引下推 (ICP - Index Condition Pushdown)
-- MySQL 5.6+ 自动启用
CREATE INDEX idx_name_age ON users(name, age);
SELECT * FROM users WHERE name LIKE 'T%' AND age = 20;
-- 不使用 ICP：先回表再过滤 age
-- 使用 ICP：在索引层面过滤 age，减少回表

-- 3. 前缀索引（减少索引大小）
-- 选择合适的前缀长度
SELECT
    COUNT(DISTINCT LEFT(email, 5)) / COUNT(*) AS sel5,
    COUNT(DISTINCT LEFT(email, 10)) / COUNT(*) AS sel10,
    COUNT(DISTINCT email) / COUNT(*) AS sel_all
FROM users;

CREATE INDEX idx_email ON users(email(10));

-- 4. 索引合并
-- OR 条件使用多个索引
SELECT * FROM users WHERE name = 'Tom' OR email = 'tom@example.com';
-- 可能使用 idx_name 和 idx_email 的 Index Merge

-- 5. 延迟关联（优化大分页）
-- 原始查询（性能差）
SELECT * FROM orders ORDER BY id LIMIT 1000000, 10;

-- 延迟关联（性能好）
SELECT o.* FROM orders o
INNER JOIN (
    SELECT id FROM orders ORDER BY id LIMIT 1000000, 10
) AS t ON o.id = t.id;
```

---

#### 7. EXPLAIN 分析

```sql
EXPLAIN SELECT * FROM users WHERE name = 'Tom';
```

| 字段 | 说明 |
|------|------|
| id | 查询序号 |
| select_type | 查询类型（SIMPLE/PRIMARY/SUBQUERY） |
| table | 表名 |
| **type** | 访问类型（重要） |
| possible_keys | 可能使用的索引 |
| **key** | 实际使用的索引 |
| key_len | 使用的索引长度 |
| ref | 与索引比较的列 |
| **rows** | 预估扫描行数 |
| **Extra** | 额外信息 |

**type 类型（从好到差）：**
```
system > const > eq_ref > ref > range > index > ALL
```

| type | 说明 |
|------|------|
| const | 主键或唯一索引等值查询 |
| eq_ref | 关联查询使用主键或唯一索引 |
| ref | 非唯一索引等值查询 |
| range | 索引范围查询 |
| index | 索引全扫描 |
| ALL | 全表扫描（需优化） |

**Extra 重要信息：**
| Extra | 说明 |
|-------|------|
| Using index | 覆盖索引 |
| Using where | 需要回表过滤 |
| Using index condition | 索引下推 |
| Using filesort | 文件排序（需优化） |
| Using temporary | 使用临时表（需优化） |

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "索引越多越好" | 索引占空间，影响写入性能 |
| "主键用 UUID" | 推荐自增 ID，避免页分裂 |
| "LIKE '%abc' 能用索引" | 以 % 开头不能使用索引 |
| "IN 会导致索引失效" | IN 可以使用索引（值不太多时） |
| "组合索引顺序不重要" | 顺序很重要，遵循最左前缀原则 |

---

## B. 实战文档

### 索引设计原则

1. **选择性高的列**：区分度高的列适合建索引
2. **查询频繁的列**：WHERE、ORDER BY、GROUP BY 常用列
3. **小表不建索引**：几百行的表全扫也很快
4. **避免冗余索引**：(a, b) 已包含 (a)
5. **组合索引列顺序**：等值条件在前，范围条件在后

### 索引监控

```sql
-- 查看索引使用情况
SELECT * FROM sys.schema_index_statistics
WHERE table_schema = 'mydb';

-- 查看未使用的索引
SELECT * FROM sys.schema_unused_indexes;

-- 查看冗余索引
SELECT * FROM sys.schema_redundant_indexes;

-- 查看表索引
SHOW INDEX FROM users;
```
