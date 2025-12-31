# Python

## 元信息
- 定位与场景：通用型语言，适合脚本、后端与数据处理。
- 版本范围：以官方稳定版本与 LTS 发行策略为准。
- 相关生态：pip、venv、asyncio。

## 研究记录（Exa）
- 查询 1："Python interview questions 2024 2025"
- 查询 2："Python best practices documentation"
- 查询 3："Python annotations best practices"
- 来源摘要：以官方文档与 PEP 规范为主。

## A. 面试宝典（Interview Guide）

> 题库详见：`interview-bank.md`

### 基础题
- Q1：列表/元组/字典的核心差异？
  - A：列表可变、有序；元组不可变；字典键值映射。
- Q2：生成器与迭代器的区别？
  - A：生成器是迭代器的一种，惰性计算。
- Q3：浅拷贝与深拷贝差异？
  - A：浅拷贝共享引用，深拷贝递归复制。
- Q4：GIL 的影响与应对策略？
  - A：限制多线程 CPU 并行，可用多进程或异步。
- Q5：装饰器的用途？
  - A：在不改动函数主体的情况下增强功能。

### 进阶/场景题
- Q1：如何组织异步任务与 IO？
  - A：使用 asyncio 与协程。
- Q2：如何编写可维护的模块化代码？
  - A：遵循 PEP8 与清晰的模块边界。

### 避坑指南
- 滥用可变默认参数。
- 忽略类型标注导致可读性差。

## B. 实战文档（Usage Manual）
### 速查链接
```txt
- Python 官方文档：https://docs.python.org/3/
- 注解指南：https://docs.python.org/3/howto/annotations.html
- PEP 8：https://peps.python.org/pep-0008/
```

### 常用代码片段
```py
from __future__ import annotations

def add(a: int, b: int) -> int:
    return a + b
```

### 版本差异
- 关注语法与标准库的变化。
- 升级以官方 Release Notes 为准。
