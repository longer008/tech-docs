# MyBatis 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:MyBatis 的核心组件？
- 标准答案:SqlSessionFactory 负责创建 SqlSession；SqlSession 管理执行器与事务；Mapper 接口绑定 SQL；Executor(Simple/Reuse/Batch) 执行；插件可拦截核心四大对象。
- 追问点:Executor 不同场景；插件链顺序；Mapper 动态代理。
- 参考:https://mybatis.org/mybatis-3/zh/index.html

### Q2:`#{} 和 ${}` 区别？
- 标准答案:`#{}` 使用预编译占位符，防 SQL 注入并自动类型转换；`${}` 字符串拼接直接替换，需谨慎，仅用于动态表名/列名等；默认会进行简单转义。
- 追问点:IN 查询如何写；order by 动态列安全方式；SQL 注入风险。
- 参考:https://mybatis.org/mybatis-3/zh/sqlmap-xml.html#parameter

### Q3:一级缓存与二级缓存？
- 标准答案:一级缓存作用域为 SqlSession，默认开启；二级缓存基于 Mapper namespace，可配置缓存实现/序列化，需开启并保证对象可序列化；更新操作会清空缓存。
- 追问点:二级缓存与事务；缓存穿透；分页缓存风险。
- 参考:https://mybatis.org/mybatis-3/zh/sqlmap-xml.html#cache

### Q4:延迟加载的实现？
- 标准答案:开启 `lazyLoadingEnabled` 后，对关联对象使用代理，在访问时触发二次查询；可通过 `aggressiveLazyLoading` 控制；与缓存/事务配合注意 N+1。
- 追问点:ResultMap collection/association；延迟加载的线程安全；对批量查询影响。
- 参考:https://mybatis.org/mybatis-3/zh/sqlmap-xml.html#lazyLoading

### Q5:动态 SQL 的写法？
- 标准答案:使用 `<if>/<choose>/<foreach>/<trim>/<where>/<set>` 等标签拼装；注意避免空 where；`foreach` 处理集合；`bind` 可创建变量。
- 追问点:代码可读性与测试；XML 与注解 SQL 取舍；SQL 注入防护。
- 参考:https://mybatis.org/mybatis-3/zh/dynamic-sql.html

### Q6:事务管理？
- 标准答案:MyBatis 自身只在 SqlSession 层管理事务，通常与 Spring 集成由 DataSourceTransactionManager 控制；需正确设置自动提交、异常回滚；批处理使用 ExecutorType.BATCH。
- 追问点:多数据源事务；事务传播；异常转换。
- 参考:https://mybatis.org/spring/zh/transactions.html

### Q7:结果映射 resultMap？
- 标准答案:resultType 简单映射；复杂映射使用 resultMap，支持别名、嵌套映射、`<association>` 与 `<collection>`；需确保列别名唯一避免冲突。
- 追问点:自动映射级别；嵌套查询 vs 嵌套结果；枚举/类型处理器。
- 参考:https://mybatis.org/mybatis-3/zh/sqlmap-xml.html#result-maps

### Q8:分页实现思路？
- 标准答案:可使用数据库分页语法或插件(PageHelper/MyBatis-Plus)；避免全表 count 性能问题；对大偏移使用 seek/游标分页。
- 追问点:count 优化；limit offset 的缺点；Keyset pagination。
- 参考:https://mybatis.org/mybatis-3/zh/sqlmap-xml.html

## 场景/排查
### Q1:出现 N+1 查询怎么办？
- 标准答案:使用嵌套结果映射(一条查询返回)或合适的 join；必要时关闭延迟加载；在服务层使用批量查询与缓存。
- 追问点:二级缓存是否可用；ResultMap 配置；索引是否覆盖。
- 参考:https://mybatis.org/mybatis-3/zh/sqlmap-xml.html#result-maps

### Q2:批量插入/更新的性能优化？
- 标准答案:使用 ExecutorType.BATCH，开启 `rewriteBatchedStatements`；控制批次大小，避免占用过大内存；考虑数据库的参数限制。
- 追问点:事务边界；失败回滚；获取自增主键。
- 参考:https://mybatis.org/mybatis-3/zh/sqlmap-xml.html#insert

## 反问
### Q1:项目中是否使用 MyBatis-Plus/自研 BaseMapper？
- 标准答案:了解封装层次，决定是否直接写 XML 或使用 Wrapper。
- 追问点:代码生成器；审计字段自动填充；乐观锁插件。
- 参考:团队内部规范

### Q2:数据库访问规范与性能基线？
- 标准答案:确认 SQL 审核、慢 SQL 告警、分页/批量限制，避免性能回归。
- 追问点:多租户/数据隔离；读写分离；连接池配置。
- 参考:团队内部规范
