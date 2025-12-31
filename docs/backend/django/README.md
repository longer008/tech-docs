# Django

## 元信息
- 定位与场景：全栈 Web 框架，提供 ORM、模板、Admin 等完整功能。
- 版本范围：以 LTS 版本为主，关注异步支持演进。
- 相关生态：DRF、Celery、Channels。

## 研究记录（Exa）
- 查询 1："Django interview questions 2024 2025"
- 查询 2："Django best practices documentation"
- 查询 3："Django performance async"
- 来源摘要：以官方文档为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：Django MTV 架构是什么？
  - A：Model-Template-View，对应 MVC。
- Q2：ORM 查询优化手段？
  - A：`select_related`/`prefetch_related`。
- Q3：中间件的作用？
  - A：请求/响应的统一处理。
- Q4：Django 的认证机制？
  - A：内置用户模型与权限系统。
- Q5：Django 的异步支持特点？
  - A：ASGI 支持 async view，ORM 仍以同步为主。

### 进阶/场景题
- Q1：如何处理 N+1 查询问题？
  - A：合理使用预取与聚合。
- Q2：如何部署高并发应用？
  - A：缓存、ASGI、负载均衡。

### 避坑指南
- ORM 未优化导致慢查询。
- 异步视图混用同步中间件。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Django 官方文档：https://docs.djangoproject.com/
- 性能优化：https://docs.djangoproject.com/en/6.0/topics/performance/
- 异步支持：https://docs.djangoproject.com/en/6.0/topics/async/
```

### 常用代码片段
```py
from django.http import JsonResponse

def health(request):
    return JsonResponse({"ok": True})
```

### 版本差异
- 新版本逐步增强异步支持。
- 升级以官方 Release Notes 为准。
