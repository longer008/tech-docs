# Kafka 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:Kafka 的核心组件与数据流？
- 标准答案:Producer 将消息写入 Topic 的 Partition；Broker 存储日志段；ISR 维护副本同步；Consumer Group 拉取消息并提交位移；ZooKeeper/KIP-500 时代的 Controller 负责元数据。
- 追问点:分区的作用；leader/follower 选举；日志段与索引文件结构。
- 参考:https://kafka.apache.org/documentation/

### Q2:消息投递语义如何实现？
- 标准答案:最多一次(at most once) 提前提交位移；至少一次(at least once) 先处理后提交；Kafka 通过幂等生产者+事务性消费者可实现准严格意义的 exactly-once（同一 session 内）。
- 追问点:enable.idempotence 与 max.in.flight 的关系；事务性生产者如何设置 isolation.level；EOS 的边界。
- 参考:https://kafka.apache.org/documentation/#semantics

### Q3:分区与副本的规划？
- 标准答案:分区提升并发度与吞吐；副本提高可用性，推荐 RF=3；分区过多带来元数据开销；需结合预估 TPS、消息大小、消费者数。
- 追问点:如何扩分区；顺序性保证(同 key 同分区)；跨机房复制方案。
- 参考:https://kafka.apache.org/documentation/#design

### Q4:生产端可靠性配置？
- 标准答案:acks=all、retries、linger.ms/batch.size 做批量；compression.type 减少带宽；max.in.flight 限制重排；启用 idempotence 保证单分区去重。
- 追问点:消息乱序原因；幂等与事务开销；分区器选择。
- 参考:https://kafka.apache.org/documentation/#producerconfigs

### Q5:消费端位移管理？
- 标准答案:消费组共享 group.id，位移默认存储在 `__consumer_offsets`；自动提交需谨慎，通常手动提交(同步/异步)；rebalance 后由协调者分配分区。
- 追问点:再均衡的触发条件；避免重复消费的策略；按 key 保序消费。
- 参考:https://kafka.apache.org/documentation/#consumerconfigs

### Q6:消费再均衡(Rebalance)过程？
- 标准答案:组协调者 COORDINATOR 管理成员，触发时消费者加入/离开，分配方案 Range/Sticky/Cooperative；在 rebalance 期间暂停消费，提交位移避免重复。
- 追问点:怎样缩短 rebalancing；静态成员 ID；Incremental Cooperative 的优势。
- 参考:https://kafka.apache.org/documentation/#impl_offsetstorage

### Q7:Kafka 如何保证消息有序和持久？
- 标准答案:分区内天然有序；同 key 路由到同一分区；日志追加写+顺序刷盘+页缓存；副本同步 ack 才算成功，`min.insync.replicas` 控制。
- 追问点:跨分区排序无法保证；如何处理副本落后；刷盘策略。
- 参考:https://kafka.apache.org/documentation/#persistence

### Q8:常见压缩与批处理优化？
- 标准答案:支持 gzip/snappy/lz4/zstd；压缩在批级别，批越大压缩效果越好但延迟增加；linger.ms/batch.size/replica.fetch.max.bytes 等参数需要平衡。
- 追问点:消息过大(MTU)的影响；压缩对 CPU 消耗；流式场景的折中。
- 参考:https://kafka.apache.org/documentation/#recordbatch

## 场景/排查
### Q1:消费积压如何快速处理？
- 标准答案:增加分区并水平扩展消费者；临时提高消费批量与并发；禁用耗时操作/写缓存；必要时跳过历史（谨慎）；排查是否因为 Rebalance 或下游阻塞。
- 追问点:位移重置 `kafka-consumer-groups --reset-offsets` 使用；重放风险；限速消费。
- 参考:https://kafka.apache.org/documentation/#basic_ops_consumer_lag

### Q2:消息乱序/重复的排查？
- 标准答案:检查是否同 key；max.in.flight 与重试；多线程消费是否破坏顺序；幂等写入/去重表；事务性生产消费配置。
- 追问点:Exactly-once 在跨系统场景的局限；幂等落库方案；并发度与顺序的权衡。
- 参考:https://kafka.apache.org/documentation/#semantics

## 反问
### Q1:集群版本与 KIP-500 迁移计划？
- 标准答案:了解运维复杂度与新特性支持，确认元数据存储在 ZooKeeper 还是 Kraft。
- 追问点:升级窗口；兼容性测试；安全认证(SASL/ACL)方案。
- 参考:团队内部规范

### Q2:监控与告警指标有哪些？
- 标准答案:确认是否监控生产/消费延迟、ISR 数、UnderReplicatedPartitions、磁盘/网络、控制器健康；是否有自动修复脚本。
- 追问点:容量规划；多租户隔离；消息保留策略。
- 参考:团队内部规范
