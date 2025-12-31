# Kafka 面试题集

> Kafka 消息队列核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. Kafka 核心概念

```
┌─────────────────────────────────────────────────────────────┐
│                      Kafka 架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Producer                                                   │
│      │                                                       │
│      ▼                                                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                    Kafka Cluster                     │   │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │   │
│   │  │ Broker1 │  │ Broker2 │  │ Broker3 │             │   │
│   │  │         │  │         │  │         │             │   │
│   │  │ Topic A │  │ Topic A │  │ Topic A │             │   │
│   │  │ P0(L)   │  │ P1(L)   │  │ P2(L)   │             │   │
│   │  │ P1(F)   │  │ P2(F)   │  │ P0(F)   │             │   │
│   │  └─────────┘  └─────────┘  └─────────┘             │   │
│   └─────────────────────────────────────────────────────┘   │
│      │                                                       │
│      ▼                                                       │
│   Consumer Group                                             │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│   │Consumer1 │ │Consumer2 │ │Consumer3 │                   │
│   │   P0     │ │   P1     │ │   P2     │                   │
│   └──────────┘ └──────────┘ └──────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

| 概念 | 说明 |
|------|------|
| Broker | Kafka 服务节点 |
| Topic | 消息主题，逻辑分类 |
| Partition | 分区，Topic 的物理分片 |
| Replica | 副本，Leader + Follower |
| Producer | 消息生产者 |
| Consumer | 消息消费者 |
| Consumer Group | 消费者组，实现负载均衡 |
| Offset | 消息偏移量，标识消费位置 |

---

#### 2. 生产者机制

```java
// Java Producer 示例
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

// ACK 配置
props.put("acks", "all");  // 0, 1, all
props.put("retries", 3);
props.put("retry.backoff.ms", 100);

// 批量发送
props.put("batch.size", 16384);
props.put("linger.ms", 5);
props.put("buffer.memory", 33554432);

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

// 发送消息
ProducerRecord<String, String> record = new ProducerRecord<>("topic", "key", "value");

// 异步发送
producer.send(record, (metadata, exception) -> {
    if (exception != null) {
        exception.printStackTrace();
    } else {
        System.out.println("Partition: " + metadata.partition() + ", Offset: " + metadata.offset());
    }
});

// 同步发送
Future<RecordMetadata> future = producer.send(record);
RecordMetadata metadata = future.get();

producer.close();
```

**分区策略：**
```java
// 1. 指定分区
new ProducerRecord<>("topic", 0, "key", "value");

// 2. 按 Key 哈希
new ProducerRecord<>("topic", "key", "value");
// partition = hash(key) % numPartitions

// 3. 轮询（无 Key）
new ProducerRecord<>("topic", "value");

// 4. 自定义分区器
public class CustomPartitioner implements Partitioner {
    @Override
    public int partition(String topic, Object key, byte[] keyBytes,
                         Object value, byte[] valueBytes, Cluster cluster) {
        List<PartitionInfo> partitions = cluster.partitionsForTopic(topic);
        int numPartitions = partitions.size();
        // 自定义逻辑
        return key.hashCode() % numPartitions;
    }
}
```

**ACK 机制：**
| acks | 说明 | 可靠性 | 性能 |
|------|------|--------|------|
| 0 | 不等待确认 | 最低 | 最高 |
| 1 | Leader 确认 | 中等 | 中等 |
| all/-1 | 所有 ISR 确认 | 最高 | 最低 |

---

#### 3. 消费者机制

```java
// Java Consumer 示例
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("group.id", "my-group");
props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

// 消费配置
props.put("enable.auto.commit", "false");  // 手动提交
props.put("auto.offset.reset", "earliest"); // earliest, latest, none
props.put("max.poll.records", 500);
props.put("max.poll.interval.ms", 300000);

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Arrays.asList("topic1", "topic2"));

try {
    while (true) {
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));

        for (ConsumerRecord<String, String> record : records) {
            System.out.printf("partition=%d, offset=%d, key=%s, value=%s%n",
                record.partition(), record.offset(), record.key(), record.value());

            // 处理消息
            processMessage(record);
        }

        // 手动提交
        consumer.commitSync();  // 同步提交
        // consumer.commitAsync();  // 异步提交
    }
} finally {
    consumer.close();
}
```

**消费者组与分区分配：**
```
Consumer Group A (3 consumers)
├── Consumer1 → Partition 0, 1
├── Consumer2 → Partition 2, 3
└── Consumer3 → Partition 4, 5

Consumer Group B (2 consumers)
├── Consumer1 → Partition 0, 1, 2
└── Consumer2 → Partition 3, 4, 5

规则：
- 一个分区只能被同组的一个消费者消费
- 消费者数量 > 分区数量时，多余消费者空闲
```

**分区分配策略：**
| 策略 | 说明 |
|------|------|
| RangeAssignor | 按范围分配（默认） |
| RoundRobinAssignor | 轮询分配 |
| StickyAssignor | 粘性分配，减少重分配 |
| CooperativeStickyAssignor | 协作式粘性分配 |

---

#### 4. 消息可靠性

```
┌─────────────────────────────────────────────────────────────┐
│                    消息可靠性保证                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  生产端：                                                    │
│  1. acks=all                                                │
│  2. retries > 0                                             │
│  3. max.in.flight.requests.per.connection=1（保证顺序）     │
│  4. 幂等性（enable.idempotence=true）                       │
│                                                              │
│  Broker 端：                                                │
│  1. replication.factor >= 3                                 │
│  2. min.insync.replicas >= 2                                │
│  3. unclean.leader.election.enable=false                    │
│                                                              │
│  消费端：                                                    │
│  1. enable.auto.commit=false                                │
│  2. 手动提交 offset                                         │
│  3. 幂等性消费                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**幂等性生产者：**
```java
// 开启幂等性
props.put("enable.idempotence", true);
// 自动设置：acks=all, retries=Integer.MAX_VALUE

// 原理：Producer ID + Sequence Number
// Broker 检测重复消息并去重
```

**事务消息：**
```java
props.put("transactional.id", "my-transactional-id");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);
producer.initTransactions();

try {
    producer.beginTransaction();

    producer.send(new ProducerRecord<>("topic1", "key", "value1"));
    producer.send(new ProducerRecord<>("topic2", "key", "value2"));

    // 提交消费者 offset（消费-生产原子性）
    producer.sendOffsetsToTransaction(offsets, consumerGroupId);

    producer.commitTransaction();
} catch (Exception e) {
    producer.abortTransaction();
}
```

---

#### 5. 消息顺序性

```
保证消息顺序的条件：
1. 单分区内有序（Kafka 只保证分区内有序）
2. 单生产者
3. max.in.flight.requests.per.connection=1
   或 enable.idempotence=true（允许 5 个未确认请求）

场景实现：
┌─────────────────────────────────────────┐
│  需要全局有序：使用单分区（牺牲性能）   │
│  需要业务有序：按业务 ID 分区           │
└─────────────────────────────────────────┘
```

```java
// 按用户 ID 分区，保证同一用户消息有序
producer.send(new ProducerRecord<>("orders", userId, orderJson));
```

---

### 进阶题

#### 6. 高可用机制

**副本机制：**
```
┌─────────────────────────────────────────────────────────────┐
│                    副本同步机制                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Partition 0                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Leader (Broker 1)                                   │   │
│  │  [0][1][2][3][4][5][6][7][8][9]                     │   │
│  │                          ↑ HW (High Watermark)      │   │
│  │                              ↑ LEO (Log End Offset) │   │
│  └─────────────────────────────────────────────────────┘   │
│                    │                                        │
│         ┌─────────┴─────────┐                              │
│         ▼                   ▼                              │
│  ┌─────────────┐     ┌─────────────┐                       │
│  │ Follower 1  │     │ Follower 2  │                       │
│  │ [0][1][2]   │     │ [0][1][2][3]│                       │
│  │ (ISR)       │     │ (ISR)       │                       │
│  └─────────────┘     └─────────────┘                       │
│                                                              │
│  ISR: In-Sync Replicas（同步副本集合）                      │
│  HW: 消费者可见的最大 offset                                │
│  LEO: 每个副本的最新 offset                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Leader 选举：**
```
1. Controller 监控 Broker 状态
2. Leader 失效时，从 ISR 中选择新 Leader
3. 优先选择 replica.lag.time.max.ms 内同步的副本

配置：
- unclean.leader.election.enable=false
  禁止从 OSR 中选举（避免数据丢失）
```

---

#### 7. 存储机制

**日志结构：**
```
topic-partition/
├── 00000000000000000000.log      # 数据文件
├── 00000000000000000000.index    # 偏移量索引
├── 00000000000000000000.timeindex # 时间戳索引
├── 00000000000000368769.log
├── 00000000000000368769.index
├── 00000000000000368769.timeindex
└── leader-epoch-checkpoint
```

**零拷贝：**
```
传统方式：
磁盘 → 内核缓冲区 → 用户缓冲区 → Socket 缓冲区 → 网卡

零拷贝（sendfile）：
磁盘 → 内核缓冲区 → 网卡

优势：减少数据拷贝和上下文切换
```

**日志清理：**
```bash
# 配置
log.retention.hours=168          # 保留 7 天
log.retention.bytes=-1           # 不限制大小
log.segment.bytes=1073741824     # 段文件大小 1GB
log.cleanup.policy=delete        # delete 或 compact

# 日志压缩（compact）
# 保留每个 key 的最新值
key1: v1 → v2 → v3  => key1: v3
key2: v1 → v2       => key2: v2
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "Kafka 保证全局有序" | 只保证分区内有序 |
| "消费者数量越多越好" | 不能超过分区数量 |
| "acks=1 就够安全了" | 高可靠需要 acks=all |
| "消息不会丢失" | 需要正确配置才能保证 |
| "Kafka 只能用于日志收集" | 可用于事件驱动、流处理等 |

---

## B. 实战文档

### 常用命令

```bash
# Topic 管理
kafka-topics.sh --bootstrap-server localhost:9092 --create \
    --topic my-topic --partitions 3 --replication-factor 2

kafka-topics.sh --bootstrap-server localhost:9092 --list
kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic my-topic
kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic my-topic

# 修改分区数（只能增加）
kafka-topics.sh --bootstrap-server localhost:9092 --alter \
    --topic my-topic --partitions 6

# 生产消息
kafka-console-producer.sh --bootstrap-server localhost:9092 --topic my-topic

# 消费消息
kafka-console-consumer.sh --bootstrap-server localhost:9092 \
    --topic my-topic --from-beginning

# 消费者组
kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --describe --group my-group

# 重置 offset
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --group my-group --topic my-topic --reset-offsets --to-earliest --execute
```

### Spring Boot 集成

```yaml
# application.yml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
    consumer:
      group-id: my-group
      auto-offset-reset: earliest
      enable-auto-commit: false
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
    listener:
      ack-mode: manual_immediate
```

```java
// 生产者
@Service
public class KafkaProducerService {
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void send(String topic, String key, Object message) {
        kafkaTemplate.send(topic, key, message)
            .addCallback(
                result -> log.info("发送成功: {}", result.getRecordMetadata()),
                ex -> log.error("发送失败", ex)
            );
    }
}

// 消费者
@Component
public class KafkaConsumerService {

    @KafkaListener(topics = "my-topic", groupId = "my-group")
    public void consume(ConsumerRecord<String, String> record, Acknowledgment ack) {
        try {
            log.info("收到消息: partition={}, offset={}, value={}",
                record.partition(), record.offset(), record.value());

            // 处理消息
            processMessage(record.value());

            // 手动确认
            ack.acknowledge();
        } catch (Exception e) {
            log.error("处理失败", e);
            // 不确认，消息会重新消费
        }
    }
}
```

### 监控指标

```bash
# 重要指标
# 生产者
- record-send-rate        # 发送速率
- record-error-rate       # 错误速率
- request-latency-avg     # 请求延迟

# 消费者
- records-consumed-rate   # 消费速率
- records-lag-max         # 最大消费延迟
- commit-latency-avg      # 提交延迟

# Broker
- UnderReplicatedPartitions  # 副本不足分区数
- OfflinePartitionsCount     # 离线分区数
- ActiveControllerCount      # 活跃 Controller 数量
```
