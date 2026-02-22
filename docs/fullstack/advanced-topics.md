# 全栈开发高级主题

> 全栈开发进阶技术与架构设计
> 
> 更新时间：2025-02

## 目录

[[toc]]

## 高级架构

### 1. 微服务架构设计

**核心概念：**

微服务架构将单体应用拆分成多个小型、独立的服务。

**架构图：**

```
┌─────────────────────────────────────────────────────────────┐
│                    微服务架构全景图                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  前端层                                                     │
│  ├─▶ Web 应用（React/Vue）                                 │
│  ├─▶ 移动应用（React Native/Flutter）                      │
│  └─▶ 小程序                                                │
│                                                              │
│  API 网关层（Spring Cloud Gateway/Kong）                    │
│  ├─▶ 路由转发                                              │
│  ├─▶ 认证授权                                              │
│  ├─▶ 限流熔断                                              │
│  └─▶ 日志监控                                              │
│                                                              │
│  服务层                                                
             │
│  ├─▶ 消息队列（RabbitMQ/Kafka）                            │
│  ├─▶ 分布式缓存（Redis Cluster）                           │
│  ├─▶ 分布式追踪（Zipkin/Skywalking）                       │
│  └─▶ 日志聚合（ELK Stack）                                 │
│                                                              │
│  数据层                                                     │
│  ├─▶ MySQL（用户、订单）                                   │
│  ├─▶ MongoDB（商品、日志）                                 │
│  └─▶ Redis（缓存、会话）                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**服务拆分原则：**

1. **按业务领域拆分**
   - 用户域：用户管理、认证授权
   - 订单域：订单创建、支付、物流
   - 商品域：商品管理、库存、分类

2. **单一职责原则**
   - 每个服务只负责一个业务功能
   - 服务内部高内聚
   - 服务之间低耦合

3. **数据独立性**
   - 每个服务有独立的数据库
   - 避免跨服务直接访问数据库
   - 通过 API 进行数据交互

**服务间通信：**

```java
// 1. 同步通信（OpenFeign）
@FeignClient(name = "user-service")
public interface UserServiceClient {
    @GetMapping("/api/users/{id}")
    User getUser(@PathVariable Long id);
}

// 2. 异步通信（消息队列）
@Service
public class OrderService {
    
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void createOrder(Order order) {
        // 保存订单
        orderRepository.save(order);
        
        // 发送消息
        rabbitTemplate.convertAndSend("order.exchange", 
            "order.created", order);
    }
}

@Component
public class OrderEventListener {
    
    @RabbitListener(queues = "order.created.queue")
    public void handleOrderCreated(Order order) {
        // 处理订单创建事件
        // 例如：发送通知、更新库存等
    }
}
```

---

### 2. 分布式事务

**核心答案：**

分布式事务确保跨多个服务的数据一致性。

**解决方案：**

1. **两阶段提交（2PC）**
   - 准备阶段：协调者询问所有参与者是否可以提交
   - 提交阶段：所有参与者都同意后，协调者通知提交
   - 缺点：性能差、阻塞、单点故障

2. **TCC（Try-Confirm-Cancel）**
   ```java
   @Service
   public class OrderService {
       
       // Try 阶段：预留资源
       @Transactional
       public void tryCreateOrder(Order order) {
           // 检查库存
           // 冻结库存
           // 创建订单（待确认状态）
       }
       
       // Confirm 阶段：确认提交
       @Transactional
       public void confirmCreateOrder(Long orderId) {
           // 扣减库存
           // 确认订单
       }
       
       // Cancel 阶段：回滚
       @Transactional
       public void cancelCreateOrder(Long orderId) {
           // 释放库存
           // 取消订单
       }
   }
   ```

3. **Saga 模式**
   ```java
   // 编排式 Saga
   @Service
   public class OrderSagaOrchestrator {
       
       public void createOrder(Order order) {
           try {
               // 步骤1：创建订单
               orderService.createOrder(order);
               
               // 步骤2：扣减库存
               inventoryService.deductInventory(order);
               
               // 步骤3：扣减余额
               accountService.deductBalance(order);
               
               // 步骤4：发送通知
               notificationService.sendNotification(order);
               
           } catch (Exception e) {
               // 补偿操作
               notificationService.cancelNotification(order);
               accountService.refundBalance(order);
               inventoryService.restoreInventory(order);
               orderService.cancelOrder(order);
           }
       }
   }
   ```

4. **本地消息表**
   ```java
   @Service
   public class OrderService {
       
       @Transactional
       public void createOrder(Order order) {
           // 1. 保存订单
           orderRepository.save(order);
           
           // 2. 保存本地消息
           LocalMessage message = new LocalMessage();
           message.setTopic("order.created");
           message.setContent(JSON.toJSONString(order));
           message.setStatus(MessageStatus.PENDING);
           messageRepository.save(message);
       }
   }
   
   // 定时任务发送消息
   @Scheduled(fixedDelay = 5000)
   public void sendPendingMessages() {
       List<LocalMessage> messages = messageRepository
           .findByStatus(MessageStatus.PENDING);
       
       for (LocalMessage message : messages) {
           try {
               rabbitTemplate.convertAndSend(
                   message.getTopic(), message.getContent());
               message.setStatus(MessageStatus.SENT);
               messageRepository.save(message);
           } catch (Exception e) {
               // 重试逻辑
           }
       }
   }
   ```

---

### 3. 分布式锁

**核心答案：**

分布式锁用于控制分布式系统中的并发访问。

**Redis 实现：**

```java
@Component
public class RedisDistributedLock {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    private static final String LOCK_PREFIX = "lock:";
    private static final long LOCK_TIMEOUT = 30000; // 30秒
    
    public boolean tryLock(String key, String value) {
        Boolean result = redisTemplate.opsForValue()
            .setIfAbsent(LOCK_PREFIX + key, value, 
                LOCK_TIMEOUT, TimeUnit.MILLISECONDS);
        return Boolean.TRUE.equals(result);
    }
    
    public void unlock(String key, String value) {
        // Lua 脚本保证原子性
        String script = 
            "if redis.call('get', KEYS[1]) == ARGV[1] then " +
            "    return redis.call('del', KEYS[1]) " +
            "else " +
            "    return 0 " +
            "end";
        
        redisTemplate.execute(
            new DefaultRedisScript<>(script, Long.class),
            Collections.singletonList(LOCK_PREFIX + key),
            value
        );
    }
}

// 使用示例
@Service
public class OrderService {
    
    @Autowired
    private RedisDistributedLock distributedLock;
    
    public void createOrder(Order order) {
        String lockKey = "order:" + order.getUserId();
        String lockValue = UUID.randomUUID().toString();
        
        try {
            if (distributedLock.tryLock(lockKey, lockValue)) {
                // 业务逻辑
                orderRepository.save(order);
            } else {
                throw new BusinessException("系统繁忙，请稍后重试");
            }
        } finally {
            distributedLock.unlock(lockKey, lockValue);
        }
    }
}
```

**Redisson 实现：**

```java
@Configuration
public class RedissonConfig {
    
    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.useSingleServer()
            .setAddress("redis://localhost:6379")
            .setPassword("password");
        return Redisson.create(config);
    }
}

@Service
public class OrderService {
    
    @Autowired
    private RedissonClient redissonClient;
    
    public void createOrder(Order order) {
        RLock lock = redissonClient.getLock("order:" + order.getUserId());
        
        try {
            // 尝试加锁，最多等待10秒，锁30秒后自动释放
            if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
                // 业务逻辑
                orderRepository.save(order);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

---

### 4. 服务限流与熔断

**核心答案：**

限流和熔断保护系统稳定性。

**限流算法：**

1. **固定窗口**
   ```java
   public class FixedWindowRateLimiter {
       private final int limit;
       private final long windowSize;
       private AtomicInteger counter = new AtomicInteger(0);
       private long windowStart = System.currentTimeMillis();
       
       public boolean tryAcquire() {
           long now = System.currentTimeMillis();
           
           if (now - windowStart > windowSize) {
               // 重置窗口
               windowStart = now;
               counter.set(0);
           }
           
           return counter.incrementAndGet() <= limit;
       }
   }
   ```

2. **滑动窗口**
   ```java
   public class SlidingWindowRateLimiter {
       private final int limit;
       private final long windowSize;
       private final Queue<Long> timestamps = new LinkedList<>();
       
       public synchronized boolean tryAcquire() {
           long now = System.currentTimeMillis();
           
           // 移除过期的时间戳
           while (!timestamps.isEmpty() && 
                  now - timestamps.peek() > windowSize) {
               timestamps.poll();
           }
           
           if (timestamps.size() < limit) {
               timestamps.offer(now);
               return true;
           }
           
           return false;
       }
   }
   ```

3. **令牌桶**
   ```java
   public class TokenBucketRateLimiter {
       private final int capacity;
       private final int refillRate;
       private int tokens;
       private long lastRefillTime;
       
       public synchronized boolean tryAcquire() {
           refill();
           
           if (tokens > 0) {
               tokens--;
               return true;
           }
           
           return false;
       }
       
       private void refill() {
           long now = System.currentTimeMillis();
           long elapsed = now - lastRefillTime;
           int tokensToAdd = (int) (elapsed * refillRate / 1000);
           
           tokens = Math.min(capacity, tokens + tokensToAdd);
           lastRefillTime = now;
       }
   }
   ```

**Resilience4j 熔断器：**

```java
@Configuration
public class Resilience4jConfig {
    
    @Bean
    public CircuitBreakerConfig circuitBreakerConfig() {
        return CircuitBreakerConfig.custom()
            .failureRateThreshold(50) // 失败率阈值50%
            .waitDurationInOpenState(Duration.ofMillis(1000)) // 熔断器打开后等待1秒
            .slidingWindowSize(10) // 滑动窗口大小10
            .minimumNumberOfCalls(5) // 最小调用次数5
            .build();
    }
}

@Service
public class UserService {
    
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserFallback")
    @RateLimiter(name = "userService")
    @Retry(name = "userService")
    public User getUser(Long id) {
        return userClient.getUser(id);
    }
    
    private User getUserFallback(Long id, Exception e) {
        log.error("获取用户失败，返回默认值", e);
        return new User(id, "默认用户", "fallback@example.com");
    }
}
```

---

### 5. 分布式 ID 生成

**核心答案：**

分布式系统需要全局唯一的 ID。

**常用方案：**

1. **UUID**
   ```java
   String id = UUID.randomUUID().toString();
   // 优点：简单、无需中心化服务
   // 缺点：无序、占用空间大
   ```

2. **雪花算法（Snowflake）**
   ```java
   public class SnowflakeIdGenerator {
       private final long workerId;
       private final long datacenterId;
       private long sequence = 0L;
       private long lastTimestamp = -1L;
       
       private static final long WORKER_ID_BITS = 5L;
       private static final long DATACENTER_ID_BITS = 5L;
       private static final long SEQUENCE_BITS = 12L;
       
       public synchronized long nextId() {
           long timestamp = System.currentTimeMillis();
           
           if (timestamp < lastTimestamp) {
               throw new RuntimeException("时钟回拨");
           }
           
           if (timestamp == lastTimestamp) {
               sequence = (sequence + 1) & ((1 << SEQUENCE_BITS) - 1);
               if (sequence == 0) {
                   timestamp = tilNextMillis(lastTimestamp);
               }
           } else {
               sequence = 0L;
           }
           
           lastTimestamp = timestamp;
           
           return ((timestamp - 1288834974657L) << 22)
                   | (datacenterId << 17)
                   | (workerId << 12)
                   | sequence;
       }
       
       private long tilNextMillis(long lastTimestamp) {
           long timestamp = System.currentTimeMillis();
           while (timestamp <= lastTimestamp) {
               timestamp = System.currentTimeMillis();
           }
           return timestamp;
       }
   }
   ```

3. **数据库自增 ID**
   ```sql
   -- 设置起始值和步长
   SET @@auto_increment_increment = 2;
   SET @@auto_increment_offset = 1;
   ```

4. **Redis 生成**
   ```java
   public class RedisIdGenerator {
       
       @Autowired
       private StringRedisTemplate redisTemplate;
       
       public Long nextId(String key) {
           String date = LocalDate.now().format(
               DateTimeFormatter.ofPattern("yyyyMMdd"));
           String redisKey = "id:" + key + ":" + date;
           
           Long increment = redisTemplate.opsForValue()
               .increment(redisKey);
           
           // 设置过期时间
           redisTemplate.expire(redisKey, 1, TimeUnit.DAYS);
           
           return increment;
       }
   }
   ```

---

## 性能优化

### 1. 数据库优化

**查询优化：**

```sql
-- ❌ 避免 SELECT *
SELECT * FROM users WHERE id = 1;

-- ✅ 只查询需要的字段
SELECT id, name, email FROM users WHERE id = 1;

-- ❌ 避免在 WHERE 中使用函数
SELECT * FROM orders WHERE YEAR(created_at) = 2024;

-- ✅ 使用索引
SELECT * FROM orders 
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- ✅ 使用覆盖索引
CREATE INDEX idx_user_email ON users(email);
SELECT email FROM users WHERE email = 'john@example.com';

-- ✅ 批量插入
INSERT INTO users (name, email) VALUES
    ('John', 'john@example.com'),
    ('Jane', 'jane@example.com'),
    ('Bob', 'bob@example.com');
```

**索引优化：**

```sql
-- 联合索引遵循最左前缀原则
CREATE INDEX idx_user_name_age ON users(name, age);

-- ✅ 可以使用索引
SELECT * FROM users WHERE name = 'John';
SELECT * FROM users WHERE name = 'John' AND age = 25;

-- ❌ 无法使用索引
SELECT * FROM users WHERE age = 25;

-- 避免索引失效
-- ❌ 使用 OR
SELECT * FROM users WHERE name = 'John' OR age = 25;

-- ✅ 使用 UNION
SELECT * FROM users WHERE name = 'John'
UNION
SELECT * FROM users WHERE age = 25;
```

---

### 2. 缓存策略

**多级缓存：**

```
┌─────────────────────────────────────────────────────────────┐
│                    多级缓存架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  浏览器缓存（Browser Cache）                                │
│     └─▶ localStorage、sessionStorage、IndexedDB            │
│                                                              │
│  CDN 缓存（CDN Cache）                                      │
│     └─▶ 静态资源缓存                                        │
│                                                              │
│  Nginx 缓存（Nginx Cache）                                  │
│     └─▶ 页面缓存、API 缓存                                 │
│                                                              │
│  应用缓存（Application Cache）                              │
│     ├─▶ 本地缓存（Caffeine、Guava）                        │
│     └─▶ 分布式缓存（Redis）                                │
│                                                              │
│  数据库缓存（Database Cache）                               │
│     └─▶ 查询缓存、Buffer Pool                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**缓存更新策略：**

```java
// 1. Cache Aside（旁路缓存）
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RedisTemplate<String, User> redisTemplate;
    
    public User getUser(Long id) {
        String key = "user:" + id;
        
        // 先查缓存
        User user = redisTemplate.opsForValue().get(key);
        if (user != null) {
            return user;
        }
        
        // 缓存未命中，查数据库
        user = userRepository.findById(id).orElse(null);
        if (user != null) {
            // 写入缓存
            redisTemplate.opsForValue().set(key, user, 1, TimeUnit.HOURS);
        }
        
        return user;
    }
    
    public void updateUser(User user) {
        // 先更新数据库
        userRepository.save(user);
        
        // 删除缓存
        String key = "user:" + user.getId();
        redisTemplate.delete(key);
    }
}

// 2. Read/Write Through（读写穿透）
// 由缓存层负责数据库的读写

// 3. Write Behind（异步写入）
// 先写缓存，异步批量写入数据库
```

**缓存问题解决：**

```java
// 1. 缓存穿透（查询不存在的数据）
public User getUser(Long id) {
    String key = "user:" + id;
    
    // 查缓存
    User user = redisTemplate.opsForValue().get(key);
    if (user != null) {
        return user;
    }
    
    // 查数据库
    user = userRepository.findById(id).orElse(null);
    
    // 即使为 null 也缓存，设置较短过期时间
    redisTemplate.opsForValue().set(key, 
        user != null ? user : new User(), 
        user != null ? 1 : 5, 
        TimeUnit.MINUTES);
    
    return user;
}

// 2. 缓存击穿（热点数据过期）
public User getUser(Long id) {
    String key = "user:" + id;
    String lockKey = "lock:user:" + id;
    
    // 查缓存
    User user = redisTemplate.opsForValue().get(key);
    if (user != null) {
        return user;
    }
    
    // 获取分布式锁
    Boolean locked = redisTemplate.opsForValue()
        .setIfAbsent(lockKey, "1", 10, TimeUnit.SECONDS);
    
    if (Boolean.TRUE.equals(locked)) {
        try {
            // 双重检查
            user = redisTemplate.opsForValue().get(key);
            if (user != null) {
                return user;
            }
            
            // 查数据库
            user = userRepository.findById(id).orElse(null);
            if (user != null) {
                redisTemplate.opsForValue().set(key, user, 1, TimeUnit.HOURS);
            }
            
            return user;
        } finally {
            redisTemplate.delete(lockKey);
        }
    } else {
        // 等待后重试
        Thread.sleep(100);
        return getUser(id);
    }
}

// 3. 缓存雪崩（大量缓存同时过期）
public void cacheUsers(List<User> users) {
    for (User user : users) {
        String key = "user:" + user.getId();
        // 随机过期时间，避免同时过期
        int randomExpire = 3600 + new Random().nextInt(600);
        redisTemplate.opsForValue().set(key, user, 
            randomExpire, TimeUnit.SECONDS);
    }
}
```

---

## 部署与运维

### 1. Docker 容器化

**Dockerfile 示例：**

```dockerfile
# 多阶段构建
FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**docker-compose.yml：**

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: myapp
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/myapp
      SPRING_REDIS_HOST: redis
    depends_on:
      - mysql
      - redis

volumes:
  mysql-data:
```

---

### 2. CI/CD 流程

**GitHub Actions 示例：**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Build with Maven
      run: mvn clean package -DskipTests
    
    - name: Run tests
      run: mvn test
    
    - name: Build Docker image
      run: docker build -t myapp:${{ github.sha }} .
    
    - name: Push to Docker Hub
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push myapp:${{ github.sha }}
    
    - name: Deploy to production
      run: |
        ssh user@server "docker pull myapp:${{ github.sha }} && docker-compose up -d"
```

---

## 学习路线

### 完整学习路径（6-12个月）

```
第1-2个月：前端基础
├─▶ HTML/CSS/JavaScript
├─▶ ES6+ 新特性
├─▶ TypeScript
└─▶ 响应式设计

第3-4个月：前端框架
├─▶ React 或 Vue
├─▶ 状态管理（Redux/Pinia）
├─▶ 路由（React Router/Vue Router）
└─▶ 构建工具（Webpack/Vite）

第5-6个月：后端基础
├─▶ Node.js 或 Java 或 Python
├─▶ Express/Spring Boot/Django
├─▶ RESTful API 设计
└─▶ 数据库（MySQL/MongoDB）

第7-8个月：进阶技术
├─▶ 认证授权（JWT/OAuth）
├─▶ 缓存（Redis）
├─▶ 消息队列（RabbitMQ/Kafka）
└─▶ 微服务架构

第9-10个月：运维部署
├─▶ Linux 基础
├─▶ Docker 容器化
├─▶ CI/CD
└─▶ 云服务（AWS/阿里云）

第11-12个月：项目实战
├─▶ 完整项目开发
├─▶ 性能优化
├─▶ 问题排查
└─▶ 面试准备
```
