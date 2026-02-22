# Spring Boot 面试题集

> Spring Boot 核心原理、自动配置、Starter 与高频面试题
> 
> 更新时间：2025-02

## 目录

[[toc]]

## A. 面试宝典

### 基础题

#### 1. 什么是 Spring Boot？核心特点是什么？

**核心答案：**

Spring Boot 是基于 Spring Framework 的快速开发框架，旨在简化 Spring 应用的初始搭建和开发过程。

**核心特点：**

1. **自动配置（Auto-Configuration）**
   - 根据类路径中的依赖自动配置 Spring 应用
   - 基于条件注解（@Conditional）实现智能装配
   - 可通过配置文件覆盖默认配置

2. **Starter 依赖**
   - 预定义的依赖集合，简化依赖管理
   - 一站式引入相关功能的所有依赖
   - 例如：spring-boot-starter-web、spring-boot-starter-data-jpa

3. **内嵌服务器**
   - 内置 Tomcat、Jetty、Undertow
   - 无需部署 WAR 文件，直接运行 JAR
   - 简化部署流程

4. **生产就绪特性（Actuator）**
   - 健康检查、指标监控、审计日志
   - 开箱即用的运维端点
   - 支持自定义监控指标

5. **无代码生成和 XML 配置**
   - 基于 Java 配置和注解
   - 约定优于配置
   - 减少样板代码

**代码示例：**

```java
// 最简单的 Spring Boot 应用
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// @SpringBootApplication 等价于：
// @SpringBootConfiguration（@Configuration 的特化）
// @EnableAutoConfiguration（启用自动配置）
// @ComponentScan（组件扫描）
```

---

#### 2. Spring Boot 自动配置原理

**核心答案：**

Spring Boot 自动配置基于 `@EnableAutoConfiguration` 注解和条件注解实现。

**工作流程：**

```
┌─────────────────────────────────────────────────────────────┐
│                    自动配置流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. @SpringBootApplication                                  │
│     └─▶ @EnableAutoConfiguration                           │
│                 
                      │
│     └─▶ @ConditionalOnMissingBean                           │
│     └─▶ @ConditionalOnProperty                              │
│                                                              │
│  5. 创建并注册 Bean                                         │
│     └─▶ 应用配置文件中的属性                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**常用条件注解：**

| 注解 | 说明 |
|------|------|
| @ConditionalOnClass | 类路径存在指定类时生效 |
| @ConditionalOnMissingClass | 类路径不存在指定类时生效 |
| @ConditionalOnBean | 容器中存在指定 Bean 时生效 |
| @ConditionalOnMissingBean | 容器中不存在指定 Bean 时生效 |
| @ConditionalOnProperty | 配置文件中存在指定属性时生效 |
| @ConditionalOnResource | 类路径存在指定资源时生效 |
| @ConditionalOnWebApplication | Web 应用时生效 |

**自定义自动配置示例：**

```java
// 1. 创建配置类
@Configuration
@ConditionalOnClass(RedisTemplate.class)
@EnableConfigurationProperties(RedisProperties.class)
public class RedisAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}

// 2. 创建配置属性类
@ConfigurationProperties(prefix = "spring.redis")
public class RedisProperties {
    private String host = "localhost";
    private int port = 6379;
    private String password;
    // getters and setters
}

// 3. 在 META-INF/spring.factories 中注册
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.config.RedisAutoConfiguration
```

---

#### 3. Starter 依赖的作用和原理

**核心答案：**

Starter 是一组预定义的依赖描述符，用于简化依赖管理和自动配置。

**Starter 的作用：**

1. **依赖聚合**：将相关依赖打包在一起
2. **版本管理**：统一管理依赖版本，避免冲突
3. **自动配置**：配合 AutoConfiguration 实现开箱即用
4. **最佳实践**：提供官方推荐的依赖组合

**常用 Starter：**

```xml
<!-- Web 应用 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- 数据库访问 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- 安全 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- 测试 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

**自定义 Starter：**

```
my-spring-boot-starter/
├── pom.xml
├── src/main/java/
│   └── com/example/
│       ├── autoconfigure/
│       │   ├── MyAutoConfiguration.java
│       │   └── MyProperties.java
│       └── service/
│           └── MyService.java
└── src/main/resources/
    └── META-INF/
        └── spring.factories
```

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-autoconfigure</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-configuration-processor</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

---

#### 4. @ConfigurationProperties vs @Value

**核心答案：**

两者都用于注入配置属性，但适用场景不同。

**对比分析：**

| 特性 | @ConfigurationProperties | @Value |
|------|-------------------------|--------|
| 使用方式 | 批量绑定到 JavaBean | 单个属性注入 |
| 松散绑定 | 支持（kebab-case、camelCase） | 不支持 |
| 元数据支持 | 支持（IDE 提示） | 不支持 |
| SpEL 表达式 | 不支持 | 支持 |
| JSR-303 校验 | 支持 @Validated | 不支持 |
| 复杂类型 | 支持（List、Map） | 不支持 |
| 性能 | 更好（批量绑定） | 较差（逐个解析） |

**代码示例：**

```java
// @ConfigurationProperties 方式
@Component
@ConfigurationProperties(prefix = "app")
@Validated
public class AppProperties {
    @NotBlank
    private String name;
    
    @Min(1)
    @Max(65535)
    private int port;
    
    private List<String> servers;
    
    private Map<String, String> config;
    
    // getters and setters
}

// @Value 方式
@Component
public class AppConfig {
    @Value("${app.name}")
    private String name;
    
    @Value("${app.port:8080}")  // 默认值
    private int port;
    
    @Value("#{systemProperties['user.home']}")  // SpEL
    private String userHome;
}
```

```yaml
# application.yml
app:
  name: MyApp
  port: 8080
  servers:
    - server1.example.com
    - server2.example.com
  config:
    key1: value1
    key2: value2
```

**使用建议：**

- 多个相关配置：使用 @ConfigurationProperties
- 单个简单配置：使用 @Value
- 需要校验：使用 @ConfigurationProperties + @Validated
- 需要 SpEL：使用 @Value

---

#### 5. Spring Boot Actuator 常用端点

**核心答案：**

Actuator 提供生产就绪的监控和管理功能。

**常用端点：**

| 端点 | 说明 | HTTP 方法 |
|------|------|-----------|
| /actuator/health | 健康检查 | GET |
| /actuator/info | 应用信息 | GET |
| /actuator/metrics | 指标信息 | GET |
| /actuator/loggers | 日志配置 | GET/POST |
| /actuator/env | 环境变量 | GET |
| /actuator/beans | Bean 列表 | GET |
| /actuator/mappings | 请求映射 | GET |
| /actuator/threaddump | 线程转储 | GET |
| /actuator/heapdump | 堆转储 | GET |
| /actuator/shutdown | 关闭应用 | POST |

**配置示例：**

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: "health,info,metrics,loggers"  # 暴露端点
        exclude: "shutdown"  # 排除端点
      base-path: /actuator  # 基础路径
  endpoint:
    health:
      show-details: when-authorized  # 健康详情
    shutdown:
      enabled: true  # 启用关闭端点
  metrics:
    tags:
      application: ${spring.application.name}  # 指标标签
```

**自定义健康检查：**

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        // 检查自定义服务状态
        boolean serviceUp = checkService();
        
        if (serviceUp) {
            return Health.up()
                    .withDetail("service", "available")
                    .withDetail("timestamp", System.currentTimeMillis())
                    .build();
        } else {
            return Health.down()
                    .withDetail("service", "unavailable")
                    .withDetail("error", "Service connection failed")
                    .build();
        }
    }
    
    private boolean checkService() {
        // 实际检查逻辑
        return true;
    }
}
```

**自定义指标：**

```java
@Component
public class CustomMetrics {
    
    private final Counter orderCounter;
    private final Timer orderTimer;
    
    public CustomMetrics(MeterRegistry registry) {
        this.orderCounter = Counter.builder("orders.created")
                .description("Total orders created")
                .tag("type", "online")
                .register(registry);
        
        this.orderTimer = Timer.builder("orders.processing.time")
                .description("Order processing time")
                .register(registry);
    }
    
    public void recordOrder() {
        orderCounter.increment();
    }
    
    public void recordProcessingTime(Runnable task) {
        orderTimer.record(task);
    }
}
```

---

### 进阶题

#### 6. Spring Boot 配置文件加载顺序

**核心答案：**

Spring Boot 支持多种配置源，按优先级从高到低加载。

**配置优先级（从高到低）：**

```
1. 命令行参数
   java -jar app.jar --server.port=9000

2. SPRING_APPLICATION_JSON 环境变量
   SPRING_APPLICATION_JSON='{"server.port":9000}'

3. ServletConfig 初始化参数

4. ServletContext 初始化参数

5. JNDI 属性

6. Java 系统属性（System.getProperties()）
   -Dserver.port=9000

7. 操作系统环境变量
   export SERVER_PORT=9000

8. RandomValuePropertySource（random.*）

9. jar 包外的 application-{profile}.properties/yml

10. jar 包内的 application-{profile}.properties/yml

11. jar 包外的 application.properties/yml

12. jar 包内的 application.properties/yml

13. @PropertySource 注解

14. 默认属性（SpringApplication.setDefaultProperties）
```

**Profile 配置：**

```yaml
# application.yml（默认配置）
spring:
  profiles:
    active: dev  # 激活 dev 配置

server:
  port: 8080

---
# application-dev.yml（开发环境）
spring:
  config:
    activate:
      on-profile: dev

server:
  port: 8081

logging:
  level:
    root: DEBUG

---
# application-prod.yml（生产环境）
spring:
  config:
    activate:
      on-profile: prod

server:
  port: 80

logging:
  level:
    root: WARN
```

**多配置文件：**

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        
        // 设置额外的配置文件位置
        app.setAdditionalProfiles("custom");
        
        // 设置默认属性
        Properties props = new Properties();
        props.setProperty("server.port", "8080");
        app.setDefaultProperties(props);
        
        app.run(args);
    }
}
```

---

#### 7. @Transactional 失效场景

**核心答案：**

@Transactional 基于 AOP 代理实现，某些场景下代理会失效。

**常见失效场景：**

1. **方法不是 public**
   ```java
   // ❌ 事务不生效
   @Transactional
   private void saveUser(User user) {
       userRepository.save(user);
   }
   
   // ✅ 事务生效
   @Transactional
   public void saveUser(User user) {
       userRepository.save(user);
   }
   ```

2. **同类内部调用**
   ```java
   @Service
   public class UserService {
       // ❌ 事务不生效（内部调用）
       public void createUser(User user) {
           saveUser(user);  // 直接调用，绕过代理
       }
       
       @Transactional
       public void saveUser(User user) {
           userRepository.save(user);
       }
   }
   
   // ✅ 解决方案1：注入自己
   @Service
   public class UserService {
       @Autowired
       private UserService self;
       
       public void createUser(User user) {
           self.saveUser(user);  // 通过代理调用
       }
       
       @Transactional
       public void saveUser(User user) {
           userRepository.save(user);
       }
   }
   
   // ✅ 解决方案2：拆分服务
   @Service
   public class UserService {
       @Autowired
       private UserTransactionService transactionService;
       
       public void createUser(User user) {
           transactionService.saveUser(user);
       }
   }
   
   @Service
   public class UserTransactionService {
       @Transactional
       public void saveUser(User user) {
           userRepository.save(user);
       }
   }
   ```

3. **异常被捕获**
   ```java
   // ❌ 事务不回滚
   @Transactional
   public void saveUser(User user) {
       try {
           userRepository.save(user);
           throw new Exception("error");
       } catch (Exception e) {
           // 异常被捕获，事务不回滚
       }
   }
   
   // ✅ 手动回滚
   @Transactional
   public void saveUser(User user) {
       try {
           userRepository.save(user);
           throw new Exception("error");
       } catch (Exception e) {
           TransactionAspectSupport.currentTransactionStatus()
                   .setRollbackOnly();
       }
   }
   ```

4. **异常类型不匹配**
   ```java
   // ❌ 默认只回滚 RuntimeException 和 Error
   @Transactional
   public void saveUser(User user) throws Exception {
       userRepository.save(user);
       throw new Exception("error");  // 不回滚
   }
   
   // ✅ 指定回滚异常
   @Transactional(rollbackFor = Exception.class)
   public void saveUser(User user) throws Exception {
       userRepository.save(user);
       throw new Exception("error");  // 回滚
   }
   ```

5. **数据库不支持事务**
   ```java
   // MyISAM 引擎不支持事务，必须使用 InnoDB
   ```

6. **未启用事务管理**
   ```java
   // 确保启用了事务管理
   @SpringBootApplication
   @EnableTransactionManagement  // 通常自动启用
   public class Application {
       // ...
   }
   ```

---

#### 8. Spring Boot 启动流程

**核心答案：**

Spring Boot 启动流程分为多个阶段。

**启动流程图：**

```
┌─────────────────────────────────────────────────────────────┐
│                    Spring Boot 启动流程                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SpringApplication.run()                                 │
│     └─▶ 创建 SpringApplication 实例                        │
│                                                              │
│  2. 准备环境（Environment）                                 │
│     └─▶ 加载配置文件                                        │
│     └─▶ 激活 Profile                                        │
│                                                              │
│  3. 创建 ApplicationContext                                 │
│     └─▶ Web 应用：AnnotationConfigServletWebServerApplicationContext│
│     └─▶ 非 Web：AnnotationConfigApplicationContext         │
│                                                              │
│  4. 准备 Context                                            │
│     └─▶ 设置 Environment                                    │
│     └─▶ 应用 Initializers                                   │
│     └─▶ 发布 ApplicationContextInitializedEvent            │
│                                                              │
│  5. 刷新 Context（refresh）                                 │
│     └─▶ 注册 BeanDefinition                                 │
│     └─▶ 实例化 Bean                                         │
│     └─▶ 自动配置生效                                        │
│     └─▶ 启动内嵌服务器                                      │
│                                                              │
│  6. 完成启动                                                │
│     └─▶ 发布 ApplicationReadyEvent                          │
│     └─▶ 执行 CommandLineRunner/ApplicationRunner           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**启动监听器：**

```java
// 1. ApplicationContextInitializer
public class CustomInitializer 
        implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    
    @Override
    public void initialize(ConfigurableApplicationContext context) {
        System.out.println("ApplicationContextInitializer");
    }
}

// 2. ApplicationListener
@Component
public class CustomListener implements ApplicationListener<ApplicationReadyEvent> {
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        System.out.println("Application is ready");
    }
}

// 3. CommandLineRunner
@Component
@Order(1)
public class CustomCommandLineRunner implements CommandLineRunner {
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("CommandLineRunner: " + Arrays.toString(args));
    }
}

// 4. ApplicationRunner
@Component
@Order(2)
public class CustomApplicationRunner implements ApplicationRunner {
    
    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("ApplicationRunner");
    }
}
```

**注册 Initializer：**

```properties
# META-INF/spring.factories
org.springframework.context.ApplicationContextInitializer=\
com.example.CustomInitializer
```

---

## B. 避坑指南

### 常见误区

| 误区 | 正确理解 |
|------|----------|
| @Transactional 可以用在私有方法 | 必须是 public 方法 |
| 同类内部调用事务生效 | 内部调用绕过代理，事务失效 |
| 所有异常都会回滚 | 默认只回滚 RuntimeException 和 Error |
| Actuator 端点默认全部暴露 | 默认只暴露 health 和 info |
| @Value 支持松散绑定 | 只有 @ConfigurationProperties 支持 |
| Starter 包含业务代码 | Starter 只包含依赖和自动配置 |

### 性能优化清单

```
✅ 启动优化
  - 使用 spring-boot-devtools 开发时热部署
  - 排除不需要的自动配置
  - 延迟初始化（spring.main.lazy-initialization=true）
  - 使用 GraalVM Native Image

✅ 运行时优化
  - 合理配置连接池（HikariCP）
  - 启用 HTTP/2
  - 使用缓存（Redis、Caffeine）
  - 异步处理（@Async）

✅ 监控优化
  - 启用 Actuator 监控
  - 集成 Prometheus + Grafana
  - 配置日志级别
  - 使用 APM 工具（SkyWalking、Pinpoint）

✅ 安全优化
  - 限制 Actuator 端点访问
  - 启用 HTTPS
  - 配置 CORS
  - 使用 Spring Security
```

---

## C. 面试技巧

### 1. 回答框架

```
1. 概念定义
   - Spring Boot 是什么
   - 核心特点
   - 适用场景

2. 技术细节
   - 自动配置原理
   - Starter 机制
   - Actuator 功能
   - 事务管理

3. 实战经验
   - 项目中如何使用
   - 遇到的问题和解决方案
   - 性能优化经验

4. 对比分析
   - Spring Boot vs Spring
   - @ConfigurationProperties vs @Value
   - 不同配置方式对比
```

### 2. 加分项

```
✅ 了解自动配置原理
✅ 掌握 Starter 自定义
✅ 熟悉 Actuator 监控
✅ 理解事务失效场景
✅ 掌握配置优先级
✅ 有性能优化经验
✅ 了解 Spring Boot 3 新特性

❌ 只知道基本使用
❌ 不了解底层原理
❌ 没有实战经验
❌ 不会排查问题
```

### 3. 高频问题

```
1. Spring Boot 自动配置原理是什么？
2. Starter 的作用和原理？
3. @Transactional 什么时候会失效？
4. 配置文件的加载顺序？
5. Actuator 有哪些常用端点？
6. 如何自定义 Starter？
7. Spring Boot 启动流程？
8. 如何优化启动速度？
9. Spring Boot 2 vs 3 的区别？
10. 如何实现优雅停机？
```

---

## D. 参考资料

### 官方资源

- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/reference/)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/how-to/actuator.html)
- [Spring Boot GitHub](https://github.com/spring-projects/spring-boot)

### 学习资源

- [Spring Boot 快速开始](https://spring.io/quickstart)
- [Spring Boot Guides](https://spring.io/guides)
- [Baeldung Spring Boot](https://www.baeldung.com/spring-boot)

### 常用工具

- [Spring Initializr](https://start.spring.io/)
- [Spring Boot CLI](https://docs.spring.io/spring-boot/cli.html)
- [Spring Boot DevTools](https://docs.spring.io/spring-boot/reference/using/devtools.html)

### 学习路线

```
初级（1-2周）：
- Spring Boot 基础
- 自动配置
- Starter 使用
- 配置文件

中级（2-3周）：
- 自动配置原理
- 自定义 Starter
- Actuator 监控
- 事务管理

高级（3-4周）：
- 启动流程
- 性能优化
- 问题排查
- Spring Boot 3 新特性
```

### 实战建议

```
1. 创建自定义 Starter
2. 集成 Actuator 监控
3. 实践事务管理
4. 优化启动速度
5. 排查常见问题
6. 学习源码实现
```


### 进阶题（续）

#### 9. Spring Boot 与 Spring Cloud 集成

**核心答案：**

Spring Cloud 基于 Spring Boot 构建，提供微服务架构的完整解决方案。

**核心组件：**

| 组件 | 功能 | 实现 |
|------|------|------|
| 服务注册与发现 | 服务注册中心 | Eureka、Consul、Nacos |
| 配置中心 | 集中配置管理 | Config Server、Nacos |
| 负载均衡 | 客户端负载均衡 | Ribbon、LoadBalancer |
| 服务调用 | 声明式 HTTP 客户端 | OpenFeign |
| 熔断器 | 服务降级和熔断 | Resilience4j、Sentinel |
| 网关 | API 网关 | Spring Cloud Gateway |
| 链路追踪 | 分布式追踪 | Sleuth + Zipkin |
| 消息总线 | 配置刷新 | Spring Cloud Bus |

**Eureka 服务注册示例：**

```java
// Eureka Server
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

```yaml
# Eureka Server 配置
server:
  port: 8761

eureka:
  instance:
    hostname: localhost
  client:
    register-with-eureka: false
    fetch-registry: false
    service-url:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
```

```java
// Eureka Client（服务提供者）
@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

```yaml
# Eureka Client 配置
spring:
  application:
    name: user-service

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
    lease-renewal-interval-in-seconds: 30
```

**OpenFeign 服务调用：**

```java
// 启用 Feign
@SpringBootApplication
@EnableFeignClients
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}

// Feign 客户端
@FeignClient(name = "user-service", fallback = UserServiceFallback.class)
public interface UserServiceClient {
    
    @GetMapping("/api/users/{id}")
    User getUserById(@PathVariable("id") Long id);
    
    @PostMapping("/api/users")
    User createUser(@RequestBody User user);
}

// 降级处理
@Component
public class UserServiceFallback implements UserServiceClient {
    
    @Override
    public User getUserById(Long id) {
        return new User(id, "默认用户", "fallback@example.com");
    }
    
    @Override
    public User createUser(User user) {
        throw new RuntimeException("服务不可用");
    }
}
```

**Spring Cloud Gateway：**

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
            - AddRequestHeader=X-Request-Source, Gateway
            
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1
            - name: CircuitBreaker
              args:
                name: orderCircuitBreaker
                fallbackUri: forward:/fallback/orders
```

---

#### 10. Spring Boot 数据访问

**核心答案：**

Spring Boot 提供多种数据访问方式。

**Spring Data JPA：**

```java
// Entity
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 50)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private Integer age;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // getters and setters
}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 方法名查询
    List<User> findByName(String name);
    List<User> findByAgeGreaterThan(Integer age);
    List<User> findByNameAndEmail(String name, String email);
    
    // @Query 查询
    @Query("SELECT u FROM User u WHERE u.email LIKE %:keyword%")
    List<User> searchByEmail(@Param("keyword") String keyword);
    
    // 原生 SQL
    @Query(value = "SELECT * FROM users WHERE age > ?1", nativeQuery = true)
    List<User> findUsersOlderThan(Integer age);
    
    // 分页查询
    Page<User> findByName(String name, Pageable pageable);
    
    // 自定义更新
    @Modifying
    @Query("UPDATE User u SET u.name = :name WHERE u.id = :id")
    int updateName(@Param("id") Long id, @Param("name") String name);
}

// Service
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    public Page<User> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, si
ert(User user);
    
    @Update("UPDATE users SET name = #{name}, email = #{email} WHERE id = #{id}")
    int update(User user);
    
    @Delete("DELETE FROM users WHERE id = #{id}")
    int delete(Long id);
}
```

**多数据源配置：**

```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    @ConfigurationProperties("spring.datasource.secondary")
    public DataSource secondaryDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    @Primary
    public JdbcTemplate primaryJdbcTemplate(@Qualifier("primaryDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
    
    @Bean
    public JdbcTemplate secondaryJdbcTemplate(@Qualifier("secondaryDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
```

---

### 高级题

#### 11. Spring Boot 性能优化

**核心答案：**

性能优化需要从多个维度进行。

**启动优化：**

```yaml
# 延迟初始化
spring:
  main:
    lazy-initialization: true

# 排除不需要的自动配置
spring:
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
      - org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration
```

```java
// 条件化 Bean
@Configuration
public class OptimizationConfig {
    
    @Bean
    @ConditionalOnProperty(name = "feature.cache.enabled", havingValue = "true")
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }
}
```

**连接池优化（HikariCP）：**

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      connection-test-query: SELECT 1
```

**缓存优化：**

```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();
        
        return RedisCacheManager.builder(factory)
                .cacheDefaults(config)
                .build();
    }
}

@Service
public class UserService {
    
    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    @CachePut(value = "users", key = "#user.id")
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    @CacheEvict(value = "users", key = "#id")
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
```

**异步处理：**

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

@Service
public class EmailService {
    
    @Async
    public CompletableFuture<Void> sendEmail(String to, String subject, String content) {
        // 发送邮件逻辑
        return CompletableFuture.completedFuture(null);
    }
}
```

---

#### 12. Spring Boot 安全

**核心答案：**

Spring Security 提供完整的安全解决方案。

**基础配置：**

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) 
            throws Exception {
        return config.getAuthenticationManager();
    }
}
```

**JWT 认证：**

```java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private long expiration;
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities());
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS512, secret)
                .compact();
    }
    
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) 
            throws ServletException, IOException {
        
        String token = getTokenFromRequest(request);
        
        if (token != null && tokenProvider.validateToken(token)) {
            String username = tokenProvider.getUsernameFromToken(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

**方法级安全：**

```java
@Configuration
@EnableMethodSecurity
public class MethodSecurityConfig {
}

@Service
public class UserService {
    
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    @PreAuthorize("hasRole('USER') and #id == authentication.principal.id")
    public User updateUser(Long id, User user) {
        return userRepository.save(user);
    }
    
    @PostAuthorize("returnObject.username == authentication.principal.username")
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
```

---

#### 13. Spring Boot 测试

**核心答案：**

Spring Boot 提供完整的测试支持。

**单元测试：**

```java
@SpringBootTest
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @MockBean
    private UserRepository userRepository;
    
    @Test
    void testGetUserById() {
        // Given
        User user = new User(1L, "John", "john@example.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        // When
        User result = userService.getUserById(1L);
        
        // Then
        assertNotNull(result);
        assertEquals("John", result.getName());
        verify(userRepository, times(1)).findById(1L);
    }
}
```

**集成测试：**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    void testCreateUser() throws Exception {
        User user = new User(null, "John", "john@example.com", 25);
        
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("John"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }
    
    @Test
    void testGetUser() throws Exception {
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }
}
```

**测试配置：**

```java
@TestConfiguration
public class TestConfig {
    
    @Bean
    @Primary
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.H2)
                .build();
    }
}
```

---

#### 14. Spring Boot 3 新特性

**核心答案：**

Spring Boot 3 带来重大更新。

**主要变化：**

1. **Java 17 基线**
   - 最低要求 Java 17
   - 支持 Java 21

2. **Jakarta EE 9+**
   - 包名从 `javax.*` 迁移到 `jakarta.*`
   - 需要更新依赖

3. **Native Image 支持**
   - GraalVM Native Image
   - 更快的启动速度
   - 更低的内存占用

4. **Observability 改进**
   - Micrometer Observation API
   - 统一的可观测性

5. **HTTP 接口**
   - 声明式 HTTP 客户端
   - 类似 Feign 的功能

**HTTP 接口示例：**

```java
@HttpExchange("/api/users")
public interface UserClient {
    
    @GetExchange("/{id}")
    User getUser(@PathVariable Long id);
    
    @PostExchange
    User createUser(@RequestBody User user);
    
    @PutExchange("/{id}")
    User updateUser(@PathVariable Long id, @RequestBody User user);
    
    @DeleteExchange("/{id}")
    void deleteUser(@PathVariable Long id);
}

@Configuration
public class HttpClientConfig {
    
    @Bean
    public UserClient userClient() {
        WebClient webClient = WebClient.builder()
                .baseUrl("http://localhost:8080")
                .build();
        
        HttpServiceProxyFactory factory = HttpServiceProxyFactory
                .builder(WebClientAdapter.forClient(webClient))
                .build();
        
        return factory.createClient(UserClient.class);
    }
}
```

**Native Image 配置：**

```xml
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
</plugin>
```

```bash
# 构建 Native Image
./mvnw -Pnative native:compile

# 运行
./target/myapp
```

---

#### 15. Spring Boot 微服务最佳实践

**核心答案：**

微服务架构需要遵循最佳实践。

**服务拆分原则：**

1. **单一职责**：每个服务只负责一个业务领域
2. **高内聚低耦合**：服务内部高内聚，服务间低耦合
3. **独立部署**：服务可以独立部署和扩展
4. **数据独立**：每个服务有自己的数据库

**配置管理：**

```yaml
# bootstrap.yml
spring:
  application:
    name: user-service
  cloud:
    config:
      uri: http://localhost:8888
      profile: dev
      label: master
```

**健康检查：**

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        // 检查数据库连接
        boolean dbUp = checkDatabase();
        // 检查 Redis 连接
        boolean redisUp = checkRedis();
        
        if (dbUp && redisUp) {
            return Health.up()
                    .withDetail("database", "available")
                    .withDetail("redis", "available")
                    .build();
        } else {
            return Health.down()
                    .withDetail("database", dbUp ? "available" : "unavailable")
                    .withDetail("redis", redisUp ? "available" : "unavailable")
                    .build();
        }
    }
}
```

**分布式追踪：**

```yaml
spring:
  sleuth:
    sampler:
      probability: 1.0
  zipkin:
    base-url: http://localhost:9411
```

**限流和熔断：**

```java
@Configuration
public class Resilience4jConfig {
    
    @Bean
    public CircuitBreakerConfig circuitBreakerConfig() {
        return CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofMillis(1000))
                .slidingWindowSize(10)
                .build();
    }
    
    @Bean
    public RateLimiterConfig rateLimiterConfig() {
        return RateLimiterConfig.custom()
                .limitForPeriod(10)
                .limitRefreshPeriod(Duration.ofSeconds(1))
                .timeoutDuration(Duration.ofMillis(500))
                .build();
    }
}

@Service
public class UserService {
    
    @CircuitBreaker(name = "userService", fallbackMethod = "getUserFallback")
    @RateLimiter(name = "userService")
    public User getUser(Long id) {
        return userClient.getUser(id);
    }
    
    private User getUserFallback(Long id, Exception e) {
        return new User(id, "默认用户", "fallback@example.com");
    }
}
```
