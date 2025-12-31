# Python 面试题速查

> 更新日期: 2025-12-31

## 基础
### Q1:GIL 是什么，对并发有何影响？
- 标准答案:CPython 的全局解释器锁保证同一进程同一时刻只有一个线程执行字节码，I/O 密集可用多线程但 CPU 密集需多进程/扩展；其他解释器如 Jython/Stackless 无 GIL。
- 追问点:多进程与共享内存；C 扩展释放 GIL；asyncio 替代方案。
- 参考:https://docs.python.org/3/glossary.html#term-global-interpreter-lock

### Q2:可变默认参数坑点？
- 标准答案:默认参数在定义时求值，使用可变对象会被复用导致数据泄漏；解决用 None 占位后在函数内初始化。
- 追问点:闭包捕获默认参数；dataclass default_factory；常见 bug 案例。
- 参考:https://docs.python.org/3/tutorial/controlflow.html#default-argument-values

### Q3:列表、元组、生成器的差异？
- 标准答案:列表可变、支持切片；元组不可变并可作字典键；生成器惰性求值节省内存，可通过 yield/yield from；迭代器协议 `__iter__`/`__next__`。
- 追问点:性能差异；list comprehension vs generator expression；为何元组哈希。
- 参考:https://docs.python.org/3/tutorial/datastructures.html

### Q4:异常处理与上下文管理？
- 标准答案:try/except/finally；自定义异常；with 语句依赖上下文管理器的 `__enter__`/`__exit__`；可用 contextlib 简化；确保资源释放。
- 追问点:异常链；抑制异常；async with。
- 参考:https://docs.python.org/3/reference/compound_stmts.html#the-with-statement

### Q5:虚拟环境与依赖管理？
- 标准答案:venv/virtualenv 创建隔离环境；pip/poetry/pipenv 管理依赖；使用 requirements.txt/poetry.lock 锁版本；避免全局安装。
- 追问点:editable 安装；私有源；多版本 Python 管理(pyenv).
- 参考:https://docs.python.org/3/tutorial/venv.html

### Q6:类型标注与静态检查？
- 标准答案:PEP484 类型提示，mypy/pyright 做静态检查；dataclass/pydantic 提供运行时验证；typing 中常用 Optional/Union/Protocol/TypedDict。
- 追问点:协变/逆变；Literal/Annotated；渐进式类型。
- 参考:https://docs.python.org/3/library/typing.html

### Q7:异步编程模型？
- 标准答案:asyncio 基于事件循环、协程、Task、Future；使用 await 非阻塞 I/O；`async with/async for` 支持上下文与迭代；与多线程/多进程区别。
- 追问点:loop 生命周期；阻塞调用封装 run_in_executor；aiohttp/asyncpg 实践。
- 参考:https://docs.python.org/3/library/asyncio.html

### Q8:内存管理与垃圾回收？
- 标准答案:引用计数为主，循环引用用分代 GC 处理；弱引用 weakref；大对象分配池化；可通过 `gc` 模块调试。
- 追问点:__slots__ 的作用；内存泄漏常见原因；分代阈值调优。
- 参考:https://docs.python.org/3/library/gc.html

## 场景/排查
### Q1:CPU 密集任务如何提升性能？
- 标准答案:使用 multiprocessing/ProcessPoolExecutor 或 C 扩展/NumPy/Cython；避免在多线程中期待性能提升；必要时拆分为任务队列。
- 追问点:序列化开销；共享内存/Manager；GIL 对 I/O 的影响。
- 参考:https://docs.python.org/3/library/multiprocessing.html

### Q2:内存泄漏排查？
- 标准答案:使用 tracemalloc/objgraph 观察对象增长；检查全局缓存、事件监听、循环引用；确认未关闭文件/连接；定期触发 gc 或调整阈值。
- 追问点:协程泄漏；lru_cache 未设 maxsize；C 扩展泄漏。
- 参考:https://docs.python.org/3/library/tracemalloc.html

## 反问
### Q1:代码规范与格式化工具？
- 标准答案:确认是否使用 PEP8/Black/isort/ruff，避免提交风格不一致。
- 追问点:CI 检查内容；提交钩子；类型检查要求。
- 参考:团队内部规范

### Q2:生产环境 Python 版本与发布方式？
- 标准答案:了解版本兼容、容器镜像、发布策略(滚动/蓝绿)，评估依赖与安全更新。
- 追问点:包源镜像；安全补丁节奏；监控与日志方案。
- 参考:团队内部规范
