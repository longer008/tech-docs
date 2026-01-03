# NestJS

## 元信息
- 定位与场景：基于 TypeScript 的企业级 Node.js 框架，强调模块化与依赖注入。
- 版本范围：以官方稳定版本为准。
- 相关生态：OpenAPI/Swagger、CQRS、微服务模式。

## 研究记录（Exa）
- 查询 1："NestJS interview questions 2024 2025"
- 查询 2："NestJS best practices documentation"
- 查询 3："NestJS documentation"
- 来源摘要：以官方文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Module/Controller/Provider 的职责？
  - A：Module 组织依赖；Controller 处理请求；Provider 提供服务。
- Q2：依赖注入（DI）的优势？
  - A：降低耦合，提升可测试性。
- Q3：Pipe/Guard/Interceptor 的区别？
  - A：Pipe 做校验与转换；Guard 做鉴权；Interceptor 做拦截与增强。
- Q4：DTO 的作用？
  - A：定义输入结构并配合验证。
- Q5：如何集成 Swagger？
  - A：使用 `@nestjs/swagger` 生成文档。

### 进阶/场景题
- Q1：如何做统一异常处理？
  - A：使用 Exception Filter。
- Q2：如何拆分模块避免循环依赖？
  - A：按领域边界拆分并使用动态模块。

### 避坑指南
- 模块划分不清导致循环依赖。
- DTO 与验证未启用导致输入不安全。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- NestJS 官方文档：https://docs.nestjs.com/
- OpenAPI：https://docs.nestjs.com/openapi/introduction
```

### 常用代码片段
```ts
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  list() {
    return this.service.list()
  }
}
```

### 版本差异
- 关注核心包与装饰器变更。
- 升级以官方文档与 Release Notes 为准。
