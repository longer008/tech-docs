# FastAPI 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:FastAPI 的核心优势？
- 标准答案:基于 Starlette(异步高性能) 与 Pydantic(数据校验)；自动生成 OpenAPI/Docs；类型提示驱动路由与验证；性能接近 Node/Go。
- 追问点:与 Flask/Django REST 的差异；同步与异步混用；生成客户端 SDK。
- 参考:https://fastapi.tiangolo.com/

### Q2:路径、查询、Body 参数如何声明？
- 标准答案:使用类型注解+Depends；Path/Query/Body/Header/Cookie/Form/File 等工具；Pydantic 模型做校验和默认值；支持嵌套、枚举。
- 追问点:别名、示例、描述；字段验证器；datetime 序列化。
- 参考:https://fastapi.tiangolo.com/tutorial/body/

### Q3:依赖注入(Depends)的用途？
- 标准答案:函数式依赖，可作用于路径、子依赖、全局；支持 yield 释放资源；用于鉴权、数据库会话、限流等；自动缓存同请求调用。
- 追问点:依赖的作用域；异步依赖；与中间件的区别。
- 参考:https://fastapi.tiangolo.com/tutorial/dependencies/

### Q4:Pydantic 校验与模型？
- 标准答案:定义 BaseModel，字段类型、默认、校验器；支持 Response Model 过滤输出；`Config` 控制 ORM 模式/alias；Pydantic v2 使用 `model_config`、`field_validator`。
- 追问点:Pydantic v1/v2 差异；性能优化；自定义类型。
- 参考:https://fastapi.tiangolo.com/tutorial/response-model/

### Q5:中间件与事件？
- 标准答案:中间件签名 `(request, call_next)`，可做日志/鉴权/计时；事件 `startup/shutdown` 处理资源初始化与释放。
- 追问点:中间件顺序；异常处理器区别；背景任务 BackgroundTasks。
- 参考:https://fastapi.tiangolo.com/tutorial/middleware/

### Q6:异步与同步视图混用的注意事项？
- 标准答案:async def 视图在异步服务中无阻塞；同步视图会在线程池运行但仍可能阻塞启动；重 IO/CPU 任务应使用异步库或任务队列。
- 追问点:数据库驱动选择(asyncpg/aiomysql)；阻塞调用封装；uvicorn 配置。
- 参考:https://fastapi.tiangolo.com/async/

### Q7:认证授权方案？
- 标准答案:支持 OAuth2 Password/Client Credentials、JWT Bearer、API Key；可自定义 Depends 实现 RBAC；与第三方 IdP 集成。
- 追问点:刷新 token；多租户；CSRF 与 Cookie 方案。
- 参考:https://fastapi.tiangolo.com/tutorial/security/

### Q8:部署与性能调优？
- 标准答案:生产用 uvicorn+gunicorn/uvicorn workers；设置 workers、keep-alive、超时；开启 HTTP/2 需额外配置；结合 Nginx/K8s 做反向代理与 TLS。
- 追问点:多进程下对象共享；gzip/缓存；观察 metrics。
- 参考:https://fastapi.tiangolo.com/deployment/

## 场景/排查
### Q1:接口吞吐下降，怀疑阻塞？
- 标准答案:使用 uvicorn --reload 性能差，生产需多 worker；检查是否使用同步驱动访问 DB/外部接口；利用 async/await 或后台任务；用 profiling/`asyncio.all_tasks` 排查。
- 追问点:连接池耗尽；线程池大小；日志 I/O 过重。
- 参考:https://fastapi.tiangolo.com/async/#in-a-threadpool

### Q2:返回数据字段泄漏如何避免？
- 标准答案:使用 response_model 指定输出模型，enable `response_model_exclude_none`；敏感字段不写入模型或使用 alias；开启严格模式。
- 追问点:Pydantic v2 的 `model_config['extra']`；自定义 JSON Encoder；测试覆盖。
- 参考:https://fastapi.tiangolo.com/tutorial/response-model/#exclude-unset-none-and-default

## 反问
### Q1:数据库访问层使用什么（SQLAlchemy/ORM）？是否有统一 Session 管理？
- 标准答案:确认依赖注入方式与生命周期，避免连接泄漏。
- 追问点:事务范围；异步驱动；迁移工具(Alembic)。
- 参考:团队内部规范

### Q2:接口文档与测试要求？
- 标准答案:了解 OpenAPI 文档使用、Mock、契约测试/单测覆盖率要求，便于对齐。
- 追问点:CI 自动生成/校验；多版本管理；权限校验测试。
- 参考:团队内部规范
