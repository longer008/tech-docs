# MyBatis 面试题集

> MyBatis 核心原理、动态 SQL、缓存机制与高频面试题
> 
> 更新时间：2025-02

## 目录

[[toc]]

## A. 面试宝典

### 基础题

#### 1. 什么是 MyBatis？

**核心答案：**

MyBatis 是一款优秀的持久层框架，支持自定义 SQL、存储过程和高级映射。

**核心特点：**
- SQL 与代码分离
- 灵活的映射机制
- 动态 SQL 支持
- 一级和二级缓存
- 插件扩展机制

**代码示例：**

```java
// Mapper 接口
public interface UserMapper {
    User selectById(Long id);
    List<User> selectAll();
    int insert(User user);
}
```

```xml
<!-- UserMapper.xml -->
<mapper namespace="com.example.mapper.UserMapper">
    <select id="selectById" resultType="User">
        SELECT * FROM user WHERE id = #{id}
    </select>
</mapper>
```

---

#### 2. #{} 和 ${} 的区别

**核心答案：**

| 特性 | #{} | ${} |
|------|-----|-----|
| 处理方式 | 预编译 | 字符串替换 |
| SQL 注入 | 防止 | 不防止 |
| 使用场景 | 参数值 | 表名、列名 |

```xml
<!-- ✅ #{} 预编译，防止 SQL 注入 -->
<select id="selectById" resultType="User">
    SELECT * FROM user WHERE id = #{id}
</select>

<!-- ❌ ${} 字符串替换，存在 SQL 注入风险 -->
<select id="selectByName" resultType="User">
    SELECT * FROM user WHERE name = '${name}'
</select>

<!-- ✅ ${} 用于动态表名 -->
<select id="selectFromTable" resultType="User">
    SELECT * FROM ${tableName} WHERE id = #{id}
</select>
```

---

#### 3. MyBatis 缓存机制

**一级缓存（SqlSession 级别）：**
- 作用域：SqlSession
- 默认：开启
- 清空时机：close()、clearCache()、执行 INSERT/UPDATE/DELETE

**二级缓存（Mapper 级别）：**
- 作用域：Mapper（namespace）
- 默认：关闭
- 需要实体类实现 Serializable

```xml
<!-- 启用二级缓存 -->
<cache eviction="LRU" flushInterval="60000" size="512"/>
```

---

#### 4. resultType 和 resultMap

**resultType：**
- 简单映射，自动匹配
- 列名与属性名一致

**resultMap：**
- 复杂映射，手动配置
- 支持嵌套对象、集合

```xml
<!-- resultMap 示例 -->
<resultMap id="UserResultMap" type="User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
</resultMap>

<!-- 一对多关联 -->
<resultMap id="UserWithOrdersMap" type="User">
    <id property="id" column="user_id"/>
    <collection property="orders" ofType="Order">
        <id property="id" column="order_id"/>
    </collection>
</resultMap>
```

---

#### 5. 动态 SQL

**常用标签：**

```xml
<!-- if 标签 -->
<select id="selectByCondition" resultType="User">
    SELECT * FROM user
    <where>
        <if test="name != null">
            AND name = #{name}
        </if>
        <if test="email != null">
            AND email = #{email}
        </if>
    </where>
</select>

<!-- foreach 标签 -->
<select id="selectByIds" resultType="User">
    SELECT * FROM user WHERE id IN
    <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</select>

<!-- choose/when/otherwise -->
<select id="selectByCondition" resultType="User">
    SELECT * FROM user
    <where>
        <choose>
            <when test="id != null">
                AND id = #{id}
            </when>
            <when test="name != null">
                AND name = #{name}
            </when>
            <otherwise>
                AND status = 1
            </otherwise>
        </choose>
    </where>
</select>
```

---

## B. 避坑指南

### 常见误区

| 误区 | 正确理解 |
|------|----------|
| ${} 和 #{} 一样 | ${} 有 SQL 注入风险 |
| 一级缓存可以关闭 | 一级缓存无法关闭 |
| 二级缓存默认开启 | 二级缓存默认关闭 |

### 性能优化

```
✅ 避免 SELECT *
✅ 合理使用索引
✅ 避免 N+1 查询
✅ 使用批量操作
✅ 合理使用缓存
```

---

## C. 参考资料

- [MyBatis 官方文档](https://mybatis.org/mybatis-3/)
- [MyBatis GitHub](https://github.com/mybatis/mybatis-3)
- [MyBatis-Plus](https://baomidou.com/)


### 进阶题

#### 6. MyBatis 执行流程详解

**核心答案：**

MyBatis 执行流程包含多个核心组件。

**执行流程图：**

```
┌─────────────────────────────────────────────────────────────┐
│                    MyBatis 执行流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 加载配置                                                │
│     └─▶ SqlSessionFactoryBuilder                           │
│     └─▶ 解析 mybatis-config.xml                            │
│     └─▶ 解析 Mapper XML                                     │
│     └─▶ 创建 Configuration 对象                             │
│                                                              │
│  2. 创建 SqlSessionFactory                                  │
│     └─▶ 单例模式                                            │
│     └─▶ 线程安全                                            │
│                                                              │
│  3. 创建 SqlSession                                         │
│     └─▶ openSession()                                       │
│     └─▶ 非线程安全                                          │
│                                                              │
│  4. 获取 Mapper 代理                                        │
│     └─▶ MapperProxyFactory                                  │
│     └─▶ JDK 动态代理                                        │
│                                                              │
│  5. 执行 SQL                                                │
│     └─▶ Executor（执行器）                                  │
│     └─▶ StatementHandler（语句处理器）           
ybatis-config.xml";
InputStream inputStream = Resources.getResourceAsStream(resource);
SqlSessionFactory sqlSessionFactory = 
    new SqlSessionFactoryBuilder().build(inputStream);

// 2. SqlSession 使用
try (SqlSession session = sqlSessionFactory.openSession()) {
    UserMapper mapper = session.getMapper(UserMapper.class);
    User user = mapper.selectById(1L);
    session.commit();
}

// 3. Executor 类型
// SimpleExecutor：每次执行都创建新的 Statement
// ReuseExecutor：重用 Statement
// BatchExecutor：批量执行
// CachingExecutor：二级缓存装饰器
```

---

#### 7. MyBatis 插件开发

**核心答案：**

MyBatis 插件可以拦截核心组件的方法调用。

**可拦截的接口和方法：**

```java
// Executor
Object query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler)
Object update(MappedStatement ms, Object parameter)
void commit(boolean required)
void rollback(boolean required)

// StatementHandler
Statement prepare(Connection connection, Integer transactionTimeout)
void parameterize(Statement statement)
void batch(Statement statement)
int update(Statement statement)
<E> List<E> query(Statement statement, ResultHandler resultHandler)

// ParameterHandler
void setParameters(PreparedStatement ps)

// ResultSetHandler
<E> List<E> handleResultSets(Statement stmt)
<E> Cursor<E> handleCursorResultSets(Statement stmt)
void handleOutputParameters(CallableStatement cs)
```

**分页插件示例：**

```java
@Intercepts({
    @Signature(
        type = Executor.class,
        method = "query",
        args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}
    )
})
public class PageInterceptor implements Interceptor {
    
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object[] args = invocation.getArgs();
        MappedStatement ms = (MappedStatement) args[0];
        Object parameter = args[1];
        RowBounds rowBounds = (RowBounds) args[2];
        
        // 不需要分页
        if (rowBounds == RowBounds.DEFAULT) {
            return invocation.proceed();
        }
        
        // 获取原始 SQL
        BoundSql boundSql = ms.getBoundSql(parameter);
        String sql = boundSql.getSql();
        
        // 生成 count SQL
        String countSql = "SELECT COUNT(*) FROM (" + sql + ") tmp";
        
        // 执行 count 查询
        Connection connection = (Connection) invocation.getArgs()[0];
        PreparedStatement countStmt = connection.prepareStatement(countSql);
        // 设置参数...
        ResultSet rs = countStmt.executeQuery();
        int total = 0;
        if (rs.next()) {
            total = rs.getInt(1);
        }
        
        // 生成分页 SQL
        String pageSql = sql + " LIMIT " + rowBounds.getOffset() 
                + ", " + rowBounds.getLimit();
        
        // 重写 SQL
        BoundSql newBoundSql = new BoundSql(
            ms.getConfiguration(),
            pageSql,
            boundSql.getParameterMappings(),
            parameter
        );
        
        // 执行分页查询
        args[2] = RowBounds.DEFAULT;
        Object result = invocation.proceed();
        
        // 封装分页结果
        if (result instanceof List) {
            return new PageResult<>((List<?>) result, total, 
                rowBounds.getOffset() / rowBounds.getLimit() + 1, 
                rowBounds.getLimit());
        }
        
        return result;
    }
    
    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }
    
    @Override
    public void setProperties(Properties properties) {
        // 设置插件属性
    }
}
```

**性能监控插件：**

```java
@Intercepts({
    @Signature(
        type = StatementHandler.class,
        method = "query",
        args = {Statement.class, ResultHandler.class}
    ),
    @Signature(
        type = StatementHandler.class,
        method = "update",
        args = {Statement.class}
    )
})
public class PerformanceInterceptor implements Interceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(PerformanceInterceptor.class);
    
    private long slowSqlThreshold = 1000; // 慢查询阈值（毫秒）
    
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        long start = System.currentTimeMillis();
        
        try {
            return invocation.proceed();
        } finally {
            long end = System.currentTimeMillis();
            long time = end - start;
            
            if (time > slowSqlThreshold) {
                StatementHandler handler = (StatementHandler) invocation.getTarget();
                BoundSql boundSql = handler.getBoundSql();
                String sql = boundSql.getSql();
                Object params = boundSql.getParameterObject();
                
                logger.warn("慢查询检测: \nSQL: {}\n参数: {}\n耗时: {}ms", 
                    sql, params, time);
            }
        }
    }
    
    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }
    
    @Override
    public void setProperties(Properties properties) {
        String threshold = properties.getProperty("slowSqlThreshold");
        if (threshold != null) {
            this.slowSqlThreshold = Long.parseLong(threshold);
        }
    }
}
```

---

#### 8. MyBatis 与 Spring Boot 集成

**核心答案：**

Spring Boot 提供 MyBatis 的自动配置。

**依赖配置：**

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.3</version>
</dependency>
```

**配置文件：**

```yaml
mybatis:
  # Mapper XML 文件位置
  mapper-locations: classpath:mapper/**/*.xml
  # 类型别名包
  type-aliases-package: com.example.entity
  # MyBatis 配置文件
  config-location: classpath:mybatis-config.xml
  # 配置项
  configuration:
    # 驼峰命名转换
    map-underscore-to-camel-case: true
    # 延迟加载
    lazy-loading-enabled: true
    # 积极加载
    aggressive-lazy-loading: false
    # 缓存
    cache-enabled: true
    # 日志实现
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
```

**Mapper 扫描：**

```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**事务管理：**

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private OrderMapper orderMapper;
    
    public void createUserWithOrder(User user, Order order) {
        // 插入用户
        userMapper.insert(user);
        
        // 插入订单
        order.setUserId(user.getId());
        orderMapper.insert(order);
        
        // 如果抛出异常，两个操作都会回滚
    }
}
```

---

### 高级题

#### 9. MyBatis 高级映射

**核心答案：**

MyBatis 支持复杂的对象映射。

**一对一映射（association）：**

```xml
<!-- 用户和地址一对一 -->
<resultMap id="UserWithAddressMap" type="User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    <result property="email" column="user_email"/>
    
    <!-- 一对一关联 -->
    <association property="address" javaType="Address">
        <id property="id" column="address_id"/>
        <result property="street" column="street"/>
        <result property="city" column="city"/>
        <result property="zipCode" column="zip_code"/>
    </association>
</resultMap>

<select id="selectUserWithAddress" resultMap="UserWithAddressMap">
    SELECT
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        a.id AS address_id,
        a.street,
        a.city,
        a.zip_code
    FROM user u
    LEFT JOIN address a ON u.address_id = a.id
    WHERE u.id = #{id}
</select>

<!-- 延迟加载 -->
<resultMap id="UserWithAddressLazyMap" type="User">
    <id property="id" column="id"/>
    <result property="name" column="name"/>
    
    <association property="address" 
                 column="address_id" 
                 select="selectAddressById"
                 fetchType="lazy"/>
</resultMap>

<select id="selectAddressById" resultType="Address">
    SELECT * FROM address WHERE id = #{id}
</select>
```

**一对多映射（collection）：**

```xml
<!-- 用户和订单一对多 -->
<resultMap id="UserWithOrdersMap" type="User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    
    <!-- 一对多关联 -->
    <collection property="orders" ofType="Order">
        <id property="id" column="order_id"/>
        <result property="orderNo" column="order_no"/>
        <result property="amount" column="amount"/>
        <result property="status" column="status"/>
    </collection>
</resultMap>

<select id="selectUserWithOrders" resultMap="UserWithOrdersMap">
    SELECT
        u.id AS user_id,
        u.name AS user_name,
        o.id AS order_id,
        o.order_no,
        o.amount,
        o.status
    FROM user u
    LEFT JOIN `order` o ON u.id = o.user_id
    WHERE u.id = #{id}
</select>
```

**多对多映射：**

```xml
<!-- 用户和角色多对多 -->
<resultMap id="UserWithRolesMap" type="User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    
    <collection property="roles" ofType="Role">
        <id property="id" column="role_id"/>
        <result property="name" column="role_name"/>
        <result property="code" column="role_code"/>
    </collection>
</resultMap>

<select id="selectUserWithRoles" resultMap="UserWithRolesMap">
    SELECT
        u.id AS user_id,
        u.name AS user_name,
        r.id AS role_id,
        r.name AS role_name,
        r.code AS role_code
    FROM user u
    LEFT JOIN user_role ur ON u.id = ur.user_id
    LEFT JOIN role r ON ur.role_id = r.id
    WHERE u.id = #{id}
</select>
```

**鉴别器（discriminator）：**

```xml
<!-- 根据类型返回不同的子类 -->
<resultMap id="VehicleMap" type="Vehicle">
    <id property="id" column="id"/>
    <result property="type" column="type"/>
    
    <discriminator javaType="string" column="type">
        <case value="CAR" resultMap="CarMap"/>
        <case value="TRUCK" resultMap="TruckMap"/>
    </discriminator>
</resultMap>

<resultMap id="CarMap" type="Car" extends="VehicleMap">
    <result property="doorCount" column="door_count"/>
</resultMap>

<resultMap id="TruckMap" type="Truck" extends="VehicleMap">
    <result property="loadCapacity" column="load_capacity"/>
</resultMap>
```

---

#### 10. MyBatis 性能优化

**核心答案：**

性能优化需要从多个方面入手。

**批量操作：**

```java
// 批量插入
@Mapper
public interface UserMapper {
    
    @Insert({
        "<script>",
        "INSERT INTO user (name, email, age) VALUES",
        "<foreach collection='users' item='user' separator=','>",
        "(#{user.name}, #{user.email}, #{user.age})",
        "</foreach>",
        "</script>"
    })
    int batchInsert(@Param("users") List<User> users);
}

// 使用 ExecutorType.BATCH
@Service
public class UserService {
    
    @Autowired
    private SqlSessionFactory sqlSessionFactory;
    
    public void batchInsert(List<User> users) {
        try (SqlSession session = sqlSessionFactory.openSession(ExecutorType.BATCH)) {
            UserMapper mapper = session.getMapper(UserMapper.class);
            
            for (User user : users) {
                mapper.insert(user);
            }
            
            session.commit();
        }
    }
}
```

**分页优化：**

```java
// 使用 PageHelper
@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    public PageInfo<User> getUsers(int pageNum, int pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<User> users = userMapper.selectAll();
        return new PageInfo<>(users);
    }
}

// 游标分页（大数据量）
@Mapper
public interface UserMapper {
    
    @Select("SELECT * FROM user WHERE id > #{lastId} LIMIT #{size}")
    List<User> selectByIdCursor(@Param("lastId") Long lastId, @Param("size") int size);
}
```

**避免 N+1 查询：**

```xml
<!-- ❌ N+1 查询 -->
<select id="selectAllUsers" resultMap="UserMap">
    SELECT * FROM user
</select>

<resultMap id="UserMap" type="User">
    <id property="id" column="id"/>
    <association property="address" 
                 column="address_id" 
                 select="selectAddressById"/>
</resultMap>

<select id="selectAddressById" resultType="Address">
    SELECT * FROM address WHERE id = #{id}
</select>

<!-- ✅ JOIN 查询 -->
<select id="selectAllUsersWithAddress" resultMap="UserWithAddressMap">
    SELECT
        u.*,
        a.id AS address_id,
        a.street,
        a.city
    FROM user u
    LEFT JOIN address a ON u.address_id = a.id
</select>
```

**SQL 优化：**

```xml
<!-- ✅ 只查询需要的字段 -->
<select id="selectUserNames" resultType="string">
    SELECT name FROM user
</select>

<!-- ✅ 使用索引 -->
<select id="selectByEmail" resultType="User">
    SELECT * FROM user WHERE email = #{email}
    <!-- 确保 email 字段有索引 -->
</select>

<!-- ✅ 避免使用 SELECT * -->
<select id="selectById" resultType="User">
    SELECT id, name, email, age FROM user WHERE id = #{id}
</select>
```

---

#### 11. MyBatis Plus 增强

**核心答案：**

MyBatis-Plus 是 MyBatis 的增强工具。

**核心特性：**

```java
// 1. BaseMapper 接口
public interface UserMapper extends BaseMapper<User> {
    // 无需编写 XML，自动提供 CRUD 方法
}

// 2. 使用示例
@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    public void crudOperations() {
        // 插入
        User user = new User("John", "john@example.com", 25);
        userMapper.insert(user);
        
        // 查询
        User found = userMapper.selectById(1L);
        List<User> users = userMapper.selectList(null);
        
        // 条件查询
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("name", "John")
               .gt("age", 20)
               .orderByDesc("created_at");
        List<User> filtered = userMapper.selectList(wrapper);
        
        // 更新
        user.setName("John Doe");
        userMapper.updateById(user);
        
        // 删除
        userMapper.deleteById(1L);
    }
}

// 3. Lambda 查询
@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    public List<User> searchUsers(String name, Integer minAge) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.isNotBlank(name), User::getName, name)
               .ge(minAge != null, User::getAge, minAge)
               .orderByDesc(User::getCreatedAt);
        
        return userMapper.selectList(wrapper);
    }
}

// 4. 分页查询
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}

@Service
public class UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    public IPage<User> getUsers(int page, int size) {
        Page<User> pageParam = new Page<>(page, size);
        return userMapper.selectPage(pageParam, null);
    }
}

// 5. 逻辑删除
@TableLogic
private Integer deleted; // 0-未删除，1-已删除

// 6. 自动填充
@TableField(fill = FieldFill.INSERT)
private LocalDateTime createdAt;

@TableField(fill = FieldFill.INSERT_UPDATE)
private LocalDateTime updatedAt;

@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createdAt", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updatedAt", LocalDateTime.class, LocalDateTime.now());
    }
    
    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updatedAt", LocalDateTime.class, LocalDateTime.now());
    }
}
```

---

## C. 实战案例

### 案例 1：动态多表查询

```xml
<select id="searchOrders" resultType="OrderVO">
    SELECT
        o.id,
        o.order_no,
        o.amount,
        u.name AS user_name,
        p.name AS product_name
    FROM `order` o
    LEFT JOIN user u ON o.user_id = u.id
    LEFT JOIN product p ON o.product_id = p.id
    <where>
        <if test="orderNo != null and orderNo != ''">
            AND o.order_no LIKE CONCAT('%', #{orderNo}, '%')
        </if>
        <if test="userId != null">
            AND o.user_id = #{userId}
        </if>
        <if test="status != null">
            AND o.status = #{status}
        </if>
        <if test="startDate != null">
            AND o.created_at >= #{startDate}
        </if>
        <if test="endDate != null">
            AND o.created_at &lt;= #{endDate}
        </if>
    </where>
    ORDER BY o.created_at DESC
</select>
```

### 案例 2：批量更新

```xml
<update id="batchUpdateStatus">
    <foreach collection="orders" item="order" separator=";">
        UPDATE `order`
        SET status = #{order.status},
            updated_at = NOW()
        WHERE id = #{order.id}
    </foreach>
</update>
```

### 案例 3：复杂统计查询

```xml
<select id="getOrderStatistics" resultType="OrderStatistics">
    SELECT
        DATE(created_at) AS date,
        COUNT(*) AS total_count,
        SUM(amount) AS total_amount,
        AVG(amount) AS avg_amount,
        MAX(amount) AS max_amount,
        MIN(amount) AS min_amount
    FROM `order`
    WHERE created_at BETWEEN #{startDate} AND #{endDate}
    GROUP BY DATE(created_at)
    ORDER BY date DESC
</select>
```

---

## D. 学习路线

### 初级（1-2周）

```
✅ MyBatis 基础
  - 环境搭建
  - CRUD 操作
  - 参数传递
  - 结果映射

✅ 动态 SQL
  - if/where/set
  - choose/when/otherwise
  - foreach
  - trim/bind
```

### 中级（2-3周）

```
✅ 高级映射
  - resultMap
  - association
  - collection
  - discriminator

✅ 缓存机制
  - 一级缓存
  - 二级缓存
  - 缓存配置

✅ 插件开发
  - 拦截器原理
  - 分页插件
  - 性能监控
```

### 高级（3-4周）

```
✅ 性能优化
  - 批量操作
  - 分页优化
  - 避免 N+1
  - SQL 优化

✅ Spring Boot 集成
  - 自动配置
  - 事务管理
  - 多数据源

✅ MyBatis-Plus
  - BaseMapper
  - 条件构造器
  - 代码生成器
```
