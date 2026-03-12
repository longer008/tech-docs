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

**追问点：**

**Q1: Spring Boot 相比传统 Spring 的优势？**

A: Spring Boot 显著简化了 Spring 应用开发：
- **配置简化**：自动配置替代大量 XML 配置，减少 80% 配置代码
- **依赖管理**：Starter 依赖解决版本冲突，一键引入功能模块
- **部署简化**：内嵌服务器，jar 包直接运行，无需外部容器
- **开发效率**：约定优于配置，快速搭建项目骨架
- **生产就绪**：内置监控、健康检查等运维功能

**Q2: @SpringBootApplication 注解的作用？**

A: @SpringBootApplication 是复合注解，包含三个核心注解：
- **@SpringBootConfiguration**：标识为配置类，等同于 @Configuration
- **@EnableAutoConfiguration**：启用自动配置机制
- **@ComponentScan**：启用组件扫描，默认扫描当前包及子包
- **exclude 属性**：可排除特定的自动配置类
- **scanBasePackages**：指定组件扫描的基础包

**Q3: Spring Boot 的约定优于配置体现在哪里？**

A: Spring Boot 通过合理的默认配置减少开发者的配置工作：
- **目录结构**：src/main/java、src/main/resources 等标准 Maven 结构
- **配置文件**：application.properties/yml 自动加载
- **端口配置**：默认 8080 端口，可通过 server.port 修改
- **数据库连接**：根据依赖自动配置数据源和 JPA
- **日志配置**：默认使用 Logback，支持多种日志级别

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
│                                                              │
│  2. 扫描 META-INF/spring.factories                         │
│     └─▶ 加载自动配置类                                      │
│                                                              │
│  3. 条件注解判断                                            │
│     └─▶ @ConditionalOnClass                                 │
│     └─▶ @ConditionalOnMissingBean                           │
│     └─▶ @ConditionalOnProperty                              │
│                                                              │
│  4. 满足条件的配置生效                                      │
│     └─▶ 创建并注册 Bean                                     │
│                                                              │
│  5. 应用配置文件中的属性                                    │
│     └─▶ 覆盖默认配置                                        │
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

**追问点：**

**Q1: 自动配置的条件注解有哪些？**

A: Spring Boot 提供多种条件注解来控制自动配置的生效条件：
- **@ConditionalOnClass**：类路径存在指定类时生效
- **@ConditionalOnMissingClass**：类路径不存在指定类时生效
- **@ConditionalOnBean**：容器中存在指定 Bean 时生效
- **@ConditionalOnMissingBean**：容器中不存在指定 Bean 时生效
- **@ConditionalOnProperty**：配置文件中存在指定属性时生效
- **@ConditionalOnResource**：类路径存在指定资源时生效
- **@ConditionalOnWebApplication**：Web 应用时生效

**Q2: 如何排除特定的自动配置？**

A: 可以通过多种方式排除不需要的自动配置：
```java
// 方式1：@SpringBootApplication 注解排除
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// 方式2：@EnableAutoConfiguration 注解排除
@EnableAutoConfiguration(exclude = {DataSourceAutoConfiguration.class})

// 方式3：配置文件排除
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
```

**Q3: 如何自定义自动配置类？**

A: 创建自定义自动配置需要以下步骤：
1. **创建配置类**：使用 @Configuration 和条件注解
2. **创建属性类**：使用 @ConfigurationProperties 绑定配置
3. **注册配置类**：在 META-INF/spring.factories 中注册
```java
// 1. 自动配置类
@Configuration
@ConditionalOnClass(RedisTemplate.class)
@EnableConfigurationProperties(RedisProperties.class)
public class RedisAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        // 配置 RedisTemplate
        return template;
    }
}

// 2. 在 spring.factories 中注册
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

**追问点：**

**Q1: Starter 的命名规范是什么？**

A: Spring Boot Starter 有明确的命名规范：
- **官方 Starter**：spring-boot-starter-{name}（如 spring-boot-starter-web）
- **第三方 Starter**：{name}-spring-boot-starter（如 mybatis-spring-boot-starter）
- **避免使用**：spring-boot 作为前缀（官方保留）
- **推荐格式**：{project-name}-spring-boot-starter

**Q2: 如何创建自定义 Starter？**

A: 创建自定义 Starter 的完整步骤：
```xml
<!-- 1. pom.xml 依赖配置 -->
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
    <!-- 业务相关依赖 -->
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>my-library</artifactId>
    </dependency>
</dependencies>
```

```java
// 2. 配置属性类
@ConfigurationProperties(prefix = "my.starter")
public class MyStarterProperties {
    private boolean enabled = true;
    private String name = "default";
    // getters and setters
}

// 3. 自动配置类
@Configuration
@ConditionalOnClass(MyService.class)
@EnableConfigurationProperties(MyStarterProperties.class)
public class MyStarterAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(prefix = "my.starter", name = "enabled", havingValue = "true", matchIfMissing = true)
    public MyService myService(MyStarterProperties properties) {
        return new MyService(properties);
    }
}
```

**Q3: Starter 与普通依赖的区别？**

A: Starter 相比普通依赖有以下优势：
- **依赖聚合**：一个 Starter 包含多个相关依赖，简化依赖管理
- **版本管理**：统一管理依赖版本，避免版本冲突
- **自动配置**：提供开箱即用的配置，减少手动配置
- **最佳实践**：封装官方推荐的配置和使用方式
- **条件装配**：根据环境和条件智能装配 Bean
- **配置提示**：提供 IDE 配置提示和文档

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

**追问点：**

**Q1: @ConfigurationProperties 的松散绑定是什么？**

A: 松散绑定允许配置属性名的多种格式自动映射到 Java 属性：
```yaml
# 配置文件中的多种格式都能绑定到 userName 属性
app:
  user-name: "John"      # kebab-case（推荐）
  user_name: "John"      # snake_case
  userName: "John"       # camelCase
  username: "John"       # lowercase
```

```java
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String userName;  // 所有格式都能正确绑定
    // getter and setter
}
```

**Q2: 如何在 @ConfigurationProperties 中使用校验？**

A: 结合 JSR-303 校验注解实现配置校验：
```java
@Component
@ConfigurationProperties(prefix = "app")
@Validated
public class AppProperties {
    
    @NotBlank(message = "应用名称不能为空")
    @Size(min = 2, max = 50, message = "应用名称长度必须在2-50之间")
    private String name;
    
    @Min(value = 1, message = "端口号必须大于0")
    @Max(value = 65535, message = "端口号必须小于65536")
    private int port;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Valid  // 嵌套对象校验
    private DatabaseConfig database;
    
    // getters and setters
}
```

**Q3: @Value 支持哪些高级用法？**

A: @Value 支持多种高级特性：
```java
@Component
public class ValueExamples {
    
    // 1. 默认值
    @Value("${app.name:MyApp}")
    private String appName;
    
    // 2. SpEL 表达式
    @Value("#{systemProperties['user.home']}")
    private String userHome;
    
    // 3. 数学运算
    @Value("#{${app.max-connections:10} * 2}")
    private int maxConnections;
    
    // 4. 条件表达式
    @Value("#{${app.debug:false} ? 'DEBUG' : 'INFO'}")
    private String logLevel;
    
    // 5. 调用其他 Bean 的方法
    @Value("#{@myService.getConfig()}")
    private String config;
    
    // 6. 集合操作（需要配合 @Value 和 SpEL）
    @Value("#{'${app.servers}'.split(',')}")
    private List<String> servers;
}

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

**追问点：**

**Q1: 如何保护 Actuator 端点的安全？**

A: 可以通过多种方式保护 Actuator 端点：
```yaml
# 1. 限制暴露的端点
management:
  endpoints:
    web:
      exposure:
        include: "health,info"  # 只暴露必要端点
        exclude: "shutdown,env"  # 排除敏感端点

# 2. 修改端点路径
management:
  endpoints:
    web:
      base-path: /manage  # 修改基础路径
      path-mapping:
        health: healthcheck  # 修改具体端点路径

# 3. 限制访问端口
management:
  server:
    port: 8081  # 使用不同端口
    address: 127.0.0.1  # 只允许本地访问
```

```java
// 4. Spring Security 配置
@Configuration
@EnableWebSecurity
public class ActuatorSecurityConfig {
    
    @Bean
    public SecurityFilterChain actuatorFilterChain(HttpSecurity http) throws Exception {
        http.requestMatcher(EndpointRequest.toAnyEndpoint())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(EndpointRequest.to("health", "info")).permitAll()
                .requestMatchers(EndpointRequest.toAnyEndpoint()).hasRole("ADMIN")
            )
            .httpBasic();
        return http.build();
    }
}
```

**Q2: 如何自定义健康检查指标？**

A: 创建自定义健康检查指标：
```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public Health health() {
        try {
            // 检查数据库连接
            Connection connection = dataSource.getConnection();
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery("SELECT 1");
            
            if (resultSet.next()) {
                return Health.up()
                        .withDetail("database", "available")
                        .withDetail("connection-pool", getConnectionPoolInfo())
                        .withDetail("response-time", measureResponseTime())
                        .build();
            }
        } catch (Exception e) {
            return Health.down()
                    .withDetail("database", "unavailable")
                    .withDetail("error", e.getMessage())
                    .withException(e)
                    .build();
        }
        
        return Health.unknown().build();
    }
    
    private Map<String, Object> getConnectionPoolInfo() {
        // 获取连接池信息
        return Map.of(
            "active", 5,
            "idle", 3,
            "max", 10
        );
    }
    
    private long measureResponseTime() {
        // 测量响应时间
        return System.currentTimeMillis();
    }
}
```

**Q3: 如何创建自定义 Actuator 端点？**

A: 创建自定义端点的完整示例：
```java
@Component
@Endpoint(id = "custom")
public class CustomEndpoint {
    
    // GET /actuator/custom
    @ReadOperation
    public Map<String, Object> customInfo() {
        return Map.of(
            "status", "running",
            "version", "1.0.0",
            "uptime", getUptime(),
            "memory", getMemoryInfo()
        );
    }
    
    // GET /actuator/custom/{name}
    @ReadOperation
    public String customInfo(@Selector String name) {
        return "Custom info for: " + name;
    }
    
    // POST /actuator/custom
    @WriteOperation
    public String updateConfig(@Nullable String configKey, 
                              @Nullable String configValue) {
        // 更新配置逻辑
        return "Updated config: " + configKey + " = " + configValue;
    }
    
    // DELETE /actuator/custom/{name}
    @DeleteOperation
    public String deleteConfig(@Selector String name) {
        // 删除配置逻辑
        return "Deleted config: " + name;
    }
    
    private long getUptime() {
        return ManagementFactory.getRuntimeMXBean().getUptime();
    }
    
    private Map<String, Object> getMemoryInfo() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        
        return Map.of(
            "heap-used", heapUsage.getUsed(),
            "heap-max", heapUsage.getMax(),
            "heap-committed", heapUsage.getCommitted()
        );
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

**追问点：**

**Q1: Profile 的激活方式有哪些？**

A: Spring Boot 支持多种 Profile 激活方式：
```yaml
# 1. 配置文件激活
spring:
  profiles:
    active: dev,mysql  # 激活多个 profile

# 2. 命令行激活
java -jar app.jar --spring.profiles.active=prod

# 3. 环境变量激活
export SPRING_PROFILES_ACTIVE=prod

# 4. JVM 系统属性激活
java -Dspring.profiles.active=prod -jar app.jar

# 5. 程序代码激活
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.setAdditionalProfiles("dev");  // 添加额外的 profile
        app.run(args);
    }
}
```

**Q2: 如何实现条件化配置？**

A: 使用 @Profile 和 @ConditionalOnProperty 实现条件化配置：
```java
// 1. 基于 Profile 的条件配置
@Configuration
@Profile("dev")
public class DevConfig {
    
    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.H2)
                .build();
    }
}

@Configuration
@Profile("prod")
public class ProdConfig {
    
    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
        return new HikariDataSource(config);
    }
}

// 2. 基于属性的条件配置
@Configuration
@ConditionalOnProperty(name = "app.cache.enabled", havingValue = "true")
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }
}

// 3. 复合条件配置
@Configuration
@Profile("!test")  // 非 test 环境
@ConditionalOnProperty(name = "app.feature.enabled", havingValue = "true", matchIfMissing = true)
public class FeatureConfig {
    
    @Bean
    public FeatureService featureService() {
        return new FeatureServiceImpl();
    }
}
```

**Q3: 外部配置文件的加载机制？**

A: Spring Boot 支持多种外部配置文件加载方式：
```bash
# 1. 命令行指定配置文件
java -jar app.jar --spring.config.location=classpath:/custom.properties,/opt/config/

# 2. 指定配置文件名
java -jar app.jar --spring.config.name=myapp

# 3. 指定额外配置位置
java -jar app.jar --spring.config.additional-location=/opt/config/

# 4. 指定导入配置
java -jar app.jar --spring.config.import=optional:file:./dev.properties
```

```yaml
# application.yml 中导入其他配置
spring:
  config:
    import:
      - optional:file:./local.properties  # 可选文件
      - classpath:common.yml              # 类路径文件
      - configtree:/etc/config/           # 配置树（Kubernetes ConfigMap）
```

```java
// 程序中指定配置源
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        
        // 设置额外的配置位置
        app.setAdditionalProfiles("custom");
        
        // 设置默认属性
        Properties defaultProps = new Properties();
        defaultProps.setProperty("server.port", "8080");
        app.setDefaultProperties(defaultProps);
        
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

**追问点：**

**Q1: 事务传播行为有哪些？**

A: Spring 定义了 7 种事务传播行为：
```java
public class TransactionPropagationExample {
    
    // REQUIRED（默认）：如果当前存在事务，则加入该事务；如果不存在，则创建新事务
    @Transactional(propagation = Propagation.REQUIRED)
    public void requiredMethod() { }
    
    // REQUIRES_NEW：总是创建新事务，如果当前存在事务，则挂起当前事务
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void requiresNewMethod() { }
    
    // SUPPORTS：如果当前存在事务，则加入该事务；如果不存在，则以非事务方式执行
    @Transactional(propagation = Propagation.SUPPORTS)
    public void supportsMethod() { }
    
    // NOT_SUPPORTED：以非事务方式执行，如果当前存在事务，则挂起当前事务
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void notSupportedMethod() { }
    
    // MANDATORY：如果当前存在事务，则加入该事务；如果不存在，则抛出异常
    @Transactional(propagation = Propagation.MANDATORY)
    public void mandatoryMethod() { }
    
    // NEVER：以非事务方式执行，如果当前存在事务，则抛出异常
    @Transactional(propagation = Propagation.NEVER)
    public void neverMethod() { }
    
    // NESTED：如果当前存在事务，则在嵌套事务内执行；如果不存在，则创建新事务
    @Transactional(propagation = Propagation.NESTED)
    public void nestedMethod() { }
}
```

**Q2: 事务隔离级别的作用？**

A: 事务隔离级别解决并发事务的问题：
```java
public class TransactionIsolationExample {
    
    // READ_UNCOMMITTED：最低隔离级别，可能出现脏读、不可重复读、幻读
    @Transactional(isolation = Isolation.READ_UNCOMMITTED)
    public void readUncommittedMethod() { }
    
    // READ_COMMITTED：可以避免脏读，但可能出现不可重复读、幻读
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void readCommittedMethod() { }
    
    // REPEATABLE_READ：可以避免脏读、不可重复读，但可能出现幻读
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void repeatableReadMethod() { }
    
    // SERIALIZABLE：最高隔离级别，可以避免脏读、不可重复读、幻读
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void serializableMethod() { }
}

// 并发问题示例
@Service
public class AccountService {
    
    // 脏读示例：读取到未提交的数据
    @Transactional(isolation = Isolation.READ_UNCOMMITTED)
    public BigDecimal getBalance(Long accountId) {
        // 可能读取到其他事务未提交的余额修改
        return accountRepository.findById(accountId).getBalance();
    }
    
    // 不可重复读示例：同一事务中多次读取结果不一致
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void transferMoney(Long fromId, Long toId, BigDecimal amount) {
        BigDecimal balance1 = accountRepository.findById(fromId).getBalance();
        // 此时其他事务可能修改了余额
        BigDecimal balance2 = accountRepository.findById(fromId).getBalance();
        // balance1 可能不等于 balance2
    }
}
```

**Q3: 如何处理事务回滚和异常？**

A: 事务回滚和异常处理的最佳实践：
```java
@Service
public class OrderService {
    
    // 1. 指定回滚异常类型
    @Transactional(rollbackFor = {Exception.class, BusinessException.class})
    public void createOrder(Order order) throws Exception {
        // 所有 Exception 及其子类都会触发回滚
        orderRepository.save(order);
        
        if (order.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("订单金额必须大于0");
        }
    }
    
    // 2. 指定不回滚的异常
    @Transactional(noRollbackFor = {BusinessWarningException.class})
    public void processOrder(Order order) {
        try {
            orderRepository.save(order);
            // BusinessWarningException 不会触发回滚
            throw new BusinessWarningException("库存不足，但订单已保存");
        } catch (BusinessWarningException e) {
            // 记录警告日志，但不影响事务提交
            log.warn("Order warning: {}", e.getMessage());
        }
    }
    
    // 3. 手动控制事务回滚
    @Transactional
    public void complexBusinessLogic(Order order) {
        try {
            orderRepository.save(order);
            
            // 调用外部服务
            paymentService.processPayment(order);
            
        } catch (PaymentException e) {
            // 手动标记事务回滚
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            
            // 记录失败原因
            order.setStatus(OrderStatus.PAYMENT_FAILED);
            order.setFailureReason(e.getMessage());
            orderRepository.save(order);  // 这个保存不会生效，因为事务会回滚
            
            throw new OrderProcessException("订单处理失败", e);
        }
    }
    
    // 4. 事务模板手动控制
    @Autowired
    private TransactionTemplate transactionTemplate;
    
    public void manualTransactionControl(Order order) {
        // 编程式事务管理
        transactionTemplate.execute(status -> {
            try {
                orderRepository.save(order);
                paymentService.processPayment(order);
                return order;
            } catch (Exception e) {
                status.setRollbackOnly();  // 手动回滚
                throw new RuntimeException("Transaction failed", e);
            }
        });
    }
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

**追问点：**

**Q1: SpringApplication 的创建和配置过程？**

A: SpringApplication 的创建和配置包含多个步骤：
```java
public class SpringApplicationExample {
    
    public static void main(String[] args) {
        // 1. 创建 SpringApplication 实例
        SpringApplication app = new SpringApplication(SpringApplicationExample.class);
        
        // 2. 配置应用类型
        app.setWebApplicationType(WebApplicationType.SERVLET);  // SERVLET, REACTIVE, NONE
        
        // 3. 设置初始化器
        app.addInitializers(new CustomApplicationContextInitializer());
        
        // 4. 设置监听器
        app.addListeners(new CustomApplicationListener());
        
        // 5. 设置主要源
        app.setSources(Set.of(SpringApplicationExample.class, AdditionalConfig.class));
        
        // 6. 设置默认属性
        Properties defaultProps = new Properties();
        defaultProps.setProperty("server.port", "8080");
        app.setDefaultProperties(defaultProps);
        
        // 7. 设置额外的 Profile
        app.setAdditionalProfiles("dev", "mysql");
        
        // 8. 设置 Banner 模式
        app.setBannerMode(Banner.Mode.CONSOLE);  // CONSOLE, LOG, OFF
        
        // 9. 设置是否注册关闭钩子
        app.setRegisterShutdownHook(true);
        
        // 10. 运行应用
        ConfigurableApplicationContext context = app.run(args);
    }
}
```

**Q2: ApplicationContext 的创建和刷新过程？**

A: ApplicationContext 的创建和刷新是启动的核心过程：
```java
// ApplicationContext 创建过程
public class ApplicationContextCreationProcess {
    
    // 1. 根据应用类型创建对应的 ApplicationContext
    private ConfigurableApplicationContext createApplicationContext() {
        Class<?> contextClass = this.applicationContextClass;
        if (contextClass == null) {
            try {
                switch (this.webApplicationType) {
                case SERVLET:
                    contextClass = Class.forName("org.springframework.boot.web.servlet.context.AnnotationConfigServletWebServerApplicationContext");
                    break;
                case REACTIVE:
                    contextClass = Class.forName("org.springframework.boot.web.reactive.context.AnnotationConfigReactiveWebServerApplicationContext");
                    break;
                default:
                    contextClass = Class.forName("org.springframework.context.annotation.AnnotationConfigApplicationContext");
                }
            } catch (ClassNotFoundException ex) {
                throw new IllegalStateException("Unable create a default ApplicationContext", ex);
            }
        }
        return (ConfigurableApplicationContext) BeanUtils.instantiateClass(contextClass);
    }
    
    // 2. ApplicationContext 刷新过程（简化版）
    public void refresh() throws BeansException, IllegalStateException {
        synchronized (this.startupShutdownMonitor) {
            // 准备刷新
            prepareRefresh();
            
            // 获取 BeanFactory
            ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
            
            // 准备 BeanFactory
            prepareBeanFactory(beanFactory);
            
            try {
                // 后处理 BeanFactory
                postProcessBeanFactory(beanFactory);
                
                // 调用 BeanFactoryPostProcessor
                invokeBeanFactoryPostProcessors(beanFactory);
                
                // 注册 BeanPostProcessor
                registerBeanPostProcessors(beanFactory);
                
                // 初始化消息源
                initMessageSource();
                
                // 初始化事件多播器
                initApplicationEventMulticaster();
                
                // 刷新特定的 Bean（如启动 Web 服务器）
                onRefresh();
                
                // 注册监听器
                registerListeners();
                
                // 实例化所有非懒加载的单例 Bean
                finishBeanFactoryInitialization(beanFactory);
                
                // 完成刷新
                finishRefresh();
            } catch (BeansException ex) {
                // 销毁已创建的单例 Bean
                destroyBeans();
                
                // 重置 'active' 标志
                cancelRefresh(ex);
                
                throw ex;
            }
        }
    }
}
```

**Q3: 启动过程中的事件发布机制？**

A: Spring Boot 启动过程中会发布多个事件：
```java
// 启动事件监听器
@Component
public class StartupEventListener {
    
    // 1. 应用启动事件
    @EventListener
    public void handleApplicationStartingEvent(ApplicationStartingEvent event) {
        System.out.println("应用开始启动...");
        // 此时 ApplicationContext 还未创建
    }
    
    // 2. 环境准备完成事件
    @EventListener
    public void handleApplicationEnvironmentPreparedEvent(ApplicationEnvironmentPreparedEvent event) {
        System.out.println("环境准备完成，配置文件已加载");
        Environment env = event.getEnvironment();
        System.out.println("Active profiles: " + Arrays.toString(env.getActiveProfiles()));
    }
    
    // 3. ApplicationContext 准备完成事件
    @EventListener
    public void handleApplicationContextInitializedEvent(ApplicationContextInitializedEvent event) {
        System.out.println("ApplicationContext 已创建并初始化");
    }
    
    // 4. ApplicationContext 准备完成事件
    @EventListener
    public void handleApplicationPreparedEvent(ApplicationPreparedEvent event) {
        System.out.println("ApplicationContext 准备完成，即将刷新");
    }
    
    // 5. ApplicationContext 刷新完成事件
    @EventListener
    public void handleContextRefreshedEvent(ContextRefreshedEvent event) {
        System.out.println("ApplicationContext 刷新完成");
    }
    
    // 6. Web 服务器初始化完成事件
    @EventListener
    public void handleServletWebServerInitializedEvent(ServletWebServerInitializedEvent event) {
        System.out.println("Web 服务器启动完成，端口: " + event.getWebServer().getPort());
    }
    
    // 7. 应用启动完成事件
    @EventListener
    public void handleApplicationStartedEvent(ApplicationStartedEvent event) {
        System.out.println("应用启动完成，但 CommandLineRunner 和 ApplicationRunner 还未执行");
    }
    
    // 8. 应用就绪事件
    @EventListener
    public void handleApplicationReadyEvent(ApplicationReadyEvent event) {
        System.out.println("应用完全就绪，可以接收请求");
        // 此时所有初始化工作都已完成
    }
    
    // 9. 应用启动失败事件
    @EventListener
    public void handleApplicationFailedEvent(ApplicationFailedEvent event) {
        System.out.println("应用启动失败: " + event.getException().getMessage());
    }
}

// 自定义启动任务
@Component
@Order(1)  // 执行顺序
public class CustomCommandLineRunner implements CommandLineRunner {
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("执行命令行启动任务: " + Arrays.toString(args));
        
        // 执行初始化逻辑
        initializeData();
        
        // 预热缓存
        warmupCache();
    }
    
    private void initializeData() {
        System.out.println("初始化数据...");
    }
    
    private void warmupCache() {
        System.out.println("预热缓存...");
    }
}

@Component
@Order(2)
public class CustomApplicationRunner implements ApplicationRunner {
    
    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("执行应用启动任务");
        
        // 获取命令行参数
        if (args.containsOption("debug")) {
            System.out.println("调试模式已启用");
        }
        
        // 获取非选项参数
        List<String> nonOptionArgs = args.getNonOptionArgs();
        System.out.println("非选项参数: " + nonOptionArgs);
    }
}
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
