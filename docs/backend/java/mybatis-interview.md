# MyBatis 面试题集

> MyBatis/MyBatis-Plus 核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. MyBatis 核心组件

```
┌─────────────────────────────────────────────────────┐
│                 MyBatis 架构                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐                                   │
│  │ SqlSession   │ ← 核心接口，执行 SQL              │
│  └──────┬───────┘                                   │
│         │                                           │
│         ▼                                           │
│  ┌──────────────┐                                   │
│  │   Executor   │ ← 执行器（Simple/Reuse/Batch）   │
│  └──────┬───────┘                                   │
│         │                                           │
│         ▼                                           │
│  ┌──────────────┐                                   │
│  │StatementHandler│ ← 语句处理器                   │
│  └──────┬───────┘                                   │
│         │                                           │
│         ▼                                           │
│  ┌──────────────┐    ┌──────────────┐              │
│  │ParameterHandler│  │ ResultSetHandler│            │
│  │  (参数处理)   │    │  (结果处理)   │              │
│  └──────────────┘    └──────────────┘              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

| 组件 | 说明 |
|------|------|
| SqlSessionFactory | 创建 SqlSession 的工厂 |
| SqlSession | 执行 SQL、管理事务 |
| Executor | 执行器，负责 SQL 执行 |
| MappedStatement | 封装 SQL 语句信息 |
| TypeHandler | 类型转换器 |

---

#### 2. #{}  vs ${}

```xml
<!-- #{} 预编译，防止 SQL 注入（推荐） -->
<select id="findById" resultType="User">
    SELECT * FROM user WHERE id = #{id}
</select>
<!-- 生成：SELECT * FROM user WHERE id = ? -->

<!-- ${} 字符串替换，有 SQL 注入风险 -->
<select id="findByColumn" resultType="User">
    SELECT * FROM user ORDER BY ${column}
</select>
<!-- 生成：SELECT * FROM user ORDER BY name -->

<!-- ${} 适用场景：动态表名、列名 -->
<select id="findFromTable" resultType="User">
    SELECT * FROM ${tableName} WHERE id = #{id}
</select>
```

| 特性 | #{} | ${} |
|------|-----|-----|
| 预编译 | 是 | 否 |
| SQL 注入 | 安全 | 有风险 |
| 引号处理 | 自动添加 | 不添加 |
| 适用场景 | 参数值 | 表名/列名 |

---

#### 3. 结果映射

```xml
<!-- 简单映射 -->
<select id="findById" resultType="com.example.User">
    SELECT id, name, email FROM user WHERE id = #{id}
</select>

<!-- 复杂映射 resultMap -->
<resultMap id="userResultMap" type="User">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    <result property="email" column="user_email"/>

    <!-- 一对一关联 -->
    <association property="profile" javaType="Profile">
        <id property="id" column="profile_id"/>
        <result property="avatar" column="avatar"/>
    </association>

    <!-- 一对多关联 -->
    <collection property="orders" ofType="Order">
        <id property="id" column="order_id"/>
        <result property="amount" column="order_amount"/>
    </collection>
</resultMap>

<select id="findUserWithOrders" resultMap="userResultMap">
    SELECT
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        p.id as profile_id,
        p.avatar,
        o.id as order_id,
        o.amount as order_amount
    FROM user u
    LEFT JOIN profile p ON u.id = p.user_id
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.id = #{id}
</select>
```

---

#### 4. 动态 SQL

```xml
<!-- if -->
<select id="findUsers" resultType="User">
    SELECT * FROM user
    <where>
        <if test="name != null and name != ''">
            AND name LIKE CONCAT('%', #{name}, '%')
        </if>
        <if test="email != null">
            AND email = #{email}
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
    </where>
</select>

<!-- choose/when/otherwise -->
<select id="findByCondition" resultType="User">
    SELECT * FROM user
    <where>
        <choose>
            <when test="id != null">
                id = #{id}
            </when>
            <when test="name != null">
                name = #{name}
            </when>
            <otherwise>
                status = 1
            </otherwise>
        </choose>
    </where>
</select>

<!-- foreach -->
<select id="findByIds" resultType="User">
    SELECT * FROM user WHERE id IN
    <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</select>

<!-- 批量插入 -->
<insert id="batchInsert">
    INSERT INTO user (name, email) VALUES
    <foreach collection="users" item="user" separator=",">
        (#{user.name}, #{user.email})
    </foreach>
</insert>

<!-- set（自动去除多余逗号） -->
<update id="updateUser">
    UPDATE user
    <set>
        <if test="name != null">name = #{name},</if>
        <if test="email != null">email = #{email},</if>
        <if test="status != null">status = #{status},</if>
    </set>
    WHERE id = #{id}
</update>

<!-- trim（自定义前后缀） -->
<select id="findUsers" resultType="User">
    SELECT * FROM user
    <trim prefix="WHERE" prefixOverrides="AND |OR ">
        <if test="name != null">AND name = #{name}</if>
        <if test="email != null">AND email = #{email}</if>
    </trim>
</select>
```

---

#### 5. 缓存机制

```xml
<!-- 一级缓存：SqlSession 级别，默认开启 -->
<!-- 同一个 SqlSession 中，相同查询直接返回缓存 -->

<!-- 二级缓存：Mapper 级别，需要配置 -->
<mapper namespace="com.example.mapper.UserMapper">
    <!-- 开启二级缓存 -->
    <cache
        eviction="LRU"
        flushInterval="60000"
        size="1024"
        readOnly="true"/>

    <select id="findById" resultType="User" useCache="true">
        SELECT * FROM user WHERE id = #{id}
    </select>

    <!-- 刷新缓存 -->
    <update id="updateUser" flushCache="true">
        UPDATE user SET name = #{name} WHERE id = #{id}
    </update>
</mapper>
```

| 缓存类型 | 作用域 | 默认状态 | 生命周期 |
|---------|--------|---------|---------|
| 一级缓存 | SqlSession | 开启 | SqlSession 关闭时清除 |
| 二级缓存 | Mapper | 关闭 | SqlSessionFactory 生命周期 |

**缓存失效场景：**
- 执行 INSERT/UPDATE/DELETE
- 手动清除 `sqlSession.clearCache()`
- 不同 SqlSession（一级缓存）

---

### 进阶题

#### 6. MyBatis-Plus 常用功能

```java
// 实体类
@Data
@TableName("user")
public class User {
    @TableId(type = IdType.ASSIGN_ID)  // 雪花算法
    private Long id;

    @TableField("user_name")
    private String name;

    private String email;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic  // 逻辑删除
    private Integer deleted;

    @Version  // 乐观锁
    private Integer version;
}

// Mapper 接口
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 自定义方法
    List<User> findByCustomCondition(@Param("condition") UserCondition condition);
}

// Service 层
@Service
public class UserService extends ServiceImpl<UserMapper, User> {

    public Page<User> pageQuery(UserQuery query) {
        return lambdaQuery()
            .like(StringUtils.isNotBlank(query.getName()), User::getName, query.getName())
            .eq(query.getStatus() != null, User::getStatus, query.getStatus())
            .ge(query.getStartTime() != null, User::getCreateTime, query.getStartTime())
            .le(query.getEndTime() != null, User::getCreateTime, query.getEndTime())
            .orderByDesc(User::getCreateTime)
            .page(new Page<>(query.getPage(), query.getSize()));
    }

    public boolean updateWithOptimisticLock(User user) {
        return lambdaUpdate()
            .eq(User::getId, user.getId())
            .eq(User::getVersion, user.getVersion())
            .set(User::getName, user.getName())
            .set(User::getVersion, user.getVersion() + 1)
            .update();
    }
}
```

---

#### 7. 插件机制

```java
// 自定义插件（拦截器）
@Intercepts({
    @Signature(
        type = Executor.class,
        method = "query",
        args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}
    )
})
public class SqlLogPlugin implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        long start = System.currentTimeMillis();

        MappedStatement ms = (MappedStatement) invocation.getArgs()[0];
        Object parameter = invocation.getArgs()[1];

        // 获取 SQL
        BoundSql boundSql = ms.getBoundSql(parameter);
        String sql = boundSql.getSql();

        try {
            return invocation.proceed();
        } finally {
            long time = System.currentTimeMillis() - start;
            log.info("SQL: {}, Time: {}ms", sql, time);
        }
    }
}

// MyBatis-Plus 分页插件配置
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        // 乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        // 防全表更新插件
        interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());
        return interceptor;
    }
}
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "#{} 和 ${} 效果一样" | #{} 预编译安全，${} 有注入风险 |
| "一级缓存跨 SqlSession 有效" | 一级缓存仅在同一 SqlSession 内有效 |
| "二级缓存默认开启" | 二级缓存需要手动配置开启 |
| "resultType 和 resultMap 一样" | resultType 简单映射，resultMap 复杂映射 |
| "foreach 的 collection 只能是 list" | 可以是 list、array、map 等 |

---

## B. 实战文档

### 常用代码模板

```java
// 通用查询条件构建
public LambdaQueryWrapper<User> buildQueryWrapper(UserQuery query) {
    return new LambdaQueryWrapper<User>()
        .like(StringUtils.isNotBlank(query.getName()), User::getName, query.getName())
        .eq(query.getStatus() != null, User::getStatus, query.getStatus())
        .between(query.getStartTime() != null && query.getEndTime() != null,
            User::getCreateTime, query.getStartTime(), query.getEndTime())
        .orderByDesc(User::getCreateTime);
}

// 批量操作
@Transactional
public void batchSave(List<User> users) {
    // MyBatis-Plus 批量插入
    saveBatch(users, 1000);  // 每批 1000 条
}

// 存在则更新，不存在则插入
public void saveOrUpdateByCondition(User user) {
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>()
        .eq(User::getEmail, user.getEmail());

    User existing = getOne(wrapper);
    if (existing != null) {
        user.setId(existing.getId());
        updateById(user);
    } else {
        save(user);
    }
}
```

### XML 映射文件模板

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">

    <!-- 通用查询列 -->
    <sql id="Base_Column_List">
        id, name, email, status, create_time, update_time
    </sql>

    <!-- 通用查询条件 -->
    <sql id="Base_Where_Clause">
        <where>
            <if test="name != null and name != ''">
                AND name LIKE CONCAT('%', #{name}, '%')
            </if>
            <if test="status != null">
                AND status = #{status}
            </if>
            <if test="startTime != null">
                AND create_time >= #{startTime}
            </if>
            <if test="endTime != null">
                AND create_time &lt;= #{endTime}
            </if>
        </where>
    </sql>

    <!-- 列表查询 -->
    <select id="selectList" resultType="User">
        SELECT <include refid="Base_Column_List"/>
        FROM user
        <include refid="Base_Where_Clause"/>
        ORDER BY create_time DESC
    </select>

</mapper>
```
