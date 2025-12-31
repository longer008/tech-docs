# MySQL

## 元信息
- 定位与场景：主流关系型数据库，适用于事务性与结构化数据。
- 版本范围：关注主流版本升级差异与兼容性。
- 相关生态：ORM（MyBatis/JPA）、读写分离、分库分表。

## 研究记录（Exa）
- 查询 1："MySQL interview questions 2024 2025"
- 查询 2："MySQL best practices documentation"
- 查询 3："MySQL architecture diagram"
- 来源摘要：已建立示例结构，内容需按来源更新为最新版本。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：事务的 ACID 含义？
  - A：原子性、一致性、隔离性、持久性。
- Q2：常见隔离级别与脏读/不可重复读/幻读的关系？
  - A：隔离级别越高并发性越低，需平衡一致性与性能。
- Q3：索引的原理与常见类型？
  - A：B+Tree 索引、主键索引、唯一索引、联合索引。
- Q4：InnoDB 与 MyISAM 的差异？
  - A：InnoDB 支持事务与行级锁，MyISAM 不支持事务且多为表级锁。
- Q5：`EXPLAIN` 的基本用途？
  - A：查看执行计划，判断是否走索引与扫描范围。

### 进阶/场景题
- Q1：如何为高频查询设计联合索引？
  - A：遵循最左前缀原则，覆盖查询字段，避免回表。
- Q2：如何处理死锁与长事务？
  - A：缩短事务、避免并发更新热点、保证访问顺序一致。

### 避坑指南
- 隐式类型转换导致索引失效。
- 未命中索引导致全表扫描与慢查询。
- 长事务造成锁等待与复制延迟。
- 使用 `SELECT *` 导致 IO 放大。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- MySQL 官方文档： https://dev.mysql.com/doc/
- InnoDB 引擎文档： https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html
```

### 常用代码片段
```sql
-- 建表示例
CREATE TABLE user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL,
  email VARCHAR(128) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- 事务示例
START TRANSACTION;
UPDATE user SET name = 'a' WHERE id = 1;
COMMIT;

-- 执行计划
EXPLAIN SELECT * FROM user WHERE name = 'a';
```

### 版本差异
- 关注 SQL 模式、默认参数与新特性变化。
- 版本升级前需阅读 release notes 与兼容性说明。
