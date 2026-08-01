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

## A. 面试题库（Interview Bank）

> 详细题库与解析请查看：
> - [FastAPI 面试题速查](interview-bank.md) —— 高频问答速查

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
