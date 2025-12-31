# MySQL 速查手册

> MySQL 常用 SQL 语句与命令速查

## 数据库操作

```sql
-- 创建数据库
CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 查看数据库
SHOW DATABASES;

-- 选择数据库
USE mydb;

-- 删除数据库
DROP DATABASE mydb;

-- 查看当前数据库
SELECT DATABASE();
```

## 表操作

### 创建表

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    age TINYINT UNSIGNED DEFAULT 0,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    status TINYINT DEFAULT 1 COMMENT '1:正常 0:禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    KEY idx_status (status),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 修改表

```sql
-- 添加列
ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email;

-- 修改列
ALTER TABLE users MODIFY COLUMN phone VARCHAR(30) NOT NULL;
ALTER TABLE users CHANGE COLUMN phone mobile VARCHAR(30);

-- 删除列
ALTER TABLE users DROP COLUMN mobile;

-- 添加索引
ALTER TABLE users ADD INDEX idx_age (age);
ALTER TABLE users ADD UNIQUE INDEX uk_phone (phone);

-- 删除索引
ALTER TABLE users DROP INDEX idx_age;

-- 重命名表
ALTER TABLE users RENAME TO members;
RENAME TABLE users TO members;

-- 清空表
TRUNCATE TABLE users;

-- 删除表
DROP TABLE IF EXISTS users;
```

### 查看表

```sql
-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESC users;
DESCRIBE users;
SHOW CREATE TABLE users;

-- 查看索引
SHOW INDEX FROM users;

-- 查看表状态
SHOW TABLE STATUS LIKE 'users';
```

## CRUD 操作

### 插入数据

```sql
-- 单行插入
INSERT INTO users (username, email, password)
VALUES ('tom', 'tom@example.com', 'password123');

-- 多行插入
INSERT INTO users (username, email, password) VALUES
('alice', 'alice@example.com', 'pass1'),
('bob', 'bob@example.com', 'pass2'),
('carol', 'carol@example.com', 'pass3');

-- 插入或更新
INSERT INTO users (id, username, email)
VALUES (1, 'tom', 'tom@example.com')
ON DUPLICATE KEY UPDATE username = VALUES(username), email = VALUES(email);

-- 插入或忽略
INSERT IGNORE INTO users (username, email, password)
VALUES ('tom', 'tom@example.com', 'password123');

-- 从查询结果插入
INSERT INTO user_backup (id, username, email)
SELECT id, username, email FROM users WHERE status = 1;
```

### 查询数据

```sql
-- 基本查询
SELECT * FROM users;
SELECT id, username, email FROM users;
SELECT id, username AS name FROM users;

-- 条件查询
SELECT * FROM users WHERE status = 1;
SELECT * FROM users WHERE age >= 18 AND age <= 30;
SELECT * FROM users WHERE age BETWEEN 18 AND 30;
SELECT * FROM users WHERE status IN (1, 2, 3);
SELECT * FROM users WHERE username LIKE 'tom%';
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;

-- 排序
SELECT * FROM users ORDER BY created_at DESC;
SELECT * FROM users ORDER BY status ASC, created_at DESC;

-- 分页
SELECT * FROM users LIMIT 10;
SELECT * FROM users LIMIT 10 OFFSET 20;
SELECT * FROM users LIMIT 20, 10;  -- 等同于上面

-- 去重
SELECT DISTINCT status FROM users;

-- 分组
SELECT status, COUNT(*) as count FROM users GROUP BY status;
SELECT status, COUNT(*) as count FROM users GROUP BY status HAVING count > 10;

-- 聚合函数
SELECT COUNT(*) FROM users;
SELECT SUM(balance) FROM users;
SELECT AVG(age) FROM users;
SELECT MAX(age), MIN(age) FROM users;

-- 联表查询
SELECT u.*, o.order_no
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

SELECT u.*, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- 子查询
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);
SELECT * FROM users WHERE EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id);

-- UNION
SELECT id, username FROM users WHERE status = 1
UNION ALL
SELECT id, username FROM users WHERE age > 30;
```

### 更新数据

```sql
-- 基本更新
UPDATE users SET status = 0 WHERE id = 1;

-- 多字段更新
UPDATE users SET status = 0, updated_at = NOW() WHERE id = 1;

-- 批量更新
UPDATE users SET status = 0 WHERE id IN (1, 2, 3);

-- 关联更新
UPDATE users u
INNER JOIN user_stats s ON u.id = s.user_id
SET u.balance = s.total_amount;

-- CASE WHEN 更新
UPDATE users
SET status = CASE
    WHEN age < 18 THEN 0
    WHEN age >= 18 AND age < 60 THEN 1
    ELSE 2
END;
```

### 删除数据

```sql
-- 基本删除
DELETE FROM users WHERE id = 1;

-- 批量删除
DELETE FROM users WHERE status = 0;

-- 关联删除
DELETE u FROM users u
INNER JOIN blacklist b ON u.id = b.user_id;

-- 限制删除数量
DELETE FROM users WHERE status = 0 LIMIT 100;
```

## 索引操作

```sql
-- 创建索引
CREATE INDEX idx_name ON users(name);
CREATE UNIQUE INDEX uk_email ON users(email);
CREATE INDEX idx_name_age ON users(name, age);  -- 组合索引
CREATE INDEX idx_name ON users(name(10));  -- 前缀索引

-- 查看索引
SHOW INDEX FROM users;

-- 删除索引
DROP INDEX idx_name ON users;
ALTER TABLE users DROP INDEX idx_name;

-- 强制使用索引
SELECT * FROM users FORCE INDEX(idx_name) WHERE name = 'tom';

-- 忽略索引
SELECT * FROM users IGNORE INDEX(idx_name) WHERE name = 'tom';
```

## 事务操作

```sql
-- 开启事务
START TRANSACTION;
-- 或
BEGIN;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;

-- 保存点
SAVEPOINT sp1;
ROLLBACK TO sp1;
RELEASE SAVEPOINT sp1;

-- 查看隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

## 用户与权限

```sql
-- 创建用户
CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'myuser'@'%' IDENTIFIED BY 'password';

-- 授权
GRANT ALL PRIVILEGES ON mydb.* TO 'myuser'@'localhost';
GRANT SELECT, INSERT, UPDATE ON mydb.users TO 'myuser'@'%';

-- 撤销权限
REVOKE ALL PRIVILEGES ON mydb.* FROM 'myuser'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 查看权限
SHOW GRANTS FOR 'myuser'@'localhost';

-- 修改密码
ALTER USER 'myuser'@'localhost' IDENTIFIED BY 'newpassword';

-- 删除用户
DROP USER 'myuser'@'localhost';
```

## 常用函数

### 字符串函数

```sql
CONCAT('Hello', ' ', 'World')     -- 'Hello World'
CONCAT_WS(',', 'a', 'b', 'c')     -- 'a,b,c'
LENGTH('Hello')                    -- 5
CHAR_LENGTH('你好')                -- 2
UPPER('hello')                     -- 'HELLO'
LOWER('HELLO')                     -- 'hello'
TRIM('  hello  ')                  -- 'hello'
LEFT('hello', 2)                   -- 'he'
RIGHT('hello', 2)                  -- 'lo'
SUBSTRING('hello', 2, 3)           -- 'ell'
REPLACE('hello', 'l', 'L')         -- 'heLLo'
REVERSE('hello')                   -- 'olleh'
```

### 数值函数

```sql
ROUND(3.14159, 2)    -- 3.14
CEIL(3.14)           -- 4
FLOOR(3.14)          -- 3
ABS(-10)             -- 10
MOD(10, 3)           -- 1
RAND()               -- 0-1 随机数
```

### 日期函数

```sql
NOW()                              -- 当前日期时间
CURDATE()                          -- 当前日期
CURTIME()                          -- 当前时间
DATE('2024-01-15 10:30:00')        -- '2024-01-15'
TIME('2024-01-15 10:30:00')        -- '10:30:00'
YEAR('2024-01-15')                 -- 2024
MONTH('2024-01-15')                -- 1
DAY('2024-01-15')                  -- 15
HOUR('10:30:00')                   -- 10
DATE_FORMAT(NOW(), '%Y-%m-%d')     -- '2024-01-15'
STR_TO_DATE('2024-01-15', '%Y-%m-%d')
DATE_ADD(NOW(), INTERVAL 7 DAY)    -- 加 7 天
DATE_SUB(NOW(), INTERVAL 1 MONTH)  -- 减 1 月
DATEDIFF('2024-01-15', '2024-01-01')  -- 14
TIMESTAMPDIFF(DAY, '2024-01-01', '2024-01-15')  -- 14
```

### 条件函数

```sql
IF(condition, true_value, false_value)
IFNULL(value, default_value)
NULLIF(value1, value2)  -- value1=value2 返回 NULL，否则返回 value1
COALESCE(v1, v2, v3)    -- 返回第一个非 NULL 值

CASE status
    WHEN 1 THEN '正常'
    WHEN 0 THEN '禁用'
    ELSE '未知'
END

CASE
    WHEN age < 18 THEN '未成年'
    WHEN age < 60 THEN '成年'
    ELSE '老年'
END
```

## 系统命令

```sql
-- 查看状态
SHOW STATUS;
SHOW GLOBAL STATUS LIKE 'Threads%';

-- 查看变量
SHOW VARIABLES;
SHOW VARIABLES LIKE 'max_connections';

-- 查看进程
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;
KILL <process_id>;

-- 查看引擎状态
SHOW ENGINE INNODB STATUS;

-- 查看表大小
SELECT
    table_name,
    ROUND(data_length / 1024 / 1024, 2) AS 'Data MB',
    ROUND(index_length / 1024 / 1024, 2) AS 'Index MB'
FROM information_schema.tables
WHERE table_schema = 'mydb'
ORDER BY data_length DESC;

-- 分析表
ANALYZE TABLE users;

-- 优化表
OPTIMIZE TABLE users;

-- 检查表
CHECK TABLE users;

-- 修复表
REPAIR TABLE users;
```
