# Spring Boot 面试题集

> Spring Boot 核心知识点与高频面试题 (2024-2025)

## A. 面试宝典

### 基础题

#### 1. Spring Boot 自动配置原理

```java
@SpringBootApplication  // 核心注解
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// @SpringBootApplication 包含：
@SpringBootConfiguration  // 等同于 @Configuration
@EnableAutoConfiguration  // 启用自动配置
@ComponentScan            // 组件扫描
```

**自动配置流程：**
1. `@EnableAutoConfiguration` 导入 `AutoConfigurationImportSelector`
2. 读取 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
3. 根据 `@Conditional` 条件过滤配置类
4. 加载符合条件的配置

```java
// 自动配置类示例
@AutoConfiguration
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
public class DataSourceAutoConfiguration {

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }
}
```

**常用 @Conditional 注解：**
| 注解 | 条件 |
|------|------|
| @ConditionalOnClass | 类路径存在指定类 |
| @ConditionalOnMissingClass | 类路径不存在指定类 |
| @ConditionalOnBean | 容器中存在指定 Bean |
| @ConditionalOnMissingBean | 容器中不存在指定 Bean |
| @ConditionalOnProperty | 配置属性满足条件 |
| @ConditionalOnWebApplication | 是 Web 应用 |

---

#### 2. Spring Bean 生命周期

```
1. 实例化 (Instantiation)
   ↓
2. 属性填充 (Populate Properties)
   ↓
3. Aware 接口回调
   - BeanNameAware.setBeanName()
   - BeanFactoryAware.setBeanFactory()
   - ApplicationContextAware.setApplicationContext()
   ↓
4. BeanPostProcessor.postProcessBeforeInitialization()
   ↓
5. 初始化
   - @PostConstruct
   - InitializingBean.afterPropertiesSet()
   - @Bean(initMethod = "init")
   ↓
6. BeanPostProcessor.postProcessAfterInitialization()
   ↓
7. Bean 就绪，可使用
   ↓
8. 销毁
   - @PreDestroy
   - DisposableBean.destroy()
   - @Bean(destroyMethod = "cleanup")
```

```java
@Component
public class MyBean implements InitializingBean, DisposableBean,
        BeanNameAware, ApplicationContextAware {

    @PostConstruct
    public void postConstruct() {
        System.out.println("3. @PostConstruct");
    }

    @Override
    public void afterPropertiesSet() {
        System.out.println("4. InitializingBean.afterPropertiesSet");
    }

    @PreDestroy
    public void preDestroy() {
        System.out.println("5. @PreDestroy");
    }

    @Override
    public void destroy() {
        System.out.println("6. DisposableBean.destroy");
    }

    @Override
    public void setBeanName(String name) {
        System.out.println("1. BeanNameAware.setBeanName: " + name);
    }

    @Override
    public void setApplicationContext(ApplicationContext ctx) {
        System.out.println("2. ApplicationContextAware");
    }
}
```

---

#### 3. 依赖注入方式

```java
// 1. 构造器注入（推荐）
@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;

    // 单构造器可省略 @Autowired
    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
}

// 2. Setter 注入
@Service
public class UserService {
    private UserRepository userRepository;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// 3. 字段注入（不推荐）
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

**构造器注入优势：**
- 依赖不可变（final）
- 避免循环依赖
- 便于测试
- 不依赖反射

---

#### 4. AOP 面向切面编程

```java
@Aspect
@Component
public class LogAspect {

    // 切点定义
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceLayer() {}

    // 前置通知
    @Before("serviceLayer()")
    public void before(JoinPoint jp) {
        String method = jp.getSignature().getName();
        System.out.println("Before: " + method);
    }

    // 后置通知
    @After("serviceLayer()")
    public void after(JoinPoint jp) {
        System.out.println("After");
    }

    // 返回通知
    @AfterReturning(pointcut = "serviceLayer()", returning = "result")
    public void afterReturning(Object result) {
        System.out.println("AfterReturning: " + result);
    }

    // 异常通知
    @AfterThrowing(pointcut = "serviceLayer()", throwing = "ex")
    public void afterThrowing(Exception ex) {
        System.out.println("AfterThrowing: " + ex.getMessage());
    }

    // 环绕通知
    @Around("serviceLayer()")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return pjp.proceed();
        } finally {
            long time = System.currentTimeMillis() - start;
            System.out.println("执行时间: " + time + "ms");
        }
    }
}

// 切点表达式
// execution(修饰符? 返回类型 包名.类名.方法名(参数) 异常?)
// execution(* com.example.service.*.*(..))  // service 包所有方法
// execution(* com.example..*.*(..))         // com.example 及子包
// @annotation(com.example.Log)              // 有 @Log 注解的方法
// within(com.example.service.*)             // service 包内所有类
```

---

#### 5. 事务管理

```java
@Service
public class OrderService {

    @Transactional
    public void createOrder(Order order) {
        // 业务逻辑
    }

    @Transactional(
        propagation = Propagation.REQUIRED,  // 传播行为
        isolation = Isolation.DEFAULT,        // 隔离级别
        timeout = 30,                         // 超时（秒）
        readOnly = false,                     // 只读
        rollbackFor = Exception.class,        // 回滚异常
        noRollbackFor = BusinessException.class  // 不回滚异常
    )
    public void updateOrder(Order order) {
        // 业务逻辑
    }
}
```

**传播行为：**
| 传播行为 | 说明 |
|---------|------|
| REQUIRED | 存在事务则加入，否则创建新事务（默认） |
| REQUIRES_NEW | 总是创建新事务，挂起当前事务 |
| NESTED | 存在事务则创建嵌套事务 |
| SUPPORTS | 存在事务则加入，否则非事务运行 |
| NOT_SUPPORTED | 非事务运行，挂起当前事务 |
| MANDATORY | 必须在事务中，否则抛异常 |
| NEVER | 非事务运行，存在事务则抛异常 |

**事务失效场景：**
1. 方法不是 public
2. 同类内部调用（未通过代理）
3. 异常被捕获未抛出
4. 回滚异常类型不匹配

---

### 进阶题

#### 6. Spring Boot 启动流程

```java
public ConfigurableApplicationContext run(String... args) {
    // 1. 创建计时器
    StopWatch stopWatch = new StopWatch();
    stopWatch.start();

    // 2. 获取 SpringApplicationRunListeners
    SpringApplicationRunListeners listeners = getRunListeners(args);
    listeners.starting();

    // 3. 准备环境
    ConfigurableEnvironment environment = prepareEnvironment(listeners, args);

    // 4. 打印 Banner
    printBanner(environment);

    // 5. 创建 ApplicationContext
    context = createApplicationContext();

    // 6. 准备上下文
    prepareContext(context, environment, listeners, args);

    // 7. 刷新上下文（核心：Bean 实例化）
    refreshContext(context);

    // 8. 执行 Runner
    callRunners(context, args);

    // 9. 发布 ApplicationReadyEvent
    listeners.running(context);

    return context;
}
```

---

#### 7. 循环依赖解决

```java
// Spring 通过三级缓存解决 Setter 注入的循环依赖

// 一级缓存：完整的 Bean
Map<String, Object> singletonObjects;

// 二级缓存：早期暴露的 Bean（未完成属性填充）
Map<String, Object> earlySingletonObjects;

// 三级缓存：Bean 工厂
Map<String, ObjectFactory<?>> singletonFactories;

// 构造器注入的循环依赖无法解决
// 解决方案：
// 1. 使用 @Lazy 延迟加载
@Service
public class A {
    private final B b;

    public A(@Lazy B b) {
        this.b = b;
    }
}

// 2. 重构设计，消除循环依赖
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "@Transactional 在 private 方法上生效" | 只对 public 方法生效 |
| "Spring 单例 Bean 是线程安全的" | 单例只保证一个实例，线程安全需自行处理 |
| "循环依赖都能解决" | 构造器注入的循环依赖无法解决 |
| "@Async 直接调用会异步" | 同类内部调用不会生效 |
| "所有异常都会回滚事务" | 默认只回滚 RuntimeException |

---

## B. 实战文档

### 常用代码模板

```java
// RESTful Controller
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> list() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> get(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDTO> create(@Valid @RequestBody CreateUserRequest request) {
        UserDTO created = userService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

// 全局异常处理
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(404, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .toList();
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(400, "Validation failed", errors));
    }
}
```
