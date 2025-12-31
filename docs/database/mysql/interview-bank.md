# MySQL 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:ACID 分别指什么？MySQL 如何实现？
- 标准答案:原子性(undo 日志/回滚)、一致性(约束/日志保证从一致状态到一致状态)、隔离性(锁+MVCC)、持久性(redolog 刷盘与双写缓冲)；InnoDB 通过 redo/undo、两阶段提交保障。
- 追问点:binlog 与 redo 的写入顺序；崩溃恢复流程；隔离级别对幻读的影响。
- 参考:https://dev.mysql.com/doc/refman/8.0/en/acid.html

### Q2:常见索引类型与最左前缀规则？
- 标准答案:B+Tree 索引、哈希索引(MEMORY)、全文索引；联合索引遵循最左前缀，可匹配前缀列或范围前部分；覆盖索引减少回表。
- 追问点:like 前缀/模糊匹配差异；函数/隐式转换导致索引失效；前缀索引的利弊。
- 参考:https://dev.mysql.com/doc/refman/8.0/en/mysql-indexes.html

### Q3:InnoDB 与 MyISAM 的差异？
- 标准答案:InnoDB 支持事务、行级锁、MVCC、崩溃恢复、聚簇索引；MyISAM 只有表锁、无事务/外键，读多写少但已不推荐；默认存储引擎为 InnoDB。
- 追问点:表空间文件管理；全文索引支持；为什么 MyISAM 不支持外键。
- 参考:https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html

### Q4:`EXPLAIN` 关键字段含义？
- 标准答案:type(访问类型)、possible_keys/key/key_len、rows、filtered、Extra(Using index/where/filesort/temp等)；用于判断是否走索引/排序/回表。
- 追问点:ref vs eq_ref；range 与 index 的差异；rows 估算的依据。
- 参考:https://dev.mysql.com/doc/refman/8.0/en/explain-output.html

### Q5:事务隔离级别及幻读处理？
- 标准答案:读未提交、读已提交、可重复读(默认)、串行化；InnoDB 通过 MVCC + 间隙锁/Next-Key Lock 防止幻读；RC 下不会加间隙锁。
- 追问点:一致性读与当前读；加锁读语句；幻读与不可重复读区别。
- 参考:https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html

### Q6:锁类型与加锁场景？
- 标准答案:表锁/行锁；共享锁(S)/排他锁(X)；意向锁；间隙锁/Next-Key Lock；自增锁；DDL metadata lock；InnoDB 在索引上加锁。
- 追问点:覆盖索引是否减少加锁范围；死锁检测与等待超时；锁升级。
- 参考:https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html

### Q7:慢查询优化思路？
- 标准答案:通过慢日志/Performance Schema 定位；分析执行计划；添加/调整索引；重写 SQL 避免函数/隐式转换；分表分库或缓存；限制返回列与行数。
- 追问点:limit 大偏移优化；批量更新的拆分；统计信息过期的影响。
- 参考:https://dev.mysql.com/doc/refman/8.0/en/slow-query-log.html

### Q8:主从复制的流程与延迟原因？
- 标准答案:主写 binlog→从库 IO 线程拉取为 relay log→SQL 线程重放；延迟多因大事务、从库性能不足、单线程重放；可用多线程复制或基于 GTID/并行复制缓解。
- 追问点:半同步复制；延迟监控与补偿策略；故障切换一致性。
- 参考:https://dev.mysql.com/doc/refman/8.0/en/replication.html

## 场景/排查
### Q1:出现死锁如何处理？
- 标准答案:查看 `SHOW ENGINE INNODB STATUS` 或 performance_schema.events_transactions_current 获取死锁图；找出冲突 SQL 与索引扫描范围；调整索引/访问顺序/粒度；必要时缩短事务。
- 追问点:设置 `innodb_lock_wait_timeout` 的影响；如何通过业务重试化解；避免大范围范围锁。
- 参考:https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlocks.html

### Q2:线上查询突然变慢的排查步骤？
- 标准答案:检查执行计划是否改变（统计信息/索引失效）；观察锁等待；查看 buffer pool 命中率与磁盘 IO；确认是否发生自增主键热点或大查询；必要时回滚变更。
- 追问点:Auto_increment 锁热点解决方案；分析 handler 计数；CPU/IO 瓶颈区分。
- 参考:https://dev.mysql.com/doc/refman/8.0/en/server-status-variables.html

## 反问
### Q1:数据库容量与分库分表策略？
- 标准答案:了解现有规模与规划，确认是否有中间件（ShardingSphere/MyCat）或自研方案。
- 追问点:跨分片事务；全局唯一 ID 方案；热点分布。
- 参考:团队内部规范

### Q2:备份恢复与容灾级别？
- 标准答案:确认是否有定期全量+增量备份、延迟从库、异地多活；RPO/RTO 目标。
- 追问点:演练频率；数据脱敏；备份校验。
- 参考:团队内部规范
