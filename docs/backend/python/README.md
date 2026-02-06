# Python 开发指南

> 更新时间：2025-02

## 目录导航

- [核心概念](#核心概念)
- [数据类型](#数据类型)
- [函数与装饰器](#函数与装饰器)
- [面向对象](#面向对象)
- [异常处理](#异常处理)
- [生成器与迭代器](#生成器与迭代器)
- [并发编程](#并发编程)
- [内存管理](#内存管理)
- [最佳实践](#最佳实践)

---

## 核心概念

### 什么是 Python？

Python 是一种高级、解释型、动态类型的编程语言，以其简洁的语法和强大的功能而闻名。

**核心特点**：
- **简洁易读**：接近自然语言的语法
- **动态类型**：运行时确定变量类型
- **解释执行**：无需编译，直接运行
- **丰富的标准库**：内置大量实用模块
- **跨平台**：支持 Windows、Linux、macOS
- **多范式**：支持面向对象、函数式、过程式编程

**适用场景**：
- Web 开发（Django、Flask、FastAPI）
- 数据科学（NumPy、Pandas、Scikit-learn）
- 机器学习（TensorFlow、PyTorch）
- 自动化脚本
- 网络爬虫
- 系统管理

---

## 数据类型

### 基础数据类型

Python 的数据类型分为可变和不可变两类：

**不可变类型**：
- `int`、`float`、`str`、`tuple`、`frozenset`、`bytes`

**可变类型**：
- `list`、`dict`、`set`、`bytearray`

```python
# 整数
x = 10
y = 0b1010  # 二进制
z = 0o12    # 八进制
w = 0xA     # 十六进制

# 浮点数
pi = 3.14159
e = 2.71828

# 字符串
s1 = 'Hello'
s2 = "World"
s3 = '''多行
字符串'''
s4 = f"格式化字符串: {x}"  # f-string

# 布尔值
is_true = True
is_false = False

# None
value = None
```

### 序列类型

**列表（List）**：

```python
# 创建列表
lst = [1, 2, 3, 4, 5]
empty = []
mixed = [1, 'two', 3.0, [4, 5]]

# 列表操作
lst.append(6)              # 添加元素
lst.extend([7, 8])         # 扩展列表
lst.insert(0, 0)           # 插入元素
lst.pop()                  # 弹出最后一个
lst.remove(3)              # 移除指定值
lst.index(2)               # 查找索引
lst.count(2)               # 计数
lst.sort()                 # 排序（原地）
lst.reverse()              # 反转

# 列表切片
lst[1:4]                   # [2, 3, 4]
lst[::2]                   # [1, 3, 5]（步长为2）
lst[::-1]                  # 反转列表

# 列表推导式
squares = [x**2 for x in range(10)]
evens = [x for x in range(10) if x % 2 == 0]
```

**元组（Tuple）**：

```python
# 创建元组
t = (1, 2, 3)
single = (1,)              # 单元素元组需要逗号
empty = ()

# 元组解包
a, b, c = (1, 2, 3)
first, *rest = (1, 2, 3, 4)  # first=1, rest=[2,3,4]

# 命名元组
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(1, 2)
print(p.x, p.y)
```

### 映射类型

**字典（Dict）**：

```python
# 创建字典
d = {'name': 'Alice', 'age': 25}
d = dict(name='Bob', age=30)
d = dict([('name', 'Charlie'), ('age', 35)])

# 字典操作
d['email'] = 'alice@example.com'  # 添加/修改
value = d.get('phone', 'N/A')     # 获取（带默认值）
d.pop('age')                       # 删除并返回值
d.update({'city': 'Beijing'})      # 更新
d.keys()                           # 所有键
d.values()                         # 所有值
d.items()                          # 所有键值对

# 字典推导式
squares = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# defaultdict（自动初始化）
from collections import defaultdict
dd = defaultdict(list)
dd['key'].append(1)  # 自动创建空列表
```

### 集合类型

**集合（Set）**：

```python
# 创建集合
s = {1, 2, 3}
s = set([1, 2, 2, 3])  # {1, 2, 3}（自动去重）

# 集合操作
s.add(4)                    # 添加元素
s.remove(1)                 # 移除（不存在会报错）
s.discard(1)                # 移除（不存在不报错）

# 集合运算
a = {1, 2, 3}
b = {2, 3, 4}
a | b                       # 并集 {1, 2, 3, 4}
a & b                       # 交集 {2, 3}
a - b                       # 差集 {1}
a ^ b                       # 对称差集 {1, 4}

# 集合推导式
evens = {x for x in range(10) if x % 2 == 0}
```

---

## 函数与装饰器

### 函数定义

```python
# 基础函数
def greet(name):
    """问候函数"""
    return f"Hello, {name}!"

# 默认参数
def power(x, n=2):
    return x ** n

# 可变参数
def sum_all(*args):
    return sum(args)

# 关键字参数
def person_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

# 混合参数
def func(a, b=1, *args, **kwargs):
    pass

# 类型提示
def add(a: int, b: int) -> int:
    return a + b

# Lambda 表达式
square = lambda x: x ** 2
add = lambda x, y: x + y
```

### 装饰器

**基础装饰器**：

```python
import time
from functools import wraps

# 简单装饰器
def timer(func):
    @wraps(func)  # 保留原函数元信息
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "Done"

# 等价于
# slow_function = timer(slow_function)
```

**带参数的装饰器**：

```python
def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hello():
    print("Hello!")
```

**类装饰器**：

```python
class Singleton:
    def __init__(self, cls):
        self._cls = cls
        self._instance = None

    def __call__(self, *args, **kwargs):
        if self._instance is None:
            self._instance = self._cls(*args, **kwargs)
        return self._instance

@Singleton
class Database:
    pass

# 两次调用返回同一实例
db1 = Database()
db2 = Database()
assert db1 is db2
```

---

## 面向对象

### 类定义

```python
class Person:
    # 类属性
    species = "Human"

    def __init__(self, name, age):
        # 实例属性
        self.name = name
        self._age = age          # 约定私有（单下划线）
        self.__id = id(self)     # 名称修饰（双下划线）

    # 实例方法
    def greet(self):
        return f"Hello, I'm {self.name}"

    # 类方法
    @classmethod
    def from_string(cls, s):
        name, age = s.split(',')
        return cls(name, int(age))

    # 静态方法
    @staticmethod
    def is_adult(age):
        return age >= 18

    # 属性装饰器
    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if value < 0:
            raise ValueError("Age cannot be negative")
        self._age = value

    # 特殊方法
    def __str__(self):
        return f"Person({self.name}, {self._age})"

    def __repr__(self):
        return f"Person(name='{self.name}', age={self._age})"

    def __eq__(self, other):
        return self.name == other.name and self._age == other._age

# 使用
p = Person("Alice", 25)
print(p.greet())
p.age = 26  # 使用 setter
print(p.age)  # 使用 getter
```

### 继承

```python
# 单继承
class Student(Person):
    def __init__(self, name, age, school):
        super().__init__(name, age)
        self.school = school

    def greet(self):
        return f"{super().greet()}, from {self.school}"

# 多重继承
class A:
    def method(self):
        print("A")

class B(A):
    def method(self):
        print("B")
        super().method()

class C(A):
    def method(self):
        print("C")
        super().method()

class D(B, C):
    def method(self):
        print("D")
        super().method()

# MRO（方法解析顺序）
D().method()  # 输出: D B C A
print(D.__mro__)  # 查看 MRO
```

### 抽象类

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

    @abstractmethod
    def perimeter(self):
        pass

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2

    def perimeter(self):
        return 2 * 3.14159 * self.radius

# 不能实例化抽象类
# shape = Shape()  # TypeError

# 可以实例化具体类
circle = Circle(5)
print(circle.area())
```

---

## 异常处理

### 基础异常处理

```python
# try-except-else-finally
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
except (TypeError, ValueError) as e:
    print(f"Type or Value Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
else:
    # 无异常时执行
    print("No exception occurred")
finally:
    # 总是执行
    print("Cleanup")

# 抛出异常
def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

# 自定义异常
class BusinessError(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message
        super().__init__(self.message)

# 异常链
try:
    # some code
    pass
except ValueError as e:
    raise RuntimeError("Processing failed") from e
```

### 上下文管理器

```python
# 使用 with 语句
with open('file.txt', 'r') as f:
    content = f.read()
# 文件自动关闭

# 自定义上下文管理器
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None

    def __enter__(self):
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
        return False  # 不抑制异常

# 使用 contextlib
from contextlib import contextmanager

@contextmanager
def timer():
    import time
    start = time.time()
    yield
    print(f"Elapsed: {time.time() - start:.4f}s")

with timer():
    # some code
    pass
```

---

## 生成器与迭代器

### 迭代器

```python
# 迭代器协议
class Counter:
    def __init__(self, max_count):
        self.max_count = max_count
        self.count = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.count >= self.max_count:
            raise StopIteration
        self.count += 1
        return self.count

# 使用
counter = Counter(5)
for num in counter:
    print(num)  # 1, 2, 3, 4, 5

# 内置迭代器
it = iter([1, 2, 3])
print(next(it))  # 1
print(next(it))  # 2
```

### 生成器

**生成器函数**：

```python
# 使用 yield
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 使用
for num in fibonacci(10):
    print(num)

# yield from（委托生成器）
def chain(*iterables):
    for it in iterables:
        yield from it

list(chain([1, 2], [3, 4]))  # [1, 2, 3, 4]
```

**生成器表达式**：

```python
# 类似列表推导式，但使用圆括号
gen = (x**2 for x in range(10))
print(next(gen))  # 0
print(next(gen))  # 1

# 惰性求值，节省内存
sum(x**2 for x in range(1000000))  # 不会创建列表
```

---

## 并发编程

### GIL（全局解释器锁）

Python 的 GIL 是 CPython 解释器中的互斥锁，同一时刻只允许一个线程执行 Python 字节码。

**影响**：
- **I/O 密集型任务**：多线程有效（I/O 操作会释放 GIL）
- **CPU 密集型任务**：多进程更有效（绕过 GIL）

### 多线程

```python
import threading
from concurrent.futures import ThreadPoolExecutor

# 基础线程
def task(n):
    print(f"Task {n} running")
    return n * 2

# 使用 Thread
thread = threading.Thread(target=task, args=(1,))
thread.start()
thread.join()

# 使用线程池
with ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(task, range(10)))
    print(results)

# 线程锁
lock = threading.Lock()

def safe_increment():
    with lock:
        # 临界区代码
        pass
```

### 多进程

```python
from multiprocessing import Process, Pool
from concurrent.futures import ProcessPoolExecutor

# CPU 密集型任务
def cpu_bound_task(n):
    return sum(i * i for i in range(n))

# 使用 Process
process = Process(target=cpu_bound_task, args=(10**6,))
process.start()
process.join()

# 使用进程池
with ProcessPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(cpu_bound_task, [10**6] * 4))
    print(results)

# 使用 Pool
with Pool(processes=4) as pool:
    results = pool.map(cpu_bound_task, [10**6] * 4)
```

### 异步编程

```python
import asyncio

# 异步函数
async def fetch_data(url):
    print(f"Fetching {url}")
    await asyncio.sleep(1)  # 模拟 I/O
    return f"Data from {url}"

# 运行异步任务
async def main():
    # 并发执行多个任务
    tasks = [fetch_data(f"url{i}") for i in range(5)]
    results = await asyncio.gather(*tasks)
    return results

# 运行
results = asyncio.run(main())

# 异步上下文管理器
class AsyncResource:
    async def __aenter__(self):
        print("Acquiring resource")
        await asyncio.sleep(0.1)
        return self

    async def __aexit__(self, *args):
        print("Releasing resource")
        await asyncio.sleep(0.1)

async def use_resource():
    async with AsyncResource() as r:
        print("Using resource")

# 异步迭代器
class AsyncCounter:
    def __init__(self, max_count):
        self.max_count = max_count
        self.count = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.count >= self.max_count:
            raise StopAsyncIteration
        self.count += 1
        await asyncio.sleep(0.1)
        return self.count

async def iterate():
    async for num in AsyncCounter(5):
        print(num)
```

---

## 内存管理

### 引用计数

```python
import sys

# 查看引用计数
a = [1, 2, 3]
print(sys.getrefcount(a))  # 2（包括 getrefcount 的临时引用）

b = a  # 引用计数 +1
print(sys.getrefcount(a))  # 3

del b  # 引用计数 -1
print(sys.getrefcount(a))  # 2
```

### 垃圾回收

```python
import gc

# 手动触发垃圾回收
gc.collect()

# 禁用/启用垃圾回收
gc.disable()
gc.enable()

# 查看垃圾回收统计
print(gc.get_stats())

# 循环引用示例
class Node:
    def __init__(self):
        self.ref = None

a = Node()
b = Node()
a.ref = b
b.ref = a  # 循环引用

# 删除引用
del a, b
gc.collect()  # 回收循环引用的对象
```

### 弱引用

```python
import weakref

class MyClass:
    pass

obj = MyClass()
ref = weakref.ref(obj)  # 创建弱引用

print(ref())  # 返回原对象
del obj
print(ref())  # 返回 None（对象已被回收）
```

### 内存优化

```python
# 使用 __slots__ 节省内存
class Point:
    __slots__ = ['x', 'y']  # 限制实例属性

    def __init__(self, x, y):
        self.x = x
        self.y = y

# 不使用 __slots__ 的类每个实例都有 __dict__
# 使用 __slots__ 可以节省内存（特别是大量实例时）

# 生成器代替列表（节省内存）
# 不好：创建完整列表
squares = [x**2 for x in range(1000000)]

# 好：使用生成器
squares = (x**2 for x in range(1000000))
```

---

## 最佳实践

### 代码风格（PEP 8）

```python
# 命名规范
class MyClass:          # 类名：大驼峰
    pass

def my_function():      # 函数名：小写+下划线
    pass

MY_CONSTANT = 100       # 常量：大写+下划线

my_variable = 10        # 变量：小写+下划线

# 缩进：4 个空格
def function():
    if condition:
        do_something()

# 行长度：最多 79 字符
# 导入顺序：标准库 -> 第三方库 -> 本地模块
import os
import sys

import requests
import numpy as np

from myapp import models

# 空行：类定义前后 2 行，函数定义前后 1 行
```

### 类型提示

```python
from typing import List, Dict, Optional, Union, Tuple, Callable

# 基础类型提示
def greet(name: str) -> str:
    return f"Hello, {name}"

# 容器类型
def process_items(items: List[int]) -> Dict[str, int]:
    return {"count": len(items)}

# 可选类型
def find_user(user_id: int) -> Optional[str]:
    return None

# 联合类型
def parse_value(value: Union[int, str]) -> int:
    return int(value)

# 元组
def get_coordinates() -> Tuple[float, float]:
    return (0.0, 0.0)

# 可调用对象
def apply(func: Callable[[int], int], value: int) -> int:
    return func(value)

# 泛型
from typing import TypeVar, Generic

T = TypeVar('T')

class Stack(Generic[T]):
    def __init__(self) -> None:
        self.items: List[T] = []

    def push(self, item: T) -> None:
        self.items.append(item)

    def pop(self) -> T:
        return self.items.pop()
```

### 虚拟环境

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 导出依赖
pip freeze > requirements.txt

# 退出虚拟环境
deactivate
```

### 常见陷阱

**1. 可变默认参数**：

```python
# 错误
def append_to(element, lst=[]):
    lst.append(element)
    return lst

# 正确
def append_to(element, lst=None):
    if lst is None:
        lst = []
    lst.append(element)
    return lst
```

**2. 闭包中的变量**：

```python
# 错误
funcs = []
for i in range(3):
    funcs.append(lambda: i)

[f() for f in funcs]  # [2, 2, 2]

# 正确
funcs = []
for i in range(3):
    funcs.append(lambda x=i: x)

[f() for f in funcs]  # [0, 1, 2]
```

**3. 浅拷贝 vs 深拷贝**：

```python
import copy

# 浅拷贝
lst1 = [[1, 2], [3, 4]]
lst2 = lst1.copy()
lst2[0][0] = 999
print(lst1)  # [[999, 2], [3, 4]]（内部列表被修改）

# 深拷贝
lst1 = [[1, 2], [3, 4]]
lst2 = copy.deepcopy(lst1)
lst2[0][0] = 999
print(lst1)  # [[1, 2], [3, 4]]（不受影响）
```

---

## 参考资源

- [Python 官方文档](https://docs.python.org/3/) - 最权威的 Python 文档
- [PEP 8](https://peps.python.org/pep-0008/) - Python 代码风格指南
- [Python 标准库](https://docs.python.org/3/library/) - 内置模块文档
- [Real Python](https://realpython.com/) - Python 教程和文章

---

> 本文档基于 Python 3.14 官方文档和 MCP Context7 最新资料整理（21524+ 代码示例），涵盖核心概念、数据类型、函数、面向对象、异常处理、生成器、并发编程、内存管理和最佳实践。所有代码示例均可运行，并包含详细的中文注释。

