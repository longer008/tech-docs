# FastAPI

## 元信息
- 定位与场景：高性能 Python Web 框架，基于 ASGI 与类型注解。
- 版本范围：以官方稳定版本为准。
- 相关生态：Pydantic、Uvicorn、OpenAPI。

## 研究记录（Exa）
- 查询 1："FastAPI interview questions 2024 2025"
- 查询 2："FastAPI best practices documentation"
- 查询 3："FastAPI bigger applications"
- 来源摘要：以官方文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：FastAPI 的性能优势来源？
  - A：基于 ASGI + Starlette + Pydantic。
- Q2：依赖注入（Depends）的用途？
  - A：统一鉴权、资源管理与复用。
- Q3：数据校验如何实现？
  - A：Pydantic 模型与类型注解。
- Q4：OpenAPI 文档如何生成？
  - A：自动基于路由与模型生成。
- Q5：异常处理如何配置？
  - A：使用 `HTTPException` 与自定义异常处理器。

### 进阶/场景题
- Q1：如何组织大型项目结构？
  - A：按模块拆分路由与依赖。
- Q2：如何做环境配置与文档暴露控制？
  - A：通过环境变量控制 docs/openapi。

### 避坑指南
- 误用同步 IO 阻塞事件循环。
- 忽视异常处理导致响应不统一。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- FastAPI 官方文档：https://fastapi.tiangolo.com/
- Bigger Applications：https://fastapi.tiangolo.com/tutorial/bigger-applications/
- Error Handling：https://fastapi.tiangolo.com/tutorial/handling-errors/
```

### 常用代码片段
```py
from fastapi import FastAPI

app = FastAPI()

@app.get('/health')
async def health():
    return {"ok": True}
```

### 版本差异
- 依赖 Pydantic 版本变化可能影响模型行为。
- 升级以官方 Release Notes 为准。
