# MongoDB 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:文档模型的优点与适用场景？
- 标准答案:使用 BSON 文档存储，天然支持嵌套/数组，减少表连接，适合内容管理、日志、物联网等半结构化数据；模式灵活但需约束以免字段漂移。
- 追问点:何时选择内嵌 vs 参考；文档大小限制(16MB)；模式校验 validator。
- 参考:https://www.mongodb.com/docs/manual/core/data-modeling-introduction/

### Q2:ObjectId 结构与主键策略？
- 标准答案:ObjectId 包含时间戳、机器标识、进程、计数器，按时间递增便于分布式生成；也可用自定义主键（如业务 ID/UUID）但需注意分片键的离散度。
- 追问点:ObjectId 时间可否恢复；自定义 ID 对索引的影响；雪花 ID 热点问题。
- 参考:https://www.mongodb.com/docs/manual/reference/method/ObjectId/

### Q3:常用索引类型与最佳实践？
- 标准答案:单键、复合、稀疏、部分索引、TTL、文本、地理空间；复合索引遵循最左前缀；尽量覆盖查询减少回表；避免过多/低选择性索引。
- 追问点:TTL 实现机制；partial filter expression；前缀/后缀通配对索引影响。
- 参考:https://www.mongodb.com/docs/manual/indexes/

### Q4:复制集的原理？
- 标准答案:主从+仲裁结构，oplog 记录操作，从节点拉取并重放；选主基于优先级/投票/心跳；支持读写分离与故障切换。
- 追问点:writeConcern=majority 的含义；选举时间；hidden/delayed 节点作用。
- 参考:https://www.mongodb.com/docs/manual/replication/

### Q5:分片集群的路由与均衡？
- 标准答案:通过 shard key 将数据划分为 chunk，mongos 负责路由；balancer 迁移 chunk 保持均衡；选择高基数、查询常用的字段做 shard key。
- 追问点:热点 chunk 的问题；分片键一旦确定不可更改；Zone Sharding 场景。
- 参考:https://www.mongodb.com/docs/manual/sharding/

### Q6:聚合管道的核心阶段？
- 标准答案:`$match`→`$project`→`$group`→`$sort`→`$lookup` 等，可组合处理 ETL；尽量将 `$match`/$project 放前以利用索引；注意大管道内存限制。
- 追问点:$facet/$bucket；pipeline 性能优化；与 map-reduce 的差异。
- 参考:https://www.mongodb.com/docs/manual/aggregation/

### Q7:写关注与读关注？
- 标准答案:writeConcern 控制写入确认级别(ack/majority/journaled)；readConcern 控制读取隔离(local/majority/snapshot)；选择影响一致性与延迟。
- 追问点:事务中的默认值；majority 与偶发脏读；何时使用 linearizable。
- 参考:https://www.mongodb.com/docs/manual/reference/write-concern/

### Q8:多文档事务？
- 标准答案:4.0+ 支持复制集，4.2+ 支持分片事务；基于两阶段提交，适合强一致小范围操作；成本高于单文档，需要谨慎使用。
- 追问点:事务超时与锁粒度；与幂等/补偿的取舍；retryable writes。
- 参考:https://www.mongodb.com/docs/manual/core/transactions/

## 场景/排查
### Q1:查询变慢，如何调优？
- 标准答案:使用 `explain()` 查看执行计划；确保过滤/排序字段有索引；避免 `$where`、大 `$in`；控制返回字段；必要时增加覆盖索引或重写聚合；查看是否触发 COLLSCAN。
- 追问点:热点集中文档导致锁争用；wiredTiger cache 命中率；索引统计信息。
- 参考:https://www.mongodb.com/docs/manual/tutorial/analyze-query-plan/

### Q2:分片热点如何缓解？
- 标准答案:选择高离散度 shard key 或使用 hashed key；启用 zone sharding 把热点放高配分片；预分片/手动 split chunk；增加写入随机性。
- 追问点:chunk 迁移对业务的影响；平衡器时间窗口；shard key 变更迁移方案。
- 参考:https://www.mongodb.com/docs/manual/core/sharded-cluster-high-availability/

## 反问
### Q1:当前使用复制集还是分片？监控/备份方案？
- 标准答案:了解规模与可靠性保障，确认备份/灾备及恢复演练。
- 追问点:oplog 大小配置；延迟指标；压测基线。
- 参考:团队内部规范

### Q2:Schema 规范与版本管理方式？
- 标准答案:确认是否有 schema 校验、迁移策略(Mongoose Migration/脚本)；避免字段漂移。
- 追问点:多语言客户端的兼容性；灰度发布策略。
- 参考:团队内部规范
