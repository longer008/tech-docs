# MyBatis

## 元信息
- 定位与场景：轻量 ORM/SQL Mapper，强调 SQL 可控。
- 版本范围：以 MyBatis 3 主流版本为准。
- 相关生态：MyBatis-Spring、MyBatis-Plus。

## 研究记录（Exa）
- 查询 1："MyBatis interview questions 2024 2025"
- 查询 2："MyBatis best practices documentation"
- 查询 3："MyBatis configuration"
- 来源摘要：以官方文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：`#{}` 与 `${}` 的区别？
  - A：`#{}` 预编译防注入；`${}` 字符串拼接易注入。
- Q2：一级/二级缓存的作用？
  - A：一级缓存基于 SqlSession，二级缓存跨会话。
- Q3：`resultMap` 的用途？
  - A：复杂字段映射与嵌套关系处理。
- Q4：动态 SQL 的常用标签？
  - A：`if`/`choose`/`foreach`/`trim`。
- Q5：Mapper 接口与 XML 的映射规则？
  - A：namespace 与接口全名一致，id 与方法名一致。

### 进阶/场景题
- Q1：分页查询如何优化？
  - A：合理索引、避免大偏移、必要时游标。
- Q2：如何避免 N+1 查询？
  - A：合理使用关联查询与缓存。

### 避坑指南
- 使用 `${}` 拼接导致 SQL 注入。
- 缓存滥用造成一致性问题。
- 忽略索引导致性能瓶颈。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- MyBatis 官方文档：https://mybatis.org/mybatis-3/
- 配置说明：https://mybatis.org/mybatis-3/configuration.html
```

### 常用代码片段
```java
try (SqlSession session = sqlSessionFactory.openSession()) {
  UserMapper mapper = session.getMapper(UserMapper.class);
  mapper.selectById(1);
}
```

### 版本差异
- 主版本升级关注配置项与行为变化。
- 迁移需参考官方 Release Notes。
