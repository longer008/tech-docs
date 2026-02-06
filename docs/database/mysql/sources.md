# MySQL 学习资源

> 更新时间：2025-02

## 目录导航

- [官方资源](#官方资源)
- [学习教程](#学习教程)
- [工具推荐](#工具推荐)
- [实战项目](#实战项目)
- [社区资源](#社区资源)
- [MCP 查询记录](#mcp-查询记录)

---

## 官方资源

### 文档

- [MySQL 官方文档](https://dev.mysql.com/doc/) - 最权威的 MySQL 文档
- [MySQL 8.0 参考手册](https://dev.mysql.com/doc/refman/8.0/en/) - MySQL 8.0 完整文档
- [MySQL 8.4 参考手册](https://dev.mysql.com/doc/refman/8.4/en/) - MySQL 8.4 LTS 文档
- [InnoDB 存储引擎](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html) - InnoDB 详细文档
- [MySQL 性能优化](https://dev.mysql.com/doc/refman/8.0/en/optimization.html) - 性能优化指南

### 下载

- [MySQL 下载](https://dev.mysql.com/downloads/) - 官方下载页面
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) - 社区版下载
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) - 官方 GUI 工具

---

## 学习教程

### 入门教程

- [MySQL 官方教程](https://dev.mysql.com/doc/mysql-tutorial-excerpt/8.0/en/) - 官方入门教程
- [MySQL 菜鸟教程](https://www.runoob.com/mysql/mysql-tutorial.html) - 中文入门教程
- [MySQL 教程 - W3Schools](https://www.w3schools.com/mysql/) - 交互式教程
- [MySQL 基础教程](https://www.mysqltutorial.org/) - 系统化教程

### 进阶教程

- [High Performance MySQL](https://www.oreilly.com/library/view/high-performance-mysql/9781492080503/) - 高性能 MySQL（第 4 版）
- [MySQL 技术内幕：InnoDB 存储引擎](https://book.douban.com/subject/24708143/) - 深入理解 InnoDB
- [MySQL 实战 45 讲](https://time.geekbang.org/column/intro/139) - 极客时间课程
- [MySQL 是怎样运行的](https://book.douban.com/subject/35231266/) - 从根儿上理解 MySQL

### 视频课程

- [MySQL 数据库教程](https://www.bilibili.com/video/BV1Kr4y1i7ru) - B站中文教程
- [MySQL Database Tutorial](https://www.youtube.com/watch?v=7S_tz1z_5bA) - YouTube 英文教程
- [MySQL for Developers](https://planetscale.com/courses/mysql-for-developers) - PlanetScale 课程

---

## 工具推荐

### GUI 工具

- [MySQL Workbench](https://www.mysql.com/products/workbench/) - 官方 GUI 工具
- [Navicat](https://www.navicat.com/en/products/navicat-for-mysql) - 强大的数据库管理工具
- [DBeaver](https://dbeaver.io/) - 免费开源的数据库工具
- [phpMyAdmin](https://www.phpmyadmin.net/) - Web 界面管理工具
- [Sequel Pro](https://www.sequelpro.com/) - macOS 专用工具
- [TablePlus](https://tableplus.com/) - 现代化数据库工具

### 命令行工具

- [mycli](https://www.mycli.net/) - MySQL 命令行客户端（支持自动补全）
- [pt-query-digest](https://www.percona.com/doc/percona-toolkit/LATEST/pt-query-digest.html) - 慢查询分析工具
- [mysqldumpslow](https://dev.mysql.com/doc/refman/8.0/en/mysqldumpslow.html) - 慢查询日志分析
- [mysqltuner](https://github.com/major/MySQLTuner-perl) - MySQL 性能调优脚本

### 监控工具

- [Prometheus + Grafana](https://prometheus.io/) - 监控和可视化
- [Percona Monitoring and Management](https://www.percona.com/software/database-tools/percona-monitoring-and-management) - PMM 监控平台
- [MySQL Enterprise Monitor](https://www.mysql.com/products/enterprise/monitor.html) - 官方企业监控
- [Zabbix](https://www.zabbix.com/) - 开源监控系统

### 备份工具

- [mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) - 官方备份工具
- [Percona XtraBackup](https://www.percona.com/software/mysql-database/percona-xtrabackup) - 热备份工具
- [mydumper](https://github.com/mydumper/mydumper) - 多线程备份工具

---

## 实战项目

### 开源项目

- [MySQL Server](https://github.com/mysql/mysql-server) - MySQL 服务器源码
- [Vitess](https://vitess.io/) - MySQL 水平扩展方案
- [ProxySQL](https://proxysql.com/) - MySQL 代理和负载均衡
- [Orchestrator](https://github.com/openark/orchestrator) - MySQL 高可用管理
- [gh-ost](https://github.com/github/gh-ost) - GitHub 的在线表结构变更工具

### 中间件

- [MyCAT](http://www.mycat.org.cn/) - 数据库分库分表中间件
- [Sharding-JDBC](https://shardingsphere.apache.org/) - 分布式数据库中间件
- [Atlas](https://github.com/Qihoo360/Atlas) - 360 开源的 MySQL 代理

### ORM 框架

**Java**：
- [MyBatis](https://mybatis.org/) - 持久层框架
- [Hibernate](https://hibernate.org/) - JPA 实现
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa) - Spring 数据访问

**Python**：
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python ORM
- [Django ORM](https://docs.djangoproject.com/en/stable/topics/db/) - Django 内置 ORM
- [Peewee](http://docs.peewee-orm.com/) - 轻量级 ORM

**Node.js**：
- [Sequelize](https://sequelize.org/) - Node.js ORM
- [TypeORM](https://typeorm.io/) - TypeScript ORM
- [Prisma](https://www.prisma.io/) - 现代化 ORM

---

## 社区资源

### 问答社区

- [Stack Overflow - MySQL](https://stackoverflow.com/questions/tagged/mysql) - MySQL 标签
- [MySQL 中文社区](https://learnku.com/mysql) - 中文问答社区
- [DBA Stack Exchange](https://dba.stackexchange.com/questions/tagged/mysql) - 数据库管理员社区
- [Reddit r/mysql](https://www.reddit.com/r/mysql/) - MySQL 讨论区

### 技术博客

- [MySQL Server Blog](https://mysqlserverteam.com/) - 官方博客
- [Percona Blog](https://www.percona.com/blog/) - Percona 技术博客
- [Planet MySQL](https://planet.mysql.com/) - MySQL 博客聚合
- [MySQL High Availability](https://mysqlhighavailability.com/) - 高可用博客

### 社交媒体

- [Twitter @MySQL](https://twitter.com/MySQL) - 官方 Twitter
- [MySQL 官方微博](https://weibo.com/mysql) - 官方微博
- [MySQL Facebook](https://www.facebook.com/MySQL/) - 官方 Facebook

### 会议和活动

- [Percona Live](https://www.percona.com/live/) - Percona 技术大会
- [MySQL Connect](https://www.oracle.com/mysql/connect/) - Oracle MySQL 大会
- [FOSDEM MySQL Track](https://fosdem.org/) - 欧洲开源大会 MySQL 专场

---

## MCP 查询记录

### 查询信息

- **查询时间**：2025-02-04
- **Library ID**：`/websites/dev_mysql_doc_refman_9_4_en`
- **代码示例数量**：19896 个

### 关键发现

1. **存储引擎**：
   - InnoDB：默认引擎，支持事务、行级锁、外键
   - MyISAM：不支持事务，表级锁，查询快
   - 选择：事务场景用 InnoDB，只读场景可用 MyISAM

2. **索引原理**：
   - B+Tree 索引结构
   - 最左前缀原则
   - 覆盖索引避免回表
   - 索引失效场景（函数、类型转换、LIKE 通配符）

3. **事务与锁**：
   - ACID 特性
   - 4 种隔离级别（默认 REPEATABLE READ）
   - 行级锁 vs 表级锁
   - 死锁检测和避免

4. **查询优化**：
   - EXPLAIN 执行计划分析
   - 慢查询日志
   - 避免全表扫描
   - 批量操作代替逐条操作

5. **性能调优**：
   - InnoDB 缓冲池配置
   - 连接数优化
   - 表分区
   - 主从复制和读写分离

### 学习路线

**初级（1-2 个月）**：
- 掌握 SQL 基础（DDL、DML、DQL）
- 理解数据类型和表设计
- 学习索引基础
- 熟悉事务和锁

**中级（2-3 个月）**：
- 深入理解索引原理
- 掌握查询优化技巧
- 学习 EXPLAIN 分析
- 理解 InnoDB 存储引擎

**高级（3-6 个月）**：
- 掌握性能调优
- 学习主从复制和高可用
- 理解分库分表
- 实践大规模数据处理

---

## 书籍推荐

### 入门书籍

- 《MySQL 必知必会》- Ben Forta
- 《MySQL 从入门到精通》- 明日科技
- 《SQL 基础教程》- MICK

### 进阶书籍

- 《高性能 MySQL》（第 4 版）- Baron Schwartz
- 《MySQL 技术内幕：InnoDB 存储引擎》- 姜承尧
- 《MySQL 是怎样运行的》- 小孩子

### 专题书籍

- 《数据库索引设计与优化》- Tapio Lahdenmaki
- 《MySQL 排错指南》- Sveta Smirnova
- 《MySQL 管理之道》- 贺春旸

---

## 常见问题

### 1. 如何选择存储引擎？

- **InnoDB**：需要事务支持、高并发、数据一致性要求高
- **MyISAM**：只读或读多写少、不需要事务、对查询性能要求高

### 2. 如何设计索引？

- 选择性高的列建索引
- 联合索引遵循最左前缀原则
- 避免过多索引（影响写入性能）
- 使用覆盖索引避免回表

### 3. 如何优化慢查询？

- 使用 EXPLAIN 分析执行计划
- 添加合适的索引
- 避免 SELECT *
- 使用 LIMIT 限制结果集
- 批量操作代替逐条操作

### 4. 如何避免死锁？

- 按相同顺序访问资源
- 缩短事务时间
- 降低事务隔离级别
- 使用乐观锁代替悲观锁

### 5. 如何实现高可用？

- 主从复制
- 读写分离
- 双主架构
- MHA/MMM 高可用方案
- MySQL Group Replication

---

> 本文档整理了 MySQL 的官方资源、学习教程、工具推荐、实战项目和社区资源，并记录了 MCP Context7 的查询结果（19896 个代码示例）。建议按照学习路线循序渐进，结合实战项目加深理解。

