# Redis 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:Redis 常用数据结构与典型场景？
- 标准答案:String(缓存/计数)、Hash(对象缓存)、List(队列/时间线)、Set(去重/标签)、ZSet(排行榜/延时队列)、Bitmap/HyperLogLog/Bloom/Stream 等；根据操作复杂度选择合适结构。
- 追问点:何时用 ZSet 而非 List；HyperLogLog 误差；Stream 消费模式。
- 参考:https://redis.io/docs/data-types/

### Q2:RDB 与 AOF 的区别及配置？
- 标准答案:RDB 定期快照，文件小恢复快但可能丢最近数据；AOF 追加日志，安全性高，可选 everysec/always；常用混合持久化；需要定期 rewrite 以控制文件大小。
- 追问点:重写触发条件；AOF 损坏修复；持久化对性能的影响。
- 参考:https://redis.io/docs/management/persistence/

### Q3:缓存穿透/击穿/雪崩的处理？
- 标准答案:穿透→布隆过滤/空值缓存；击穿→热点 key 加互斥锁/逻辑过期；雪崩→过期时间随机化、分批重建、限流降级。
- 追问点:双写一致性策略；防止击穿的互斥实现；后台异步刷新。
- 参考:https://redis.io/docs/manual/programmability/

### Q4:过期与淘汰策略？
- 标准答案:过期检查采用定期+惰性；内存不足时触发淘汰策略：noeviction、volatile-ttl/lru/lfu、allkeys-lru/lfu/random；推荐缓存场景用 allkeys-lru/lfu。
- 追问点:lfu 参数含义；大 key 对淘汰的影响；如何观测命中率。
- 参考:https://redis.io/docs/reference/eviction/

### Q5:事务与 Lua 脚本？
- 标准答案:事务基于 MULTI/EXEC 无隔离，无法回滚单条错误；Lua 脚本原子执行，减少网络往返并保证一致性；注意脚本运行时间避免阻塞。
- 追问点:WATCH 乐观锁；脚本缓存；超时中断。
- 参考:https://redis.io/docs/manual/transactions/

### Q6:主从复制、哨兵与集群？
- 标准答案:主从异步复制，支持部分重同步；哨兵负责监控与故障转移；Cluster 使用哈希槽 16384 分片支持水平扩展，限制多 key 需同槽或使用 hash tag。
- 追问点:复制延迟与读写分离一致性；集群扩容流程；故障转移窗口。
- 参考:https://redis.io/docs/management/scaling/

### Q7:Redis 单线程模型与性能优化？
- 标准答案:命令处理单线程但 I/O 多路复用；避免阻塞命令(大 keys、慢 Lua、Keys/Flushall)；可通过 pipeline、批量、client-side caching、开启多线程 I/O(6.0+) 提升吞吐。
- 追问点:慢查询日志；bigkey 风险识别；为什么仍然高性能。
- 参考:https://redis.io/docs/interact/programmability/pipeline/

### Q8:常见内存问题？
- 标准答案:bigkey 占用、冷数据未淘汰、序列化过大、热 key 导致复制或网络瓶颈；需监控 used_memory、fragmentation_ratio，配合热点探测与压缩。
- 追问点:jemalloc 碎片；cluster 下热 key 分布；对象编码优化。
- 参考:https://redis.io/docs/management/optimization/memory-optimization/

## 场景/排查
### Q1:热点 key 导致 QPS 抖动，如何缓解？
- 标准答案:启用本地缓存/客户端缓存；增加副本并用读写分离但注意一致性；使用分片 hash tag 分散；加逻辑过期与异步刷新；必要时前置 CDN。
- 追问点:一致性策略；Snowflake 热点 ID；队列化重建。
- 参考:https://redis.io/docs/management/scaling/

### Q2:Redis 响应变慢的排查步骤？
- 标准答案:查看慢查询日志；info stats/commandstats 判断阻塞命令；检查 CPU/网络/磁盘；确认是否在做 RDB/AOF rewrite；监控 keys evicted 命中率。
- 追问点:同步刷盘导致的抖动；网络包长/小包; pipeline 与事务对 RTT 的影响。
- 参考:https://redis.io/docs/management/optimization/

## 反问
### Q1:缓存更新策略与一致性要求？
- 标准答案:确认是 Cache Aside/Read-Through/Write-Through/Write-Behind；了解允许的脏读窗口和降级策略。
- 追问点:双写方案；失效通知；全量/增量预热。
- 参考:团队内部规范

### Q2:Redis 运维与监控体系？
- 标准答案:了解是否有哨兵/集群自动化、备份、版本升级策略；监控指标与告警阈值。
- 追问点:容量规划；多租户隔离；安全访问控制。
- 参考:团队内部规范
