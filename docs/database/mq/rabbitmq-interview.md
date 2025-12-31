# RabbitMQ 面试题集

> RabbitMQ 消息队列核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. RabbitMQ 核心概念

```
┌─────────────────────────────────────────────────────────┐
│                    RabbitMQ 架构                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Producer                                                │
│     │                                                    │
│     ▼                                                    │
│  ┌──────────────────────────────────────────────┐       │
│  │               Exchange                        │       │
│  │    (Direct/Fanout/Topic/Headers)             │       │
│  └──────────────────────┬───────────────────────┘       │
│            ┌────────────┼────────────┐                  │
│            ▼            ▼            ▼                  │
│       ┌────────┐  ┌────────┐  ┌────────┐              │
│       │ Queue1 │  │ Queue2 │  │ Queue3 │              │
│       └───┬────┘  └───┬────┘  └───┬────┘              │
│           ▼           ▼           ▼                    │
│       Consumer1   Consumer2   Consumer3                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

| 概念 | 说明 |
|------|------|
| Producer | 消息生产者 |
| Consumer | 消息消费者 |
| Exchange | 交换机，路由消息 |
| Queue | 队列，存储消息 |
| Binding | 绑定，Exchange 和 Queue 的关联 |
| Routing Key | 路由键，消息路由规则 |
| Virtual Host | 虚拟主机，隔离环境 |

---

#### 2. Exchange 类型

```python
# Direct Exchange - 精确匹配 routing key
channel.exchange_declare(exchange='direct_logs', exchange_type='direct')
channel.basic_publish(exchange='direct_logs', routing_key='error', body=message)

# Fanout Exchange - 广播到所有绑定队列
channel.exchange_declare(exchange='logs', exchange_type='fanout')
channel.basic_publish(exchange='logs', routing_key='', body=message)

# Topic Exchange - 模式匹配 routing key
# * 匹配一个单词，# 匹配零或多个单词
channel.exchange_declare(exchange='topic_logs', exchange_type='topic')
channel.queue_bind(exchange='topic_logs', queue=queue_name, routing_key='*.error')
channel.queue_bind(exchange='topic_logs', queue=queue_name, routing_key='user.#')

# Headers Exchange - 根据消息头匹配
channel.exchange_declare(exchange='headers_logs', exchange_type='headers')
```

| 类型 | 路由规则 | 使用场景 |
|------|---------|---------|
| Direct | 精确匹配 routing key | 点对点通信 |
| Fanout | 广播到所有队列 | 广播消息 |
| Topic | 模式匹配 routing key | 多条件路由 |
| Headers | 匹配消息头 | 复杂路由规则 |

---

#### 3. 消息确认机制

```python
# 生产者确认 (Publisher Confirms)
channel.confirm_delivery()

try:
    channel.basic_publish(exchange='', routing_key='queue', body=message)
    print("Message published")
except pika.exceptions.UnroutableError:
    print("Message could not be routed")

# 消费者确认 (Consumer Acknowledgements)
def callback(ch, method, properties, body):
    try:
        process_message(body)
        ch.basic_ack(delivery_tag=method.delivery_tag)  # 确认
    except Exception:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)  # 拒绝并重新入队

channel.basic_consume(queue='queue', on_message_callback=callback, auto_ack=False)

# 消息持久化
# 1. 队列持久化
channel.queue_declare(queue='queue', durable=True)

# 2. 消息持久化
channel.basic_publish(
    exchange='',
    routing_key='queue',
    body=message,
    properties=pika.BasicProperties(delivery_mode=2)  # 持久化
)
```

---

#### 4. 消息可靠性保证

```
┌─────────────────────────────────────────────────────────┐
│                    可靠性机制                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  生产端：                                                │
│  1. Publisher Confirms - 确认消息到达 Exchange          │
│  2. Return Listener - 消息无法路由时回调                 │
│                                                          │
│  Broker 端：                                            │
│  1. 队列持久化 (durable=True)                           │
│  2. 消息持久化 (delivery_mode=2)                        │
│  3. 镜像队列 (HA)                                       │
│                                                          │
│  消费端：                                                │
│  1. 手动 ACK (auto_ack=False)                          │
│  2. 幂等性处理                                          │
│  3. 死信队列                                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

#### 5. 死信队列 (DLX)

```python
# 死信队列配置
# 消息成为死信的条件：
# 1. 消息被拒绝 (basic.reject/basic.nack) 且 requeue=false
# 2. 消息过期 (TTL)
# 3. 队列达到最大长度

# 声明死信交换机和队列
channel.exchange_declare(exchange='dlx_exchange', exchange_type='direct')
channel.queue_declare(queue='dlx_queue')
channel.queue_bind(exchange='dlx_exchange', queue='dlx_queue', routing_key='dlx')

# 声明业务队列，绑定死信交换机
args = {
    'x-dead-letter-exchange': 'dlx_exchange',
    'x-dead-letter-routing-key': 'dlx',
    'x-message-ttl': 60000  # 消息过期时间 60 秒
}
channel.queue_declare(queue='business_queue', arguments=args)
```

**延迟队列实现：**
```python
# 利用 TTL + DLX 实现延迟队列
# 1. 消息发送到延迟队列（设置 TTL）
# 2. 消息过期后进入死信队列
# 3. 消费者消费死信队列

# 或使用 rabbitmq_delayed_message_exchange 插件
channel.exchange_declare(
    exchange='delayed_exchange',
    exchange_type='x-delayed-message',
    arguments={'x-delayed-type': 'direct'}
)

# 发送延迟消息
channel.basic_publish(
    exchange='delayed_exchange',
    routing_key='delay_key',
    body=message,
    properties=pika.BasicProperties(headers={'x-delay': 5000})  # 延迟 5 秒
)
```

---

### 进阶题

#### 6. 高可用集群

```
┌─────────────────────────────────────────────────────────┐
│                    集群模式                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  普通集群：                                              │
│  - 元数据同步，消息不同步                                │
│  - 访问非消息所在节点需要转发                            │
│                                                          │
│  镜像队列（HA）：                                        │
│  - 消息同步到多个节点                                    │
│  - 主节点故障自动切换                                    │
│                                                          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│  │  Node1  │◄──►│  Node2  │◄──►│  Node3  │             │
│  │ (Master)│    │ (Mirror)│    │ (Mirror)│             │
│  └─────────┘    └─────────┘    └─────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

```bash
# 配置镜像队列策略
rabbitmqctl set_policy ha-all "^" '{"ha-mode":"all","ha-sync-mode":"automatic"}'

# 策略参数
# ha-mode: all（所有节点）/ exactly（指定数量）/ nodes（指定节点）
# ha-sync-mode: manual（手动同步）/ automatic（自动同步）
```

---

#### 7. 消息顺序性

```python
# 保证消息顺序的方法：
# 1. 单队列单消费者
# 2. 按业务 ID 路由到同一队列

# 示例：按用户 ID 分发到固定队列
def get_queue_name(user_id, queue_count=4):
    return f"order_queue_{hash(user_id) % queue_count}"

# 发送消息
queue = get_queue_name(user_id)
channel.basic_publish(exchange='', routing_key=queue, body=message)
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "RabbitMQ 默认持久化" | 需要显式设置队列和消息持久化 |
| "消费者 ACK 就不会丢消息" | 还需要生产者确认和持久化 |
| "镜像队列无性能损耗" | 同步会降低吞吐量 |
| "消息队列天然保证顺序" | 多消费者会打乱顺序 |
| "死信队列自动创建" | 需要手动配置 DLX |

---

## B. 实战文档

### 常用命令

```bash
# 用户管理
rabbitmqctl add_user admin password
rabbitmqctl set_user_tags admin administrator
rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

# 队列管理
rabbitmqctl list_queues
rabbitmqctl list_queues name messages consumers
rabbitmqctl purge_queue queue_name
rabbitmqctl delete_queue queue_name

# 集群管理
rabbitmqctl cluster_status
rabbitmqctl join_cluster rabbit@node1
rabbitmqctl forget_cluster_node rabbit@node2

# 策略管理
rabbitmqctl list_policies
rabbitmqctl set_policy name pattern definition
rabbitmqctl clear_policy name

# 监控
rabbitmqctl list_connections
rabbitmqctl list_channels
```

### Python 示例

```python
import pika

# 连接
connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

# 声明队列
channel.queue_declare(queue='hello', durable=True)

# 发送消息
channel.basic_publish(
    exchange='',
    routing_key='hello',
    body='Hello World!',
    properties=pika.BasicProperties(delivery_mode=2)
)

# 消费消息
def callback(ch, method, properties, body):
    print(f"Received {body}")
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='hello', on_message_callback=callback)
channel.start_consuming()
```
