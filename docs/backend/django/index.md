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

## A. 面试题库（Interview Bank）

> 详细题库与解析请查看：
> - [Django 面试题速查](interview-bank.md) —— 高频问答速查

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
