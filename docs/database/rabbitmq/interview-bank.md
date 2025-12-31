# RabbitMQ 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:Exchange 类型与路由规则？
- 标准答案:Direct(精确匹配 routing key)、Fanout(广播)、Topic(通配符 `*/#`)、Headers(匹配 header)；消息先到 Exchange 再根据 Binding 路由到 Queue。
- 追问点:Topic 通配符使用场景；重复绑定的效果；默认交换机 `""`。
- 参考:https://www.rabbitmq.com/tutorials/amqp-concepts.html

### Q2:消息确认机制？
- 标准答案:生产端 confirm 模式异步确认；事务模式较少用；消费端 ack/nack/requeue 控制交付；未 ack 的消息在连接断开后重投。
- 追问点:批量 confirm；幂等消费；拒绝与死信的关系。
- 参考:https://www.rabbitmq.com/confirms.html

### Q3:持久化与可靠性？
- 标准答案:队列 durable、消息持久化 `delivery_mode=2`、交换机 durable；但仍需 producer confirm + 手动 ack 才能保证不丢；镜像/仲裁队列保证高可用。
- 追问点:磁盘节点概念；仲裁队列(quorum)与经典镜像差异；持久化对性能影响。
- 参考:https://www.rabbitmq.com/persistence-conf.html

### Q4:QoS 与流控？
- 标准答案:basic.qos `prefetch` 限制未确认消息数，避免单消费者被压死；流控包含内存/磁盘水位，超限会阻塞生产端。
- 追问点:全局与信道级 prefetch；公平调度；背压表现。
- 参考:https://www.rabbitmq.com/consumer-prefetch.html

### Q5:死信队列(DLX)的用途？
- 标准答案:消息被拒绝且不重入、过期 TTL、队列满或长度溢出时进入 DLX；可用于延迟/重试/监控；需在原队列上设置 DLX 与 routing key。
- 追问点:延迟队列实现方式（TTL+DLX、插件 x-delayed-message）；重试退避策略。
- 参考:https://www.rabbitmq.com/dlx.html

### Q6:延迟队列实现方案？
- 标准答案:官方延迟插件 `rabbitmq_delayed_message_exchange`；或通过消息/队列 TTL + DLX 组合；注意 TTL 精度与堆积造成的卡点。
- 追问点:插件部署权限；海量延迟消息的内存占用；分级队列。
- 参考:https://github.com/rabbitmq/rabbitmq-delayed-message-exchange

### Q7:RabbitMQ 集群模式？
- 标准答案:普通集群仅同步元数据；镜像队列(经典)全量复制消息但开销大；仲裁队列基于 Raft，推荐新版本使用；Federation/Shovel 用于跨区域转发。
- 追问点:仲裁队列 quorum 参数；磁盘节点作用；跨机房部署。
- 参考:https://www.rabbitmq.com/clustering.html

### Q8:常见消息顺序与重复问题？
- 标准答案:同队列可保证顺序，但多消费者会并行消费；保证顺序需单消费者或按 key 分区队列；重复消费需业务幂等/去重表/唯一键。
- 追问点:事务消息需求；消费者幂等策略；手动 ack 顺序。
- 参考:https://www.rabbitmq.com/consumers.html

## 场景/排查
### Q1:队列积压如何处理？
- 标准答案:查看 channel/connection 状态，确认消费者是否断连；调整 prefetch 提升并发；增加消费者或分区队列；对无用消息丢弃或缩短 TTL；避免大批量延迟消息阻塞。
- 追问点:镜像队列造成的开销；磁盘水位触发；限流/拒绝策略。
- 参考:https://www.rabbitmq.com/troubleshooting.html

### Q2:消息丢失/重复排查？
- 标准答案:检查生产端 confirm 是否开启；队列/消息是否持久化；消费者是否手动 ack；DLX 是否配置；记录消息 ID 做幂等；关注节点宕机时的行为。
- 追问点:网络分区导致的脑裂；仲裁队列恢复流程；监控指标。
- 参考:https://www.rabbitmq.com/reliability.html

## 反问
### Q1:业务对延迟与可靠性的优先级？
- 标准答案:区分交易/通知等场景，确定是追求低延迟还是强可靠从而选择仲裁/镜像/简单队列。
- 追问点:可接受的丢失率；重试策略；容量规划。
- 参考:团队内部规范

### Q2:统一的消息规范与追踪？
- 标准答案:确认是否有消息格式、幂等 ID、traceId 注入、重试/死信处理约定，方便接入。
- 追问点:监控与报警；审计需求；跨系统链路追踪工具。
- 参考:团队内部规范
