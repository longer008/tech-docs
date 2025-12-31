# Python 核心面试题集

> Python 核心知识点与高频面试题

## A. 面试宝典

### 基础题

#### 1. Python 数据类型

```python
# 不可变类型
int_val = 10
float_val = 3.14
str_val = "hello"
tuple_val = (1, 2, 3)
frozenset_val = frozenset([1, 2, 3])

# 可变类型
list_val = [1, 2, 3]
dict_val = {"a": 1, "b": 2}
set_val = {1, 2, 3}

# 类型检查
type(var)
isinstance(var, int)
isinstance(var, (int, float))  # 多类型检查

# 类型转换
int("123")      # 123
float("3.14")   # 3.14
str(123)        # "123"
list("abc")     # ['a', 'b', 'c']
tuple([1, 2])   # (1, 2)
set([1, 2, 2])  # {1, 2}
dict([("a", 1), ("b", 2)])  # {'a': 1, 'b': 2}
```

**可变 vs 不可变：**
| 类型 | 可变性 | 可哈希 | 可作为字典键 |
|------|--------|--------|-------------|
| int/float/str | 不可变 | 是 | 是 |
| tuple | 不可变 | 是（元素都可哈希） | 是 |
| list | 可变 | 否 | 否 |
| dict | 可变 | 否 | 否 |
| set | 可变 | 否 | 否 |

---

#### 2. 列表推导式与生成器

```python
# 列表推导式
squares = [x**2 for x in range(10)]
evens = [x for x in range(10) if x % 2 == 0]
matrix = [[i*j for j in range(5)] for i in range(5)]

# 字典推导式
d = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# 集合推导式
s = {x % 3 for x in range(10)}
# {0, 1, 2}

# 生成器表达式（惰性求值，节省内存）
gen = (x**2 for x in range(10))
next(gen)  # 0
next(gen)  # 1

# 生成器函数
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

for num in fibonacci(10):
    print(num)

# yield from（委托生成器）
def chain(*iterables):
    for it in iterables:
        yield from it

list(chain([1, 2], [3, 4]))  # [1, 2, 3, 4]
```

---

#### 3. 函数与装饰器

```python
# 默认参数陷阱
def func(items=[]):  # 危险！可变默认参数
    items.append(1)
    return items

# 正确写法
def func(items=None):
    if items is None:
        items = []
    items.append(1)
    return items

# *args 和 **kwargs
def func(*args, **kwargs):
    print(args)    # 元组
    print(kwargs)  # 字典

func(1, 2, a=3, b=4)
# (1, 2)
# {'a': 3, 'b': 4}

# 装饰器
def timer(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.time() - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    import time
    time.sleep(1)

# 带参数的装饰器
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hello():
    print("Hello")

# 保留函数元信息
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# 类装饰器
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
```

---

#### 4. 面向对象

```python
# 类定义
class Person:
    species = "Human"  # 类属性

    def __init__(self, name, age):
        self.name = name      # 实例属性
        self._age = age       # 约定私有
        self.__id = id(self)  # 名称修饰

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if value < 0:
            raise ValueError("Age cannot be negative")
        self._age = value

    def greet(self):
        return f"Hello, I'm {self.name}"

    @classmethod
    def from_string(cls, s):
        name, age = s.split(',')
        return cls(name, int(age))

    @staticmethod
    def is_adult(age):
        return age >= 18

    def __str__(self):
        return f"Person({self.name}, {self._age})"

    def __repr__(self):
        return f"Person(name='{self.name}', age={self._age})"

# 继承
class Student(Person):
    def __init__(self, name, age, school):
        super().__init__(name, age)
        self.school = school

    def greet(self):
        return f"{super().greet()}, from {self.school}"

# 多重继承与 MRO
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

D().method()  # D -> B -> C -> A (MRO)
print(D.__mro__)

# 抽象类
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2
```

---

#### 5. 异常处理

```python
# 基本异常处理
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
except (TypeError, ValueError) as e:
    print(f"Type or Value Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
else:
    print("No exception occurred")
finally:
    print("Always executed")

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

# 上下文管理器
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

### 进阶题

#### 6. GIL 与并发

```python
# GIL (Global Interpreter Lock)
# - CPython 中的互斥锁，同一时刻只有一个线程执行 Python 字节码
# - I/O 密集型任务：多线程有效
# - CPU 密集型任务：多进程更有效

# 多线程
import threading
from concurrent.futures import ThreadPoolExecutor

def task(n):
    return n * 2

# 使用线程池
with ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(task, range(10)))

# 多进程
from multiprocessing import Pool, Process
from concurrent.futures import ProcessPoolExecutor

def cpu_bound_task(n):
    return sum(i * i for i in range(n))

# 使用进程池
with ProcessPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(cpu_bound_task, [10**6] * 4))

# 异步编程
import asyncio

async def fetch_data(url):
    await asyncio.sleep(1)  # 模拟 I/O
    return f"Data from {url}"

async def main():
    tasks = [fetch_data(f"url{i}") for i in range(5)]
    results = await asyncio.gather(*tasks)
    return results

asyncio.run(main())

# 异步上下文管理器
class AsyncResource:
    async def __aenter__(self):
        await asyncio.sleep(0.1)
        return self

    async def __aexit__(self, *args):
        await asyncio.sleep(0.1)

async def use_resource():
    async with AsyncResource() as r:
        pass
```

---

#### 7. 内存管理

```python
# 引用计数
import sys

a = [1, 2, 3]
sys.getrefcount(a)  # 获取引用计数

# 垃圾回收
import gc

gc.collect()  # 手动触发 GC
gc.disable()  # 禁用 GC
gc.enable()   # 启用 GC

# 循环引用
class Node:
    def __init__(self):
        self.ref = None

a = Node()
b = Node()
a.ref = b
b.ref = a  # 循环引用

# 弱引用（不增加引用计数）
import weakref

class MyClass:
    pass

obj = MyClass()
ref = weakref.ref(obj)
ref()  # 返回原对象或 None

# __slots__ 节省内存
class Point:
    __slots__ = ['x', 'y']

    def __init__(self, x, y):
        self.x = x
        self.y = y
```

---

### 避坑指南

| 错误回答 | 正确理解 |
|---------|---------|
| "Python 变量存储值" | 变量存储对象引用 |
| "== 和 is 相同" | == 比较值，is 比较身份（id） |
| "列表可以作为字典键" | 列表不可哈希，不能作为键 |
| "Python 多线程能利用多核" | GIL 限制，CPU 密集型用多进程 |
| "默认参数每次调用重新创建" | 默认参数只在定义时求值一次 |

---

## B. 实战文档

### 常用内置函数

```python
# 序列操作
len(obj)
max(iterable)
min(iterable)
sum(iterable)
sorted(iterable, key=None, reverse=False)
reversed(sequence)
enumerate(iterable, start=0)
zip(*iterables)

# 函数式编程
map(func, iterable)
filter(func, iterable)
reduce(func, iterable)  # from functools import reduce

# 类型与反射
type(obj)
isinstance(obj, class_or_tuple)
issubclass(cls, class_or_tuple)
hasattr(obj, name)
getattr(obj, name, default)
setattr(obj, name, value)
delattr(obj, name)
dir(obj)
vars(obj)

# 输入输出
print(*args, sep=' ', end='\n', file=sys.stdout)
input(prompt)
open(file, mode='r', encoding=None)

# 其他
id(obj)
hash(obj)
callable(obj)
eval(expression)
exec(code)
```

### 常用标准库

```python
# os - 操作系统
import os
os.getcwd()
os.listdir(path)
os.makedirs(path, exist_ok=True)
os.remove(path)
os.rename(src, dst)
os.path.exists(path)
os.path.isfile(path)
os.path.isdir(path)
os.path.join(a, b)
os.environ.get('KEY', 'default')

# json
import json
json.dumps(obj)
json.loads(string)
json.dump(obj, file)
json.load(file)

# datetime
from datetime import datetime, timedelta
now = datetime.now()
dt = datetime(2024, 1, 15, 14, 30)
dt.strftime('%Y-%m-%d %H:%M:%S')
datetime.strptime('2024-01-15', '%Y-%m-%d')
dt + timedelta(days=7)

# re - 正则表达式
import re
re.match(pattern, string)
re.search(pattern, string)
re.findall(pattern, string)
re.sub(pattern, repl, string)
re.split(pattern, string)

# collections
from collections import Counter, defaultdict, deque, namedtuple
Counter(['a', 'b', 'a'])  # Counter({'a': 2, 'b': 1})
defaultdict(list)
deque([1, 2, 3])
Point = namedtuple('Point', ['x', 'y'])

# itertools
from itertools import chain, combinations, permutations, groupby
list(chain([1, 2], [3, 4]))  # [1, 2, 3, 4]
list(combinations('ABC', 2))  # [('A','B'), ('A','C'), ('B','C')]
```
