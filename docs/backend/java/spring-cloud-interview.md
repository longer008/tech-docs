# Spring Cloud 面试题集

> Spring Cloud 微服务架构核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. Spring Cloud 核心组件

```
┌─────────────────────────────────────────────────────────┐
│                    Spring Cloud 架构                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  Gateway │───→│  服务A   │───→│  服务B   │          │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘          │
│       │               │               │                 │
│       ▼               ▼               ▼                 │
│  ┌─────────────────────────────────────────┐           │
│  │           Nacos/Eureka (注册中心)        │           │
│  └─────────────────────────────────────────┘           │
│       │               │               │                 │
│       ▼               ▼               ▼                 │
│  ┌─────────────────────────────────────────┐           │
│  │           Nacos/Config (配置中心)        │           │
│  └─────────────────────────────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

| 组件 | Spring Cloud Netflix | Spring Cloud Alibaba |
|------|---------------------|---------------------|
| 注册中心 | Eureka | Nacos |
| 配置中心 | Config | Nacos |
| 网关 | Zuul | Gateway |
| 负载均衡 | Ribbon | LoadBalancer |
| 熔断降级 | Hystrix | Sentinel |
| 服务调用 | Feign | OpenFeign |

---

#### 2. 服务注册与发现 (Nacos)

```yaml
# application.yml
spring:
  application:
    name: user-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
      config:
        server-addr: localhost:8848
        file-extension: yaml
        shared-configs:
          - data-id: common.yaml
            group: DEFAULT_GROUP
            refresh: true
```

```java
// 服务消费者
@Service
public class OrderService {

    @Autowired
    private DiscoveryClient discoveryClient;

    public void callUserService() {
        // 获取服务实例
        List<ServiceInstance> instances =
            discoveryClient.getInstances("user-service");

        if (!instances.isEmpty()) {
            ServiceInstance instance = instances.get(0);
            String url = instance.getUri() + "/api/users";
            // 调用服务
        }
    }
}
```

---

#### 3. OpenFeign 声明式调用

```java
// Feign 客户端定义
@FeignClient(
    name = "user-service",
    fallbackFactory = UserClientFallbackFactory.class
)
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserDTO getUser(@PathVariable("id") Long id);

    @PostMapping("/api/users")
    UserDTO createUser(@RequestBody CreateUserRequest request);

    @GetMapping("/api/users")
    List<UserDTO> listUsers(@RequestParam("page") int page,
                            @RequestParam("size") int size);
}

// 降级工厂
@Component
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {

    @Override
    public UserClient create(Throwable cause) {
        return new UserClient() {
            @Override
            public UserDTO getUser(Long id) {
                return new UserDTO(); // 返回默认值
            }

            @Override
            public UserDTO createUser(CreateUserRequest request) {
                throw new ServiceException("服务不可用");
            }

            @Override
            public List<UserDTO> listUsers(int page, int size) {
                return Collections.emptyList();
            }
        };
    }
}

// 使用 Feign 客户端
@Service
@RequiredArgsConstructor
public class OrderService {

    private final UserClient userClient;

    public OrderDTO createOrder(CreateOrderRequest request) {
        // 调用用户服务
        UserDTO user = userClient.getUser(request.getUserId());
        // 业务逻辑
        return orderDTO;
    }
}
```

**Feign 配置：**
```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 5000
        loggerLevel: BASIC
  compression:
    request:
      enabled: true
    response:
      enabled: true
  sentinel:
    enabled: true  # 整合 Sentinel
```

---

#### 4. Spring Cloud Gateway

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service  # lb 表示负载均衡
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
            - AddRequestHeader=X-Request-Source, gateway

        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
            - Method=GET,POST
            - Header=Authorization
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
```

```java
// 自定义全局过滤器
@Component
public class AuthGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (token == null || !validateToken(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -100; // 优先级
    }
}
```

---

#### 5. Sentinel 熔断降级

```java
// 资源定义
@Service
public class UserService {

    @SentinelResource(
        value = "getUser",
        blockHandler = "getUserBlockHandler",
        fallback = "getUserFallback"
    )
    public UserDTO getUser(Long id) {
        // 业务逻辑
        return userRepository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // 流控降级处理
    public UserDTO getUserBlockHandler(Long id, BlockException ex) {
        return new UserDTO(); // 返回默认值
    }

    // 异常降级处理
    public UserDTO getUserFallback(Long id, Throwable ex) {
        log.error("getUser fallback, id: {}", id, ex);
        return new UserDTO();
    }
}
```

**Sentinel 规则配置：**
```java
// 流控规则
FlowRule rule = new FlowRule();
rule.setResource("getUser");
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rule.setCount(100);  // QPS 阈值
rule.setStrategy(RuleConstant.STRATEGY_DIRECT);
rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_DEFAULT);

// 熔断规则
DegradeRule degradeRule = new DegradeRule();
degradeRule.setResource("getUser");
degradeRule.setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO);
degradeRule.setCount(0.5);  // 异常比例 50%
degradeRule.setTimeWindow(10);  // 熔断时长 10 秒
degradeRule.setMinRequestAmount(5);  // 最小请求数
```

---

### 进阶题

#### 6. 分布式事务 (Seata)

```java
// AT 模式（自动补偿）
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private StockClient stockClient;

    @Autowired
    private AccountClient accountClient;

    @GlobalTransactional(name = "createOrder", rollbackFor = Exception.class)
    public Order createOrder(CreateOrderRequest request) {
        // 1. 创建订单
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setProductId(request.getProductId());
        order.setAmount(request.getAmount());
        orderRepository.save(order);

        // 2. 扣减库存（远程调用）
        stockClient.deduct(request.getProductId(), request.getQuantity());

        // 3. 扣减余额（远程调用）
        accountClient.deduct(request.getUserId(), request.getAmount());

        return order;
    }
}
```

**Seata 配置：**
```yaml
seata:
  enabled: true
  application-id: order-service
  tx-service-group: my_tx_group
  registry:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: ""
      group: SEATA_GROUP
  config:
    type: nacos
    nacos:
      server-addr: localhost:8848
```

---

#### 7. 链路追踪 (Sleuth + Zipkin)

```yaml
spring:
  sleuth:
    sampler:
      probability: 1.0  # 采样率 100%
  zipkin:
    base-url: http://localhost:9411
    sender:
      type: web
```

```java
// 自定义 Span
@Service
public class UserService {

    @Autowired
    private Tracer tracer;

    public UserDTO getUser(Long id) {
        Span span = tracer.nextSpan().name("getUser").start();
        try (Tracer.SpanInScope ws = tracer.withSpanInScope(span)) {
            span.tag("userId", String.valueOf(id));
            // 业务逻辑
            return userDTO;
        } finally {
            span.end();
        }
    }
}
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "Feign 调用是同步的，性能差" | Feign 支持异步调用，可配合 CompletableFuture |
| "Gateway 只能路由转发" | Gateway 支持限流、熔断、认证等功能 |
| "Sentinel 只能限流" | Sentinel 支持流控、熔断、热点、系统保护 |
| "分布式事务用 2PC 就行" | AT 模式更适合微服务，性能更好 |
| "服务注册后立即可用" | 注册后有心跳检测周期，需要时间同步 |

---

## B. 实战文档

### 微服务项目结构

```
microservice-project/
├── gateway-service/           # 网关服务
├── user-service/              # 用户服务
├── order-service/             # 订单服务
├── product-service/           # 商品服务
├── common/                    # 公共模块
│   ├── common-core/           # 核心工具类
│   ├── common-redis/          # Redis 封装
│   └── common-feign/          # Feign 配置
└── pom.xml
```

### 服务间通信最佳实践

```java
// 统一响应结果
@Data
public class Result<T> {
    private int code;
    private String message;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    public static <T> Result<T> error(int code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}

// Feign 结果解码器
@Configuration
public class FeignConfig {

    @Bean
    public Decoder feignDecoder() {
        return (response, type) -> {
            // 自定义解码逻辑
            Result<?> result = objectMapper.readValue(
                response.body().asInputStream(),
                Result.class
            );
            if (result.getCode() != 200) {
                throw new ServiceException(result.getMessage());
            }
            return result.getData();
        };
    }
}
```
