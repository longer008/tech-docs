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

**追问点：**

**Q1: 为什么可变对象不能作为字典键？**
A: 字典键必须是可哈希的，而可哈希对象要求其值在生命周期内不能改变。可变对象的值可以改变，会导致哈希值改变，破坏字典的内部结构。

```python
# 错误示例
my_dict = {}
key_list = [1, 2, 3]
# my_dict[key_list] = "value"  # TypeError: unhashable type: 'list'

# 正确做法：使用不可变类型
my_dict = {}
key_tuple = (1, 2, 3)
my_dict[key_tuple] = "value"  # 正确
```

**Q2: tuple 什么时候不可哈希？**
A: 当 tuple 包含可变元素时就不可哈希。tuple 的可哈希性取决于其所有元素都是可哈希的。

```python
# 可哈希的 tuple
hashable_tuple = (1, 2, "hello")
print(hash(hashable_tuple))  # 正常

# 不可哈希的 tuple（包含 list）
unhashable_tuple = (1, 2, [3, 4])
# print(hash(unhashable_tuple))  # TypeError: unhashable type: 'list'

# 实际应用
my_dict = {}
my_dict[(1, 2, "key")] = "value"  # 正确
# my_dict[(1, 2, [3, 4])] = "value"  # 错误
```

**Q3: Python 中的浅拷贝和深拷贝有什么区别？**
A: 浅拷贝创建新对象但引用原对象的元素，深拷贝递归复制所有嵌套对象。对于不可变对象，两者效果相同；对于可变对象，区别明显。

```python
import copy

# 原始数据
original = [[1, 2, 3], [4, 5, 6]]

# 浅拷贝
shallow = copy.copy(original)
shallow[0][0] = 999
print(original)  # [[999, 2, 3], [4, 5, 6]] - 原始数据被修改

# 深拷贝
original = [[1, 2, 3], [4, 5, 6]]
deep = copy.deepcopy(original)
deep[0][0] = 999
print(original)  # [[1, 2, 3], [4, 5, 6]] - 原始数据未被修改

# 对于不可变对象
original_tuple = (1, 2, 3)
shallow_tuple = copy.copy(original_tuple)
deep_tuple = copy.deepcopy(original_tuple)
print(original_tuple is shallow_tuple)  # True（优化：直接返回原对象）
```

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

**追问点：**

**Q1: 列表推导式和生成器表达式的性能差异？**
A: 列表推导式一次性创建完整列表，占用更多内存但访问速度快；生成器表达式惰性求值，节省内存但每次访问需要计算。

```python
import sys

# 内存对比
list_comp = [x**2 for x in range(10000)]
gen_exp = (x**2 for x in range(10000))

print(sys.getsizeof(list_comp))  # ~87616 字节
print(sys.getsizeof(gen_exp))    # ~112 字节

# 性能对比
import timeit

# 列表推导式：快速访问
def list_access():
    data = [x**2 for x in range(1000)]
    return sum(data)

# 生成器：节省内存
def gen_access():
    data = (x**2 for x in range(1000))
    return sum(data)

print(timeit.timeit(list_access, number=1000))  # 更快
print(timeit.timeit(gen_access, number=1000))   # 更省内存
```

**Q2: yield 和 return 的区别？**
A: return 终止函数并返回值，yield 暂停函数并产生值，函数状态被保存，下次调用从暂停处继续执行。

```python
def normal_function():
    print("开始")
    return "结果"
    print("不会执行")  # 永远不会执行

def generator_function():
    print("开始")
    yield "第一个值"
    print("中间")
    yield "第二个值"
    print("结束")

# 普通函数
result = normal_function()  # 输出：开始
print(result)  # 输出：结果

# 生成器函数
gen = generator_function()  # 不输出任何内容
print(next(gen))  # 输出：开始 \n 第一个值
print(next(gen))  # 输出：中间 \n 第二个值
# next(gen)  # 输出：结束，然后抛出 StopIteration
```

**Q3: yield from 的作用和使用场景？**
A: yield from 用于委托生成器，简化嵌套生成器的语法，自动处理 StopIteration 异常，常用于生成器组合和递归场景。

```python
# 不使用 yield from（繁琐）
def chain_old(*iterables):
    for iterable in iterables:
        for item in iterable:
            yield item

# 使用 yield from（简洁）
def chain_new(*iterables):
    for iterable in iterables:
        yield from iterable

# 递归场景：遍历嵌套结构
def flatten(nested_list):
    for item in nested_list:
        if isinstance(item, list):
            yield from flatten(item)  # 递归委托
        else:
            yield item

nested = [1, [2, 3], [4, [5, 6]], 7]
print(list(flatten(nested)))  # [1, 2, 3, 4, 5, 6, 7]

# 异常处理：yield from 自动传递异常
def delegator():
    try:
        yield from range(3)
    except GeneratorExit:
        print("生成器被关闭")

gen = delegator()
print(next(gen))  # 0
gen.close()  # 输出：生成器被关闭
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

**追问点：**

**Q1: 为什么可变对象不能作为默认参数？**
A: 默认参数在函数定义时只计算一次，如果是可变对象，所有函数调用都会共享同一个对象，导致意外的副作用。

```python
# 错误示例
def bad_append(item, target=[]):
    target.append(item)
    return target

print(bad_append(1))  # [1]
print(bad_append(2))  # [1, 2] - 意外！
print(bad_append(3))  # [1, 2, 3] - 继续累积

# 正确做法
def good_append(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target

print(good_append(1))  # [1]
print(good_append(2))  # [2] - 正确
print(good_append(3))  # [3] - 每次都是新列表

# 查看默认参数对象
print(bad_append.__defaults__)  # ([1, 2, 3],) - 同一个对象
print(good_append.__defaults__)  # (None,) - 不可变
```

**Q2: 装饰器的执行顺序是什么？**
A: 多个装饰器从下到上定义，从上到下执行。装饰器在函数定义时就执行，而不是在函数调用时。

```python
def decorator_a(func):
    print("装饰器 A 定义")
    def wrapper(*args, **kwargs):
        print("装饰器 A 执行前")
        result = func(*args, **kwargs)
        print("装饰器 A 执行后")
        return result
    return wrapper

def decorator_b(func):
    print("装饰器 B 定义")
    def wrapper(*args, **kwargs):
        print("装饰器 B 执行前")
        result = func(*args, **kwargs)
        print("装饰器 B 执行后")
        return result
    return wrapper

@decorator_a  # 第二个执行
@decorator_b  # 第一个执行
def my_function():
    print("原函数执行")

# 输出顺序：
# 装饰器 B 定义
# 装饰器 A 定义

my_function()
# 装饰器 A 执行前
# 装饰器 B 执行前
# 原函数执行
# 装饰器 B 执行后
# 装饰器 A 执行后
```

**Q3: functools.wraps 的作用是什么？**
A: functools.wraps 用于保留被装饰函数的元信息（如 __name__、__doc__、__annotations__ 等），避免装饰器覆盖原函数的属性。

```python
import functools

# 不使用 @wraps
def bad_decorator(func):
    def wrapper(*args, **kwargs):
        """这是包装函数"""
        return func(*args, **kwargs)
    return wrapper

# 使用 @wraps
def good_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        """这是包装函数"""
        return func(*args, **kwargs)
    return wrapper

@bad_decorator
def bad_function():
    """这是原函数"""
    pass

@good_decorator
def good_function():
    """这是原函数"""
    pass

print(bad_function.__name__)   # wrapper - 错误
print(bad_function.__doc__)    # 这是包装函数 - 错误

print(good_function.__name__)  # good_function - 正确
print(good_function.__doc__)   # 这是原函数 - 正确

# 实际应用：调试和日志
def debug(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"调用函数: {func.__name__}")
        return func(*args, **kwargs)
    return wrapper
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

**追问点：**

**Q1: Python 中的私有属性是如何实现的？**
A: Python 没有真正的私有属性，使用名称修饰（name mangling）机制。以双下划线开头的属性会被重命名为 `_ClassName__attribute`，实现"伪私有"。

```python
class MyClass:
    def __init__(self):
        self.public = "公开属性"
        self._protected = "约定私有（仍可访问）"
        self.__private = "名称修饰私有"

obj = MyClass()
print(obj.public)      # 正常访问
print(obj._protected)  # 可以访问，但约定不应该

# print(obj.__private)  # AttributeError
print(obj._MyClass__private)  # 通过修饰后的名称可以访问

# 查看所有属性
print(dir(obj))
# ['_MyClass__private', '_protected', 'public', ...]

# 实际应用：避免子类意外覆盖
class Parent:
    def __init__(self):
        self.__important_data = "重要数据"
    
    def get_data(self):
        return self.__important_data

class Child(Parent):
    def __init__(self):
        super().__init__()
        self.__important_data = "子类数据"  # 不会覆盖父类的数据

child = Child()
print(child.get_data())  # "重要数据" - 父类数据未被覆盖
```

**Q2: MRO（方法解析顺序）是如何工作的？**
A: Python 使用 C3 线性化算法确定 MRO，保证方法调用的一致性和单调性。遵循深度优先、从左到右的原则，但避免菱形继承问题。

```python
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

class D(B, C):  # 多重继承
    def method(self):
        print("D")
        super().method()

# 查看 MRO
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)

# 执行顺序
D().method()
# 输出：D -> B -> C -> A

# 菱形继承问题的解决
class Base:
    def __init__(self):
        print("Base init")

class Left(Base):
    def __init__(self):
        print("Left init")
        super().__init__()

class Right(Base):
    def __init__(self):
        print("Right init")
        super().__init__()

class Child(Left, Right):
    def __init__(self):
        print("Child init")
        super().__init__()

Child()
# 输出：Child init -> Left init -> Right init -> Base init
# Base.__init__ 只被调用一次，避免了重复初始化
```

**Q3: @property、@classmethod、@staticmethod 的区别和使用场景？**
A: @property 用于将方法转换为属性访问；@classmethod 接收类作为第一个参数，用于替代构造函数；@staticmethod 不接收特殊参数，用于工具函数。

```python
class Temperature:
    def __init__(self, celsius=0):
        self._celsius = celsius

    @property
    def celsius(self):
        """获取摄氏度"""
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        """设置摄氏度"""
        if value < -273.15:
            raise ValueError("温度不能低于绝对零度")
        self._celsius = value

    @property
    def fahrenheit(self):
        """计算华氏度"""
        return self._celsius * 9/5 + 32

    @classmethod
    def from_fahrenheit(cls, fahrenheit):
        """从华氏度创建实例"""
        celsius = (fahrenheit - 32) * 5/9
        return cls(celsius)

    @staticmethod
    def is_freezing(celsius):
        """判断是否结冰（工具函数）"""
        return celsius <= 0

# 使用示例
temp = Temperature(25)
print(temp.celsius)     # 25 - 属性访问
print(temp.fahrenheit)  # 77.0 - 计算属性

temp.celsius = 30       # 属性设置
print(temp.fahrenheit)  # 86.0

# 类方法：替代构造函数
temp2 = Temperature.from_fahrenheit(86)
print(temp2.celsius)    # 30.0

# 静态方法：工具函数
print(Temperature.is_freezing(0))   # True
print(Temperature.is_freezing(10))  # False
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

**追问点：**

**Q1: try-except-else-finally 的执行顺序是什么？**
A: try 块正常执行时运行 else 块，无论是否有异常都会执行 finally 块。else 块只在没有异常时执行，finally 块用于清理资源。

```python
def test_exception_flow(raise_error=False):
    try:
        print("1. try 块执行")
        if raise_error:
            raise ValueError("测试异常")
        print("2. try 块正常结束")
    except ValueError as e:
        print(f"3. except 块执行: {e}")
        return "异常返回"
    else:
        print("4. else 块执行（无异常时）")
        return "正常返回"
    finally:
        print("5. finally 块执行（总是执行）")

# 无异常情况
print("=== 无异常 ===")
result = test_exception_flow(False)
print(f"返回值: {result}")
# 输出：1 -> 2 -> 4 -> 5

# 有异常情况
print("\n=== 有异常 ===")
result = test_exception_flow(True)
print(f"返回值: {result}")
# 输出：1 -> 3 -> 5

# finally 中的 return 会覆盖其他 return
def dangerous_finally():
    try:
        return "try 返回"
    finally:
        return "finally 返回"  # 危险！会覆盖 try 的返回值

print(dangerous_finally())  # "finally 返回"
```

**Q2: 上下文管理器的工作原理？**
A: 上下文管理器实现 `__enter__` 和 `__exit__` 方法，with 语句自动调用这两个方法，确保资源的正确获取和释放，即使发生异常也能正确清理。

```python
class DatabaseConnection:
    def __init__(self, db_name):
        self.db_name = db_name
        self.connection = None

    def __enter__(self):
        print(f"连接到数据库: {self.db_name}")
        self.connection = f"connection_to_{self.db_name}"
        return self.connection

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"关闭数据库连接: {self.db_name}")
        if exc_type:
            print(f"发生异常: {exc_type.__name__}: {exc_val}")
            # 返回 True 会抑制异常，返回 False 或 None 会传播异常
        self.connection = None
        return False  # 不抑制异常

# 正常使用
with DatabaseConnection("test_db") as conn:
    print(f"使用连接: {conn}")
    # 执行数据库操作

# 异常情况
try:
    with DatabaseConnection("test_db") as conn:
        print(f"使用连接: {conn}")
        raise ValueError("数据库操作失败")
except ValueError as e:
    print(f"捕获异常: {e}")

# 使用 contextlib 简化
from contextlib import contextmanager

@contextmanager
def database_connection(db_name):
    print(f"连接到数据库: {db_name}")
    connection = f"connection_to_{db_name}"
    try:
        yield connection
    finally:
        print(f"关闭数据库连接: {db_name}")

with database_connection("simple_db") as conn:
    print(f"使用连接: {conn}")
```

**Q3: 异常链（Exception Chaining）的作用和使用场景？**
A: 异常链用于保留原始异常信息，同时抛出新的异常。使用 `raise ... from ...` 显式链接异常，或使用 `raise` 隐式链接，有助于调试和错误追踪。

```python
# 显式异常链：raise ... from ...
def process_data(data):
    try:
        return int(data)
    except ValueError as e:
        # 保留原始异常信息，同时提供更有意义的错误
        raise ProcessingError(f"无法处理数据: {data}") from e

class ProcessingError(Exception):
    pass

# 隐式异常链：在异常处理中再次抛出异常
def implicit_chain():
    try:
        1 / 0
    except ZeroDivisionError:
        # 没有使用 from，但 Python 会自动保留异常链
        raise ValueError("处理过程中发生错误")

# 抑制异常链：raise ... from None
def suppress_chain():
    try:
        1 / 0
    except ZeroDivisionError:
        # 不显示原始异常信息
        raise ValueError("处理失败") from None

# 测试异常链
try:
    process_data("abc")
except ProcessingError as e:
    print(f"异常: {e}")
    print(f"原因: {e.__cause__}")  # 显式链接的原始异常
    print(f"上下文: {e.__context__}")  # 隐式链接的异常

# 实际应用：API 错误处理
class APIError(Exception):
    def __init__(self, message, status_code=500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

def fetch_user_data(user_id):
    try:
        # 模拟数据库查询
        if user_id <= 0:
            raise ValueError("用户ID必须为正数")
        # 模拟网络请求
        import random
        if random.random() < 0.3:
            raise ConnectionError("网络连接失败")
        return {"id": user_id, "name": f"User{user_id}"}
    except ValueError as e:
        raise APIError(f"参数错误: {e}", 400) from e
    except ConnectionError as e:
        raise APIError(f"服务不可用: {e}", 503) from e
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

**追问点：**

**Q1: GIL 为什么存在，它解决了什么问题？**
A: GIL 保护 CPython 解释器的内部数据结构，防止多线程同时修改 Python 对象的引用计数，简化了内存管理。但它限制了多线程的并行执行能力。

```python
import threading
import time

# CPU 密集型任务：GIL 限制性能
def cpu_intensive_task(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

# 单线程执行
start_time = time.time()
result1 = cpu_intensive_task(10**6)
result2 = cpu_intensive_task(10**6)
single_thread_time = time.time() - start_time

# 多线程执行（受 GIL 限制）
start_time = time.time()
threads = []
results = []

def worker(n, results, index):
    results.append((index, cpu_intensive_task(n)))

for i in range(2):
    results.append(None)
    thread = threading.Thread(target=worker, args=(10**6, results, i))
    threads.append(thread)
    thread.start()

for thread in threads:
    thread.join()

multi_thread_time = time.time() - start_time

print(f"单线程时间: {single_thread_time:.2f}s")
print(f"多线程时间: {multi_thread_time:.2f}s")
# 多线程可能更慢，因为 GIL 和上下文切换开销

# I/O 密集型任务：多线程有效
import requests
import concurrent.futures

def fetch_url(url):
    response = requests.get(url)
    return len(response.content)

urls = ['http://httpbin.org/delay/1'] * 5

# 多线程处理 I/O 密集型任务
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    start_time = time.time()
    results = list(executor.map(fetch_url, urls))
    io_thread_time = time.time() - start_time
    print(f"I/O 多线程时间: {io_thread_time:.2f}s")  # 显著更快
```

**Q2: 什么时候使用多线程，什么时候使用多进程？**
A: I/O 密集型任务使用多线程（GIL 在 I/O 时释放），CPU 密集型任务使用多进程（绕过 GIL 限制）。异步编程适合大量并发 I/O 操作。

```python
import time
import threading
import multiprocessing
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

# I/O 密集型任务示例
def io_task(duration):
    time.sleep(duration)  # 模拟 I/O 等待
    return f"Task completed after {duration}s"

# CPU 密集型任务示例
def cpu_task(n):
    result = 0
    for i in range(n):
        result += i ** 2
    return result

# 测试 I/O 密集型任务
def test_io_performance():
    tasks = [1, 1, 1, 1, 1]  # 5个1秒的I/O任务
    
    # 串行执行
    start = time.time()
    for task in tasks:
        io_task(task)
    serial_time = time.time() - start
    
    # 多线程执行
    start = time.time()
    with ThreadPoolExecutor(max_workers=5) as executor:
        list(executor.map(io_task, tasks))
    thread_time = time.time() - start
    
    print(f"I/O 串行: {serial_time:.2f}s")
    print(f"I/O 多线程: {thread_time:.2f}s")
    print(f"多线程提升: {serial_time/thread_time:.1f}x")

# 测试 CPU 密集型任务
def test_cpu_performance():
    tasks = [10**6] * 4  # 4个CPU密集型任务
    
    # 多线程执行（受GIL限制）
    start = time.time()
    with ThreadPoolExecutor(max_workers=4) as executor:
        list(executor.map(cpu_task, tasks))
    thread_time = time.time() - start
    
    # 多进程执行（绕过GIL）
    start = time.time()
    with ProcessPoolExecutor(max_workers=4) as executor:
        list(executor.map(cpu_task, tasks))
    process_time = time.time() - start
    
    print(f"CPU 多线程: {thread_time:.2f}s")
    print(f"CPU 多进程: {process_time:.2f}s")
    print(f"多进程提升: {thread_time/process_time:.1f}x")

# 异步编程示例
async def async_io_task(session, url):
    async with session.get(url) as response:
        return await response.text()

async def test_async_performance():
    urls = ['http://httpbin.org/delay/1'] * 10
    
    async with aiohttp.ClientSession() as session:
        start = time.time()
        tasks = [async_io_task(session, url) for url in urls]
        await asyncio.gather(*tasks)
        async_time = time.time() - start
        
    print(f"异步处理10个请求: {async_time:.2f}s")
```

**Q3: asyncio 的事件循环是如何工作的？**
A: asyncio 使用单线程事件循环，通过协程实现并发。当遇到 I/O 操作时，协程主动让出控制权，事件循环调度其他协程执行，实现高效的并发处理。

```python
import asyncio
import time

# 协程的基本概念
async def simple_coroutine(name, delay):
    print(f"{name} 开始执行")
    await asyncio.sleep(delay)  # 模拟异步I/O
    print(f"{name} 执行完成")
    return f"{name} 结果"

# 事件循环调度示例
async def demonstrate_event_loop():
    print("=== 事件循环调度演示 ===")
    
    # 创建多个协程
    tasks = [
        simple_coroutine("任务1", 2),
        simple_coroutine("任务2", 1),
        simple_coroutine("任务3", 3),
    ]
    
    # 并发执行
    start_time = time.time()
    results = await asyncio.gather(*tasks)
    total_time = time.time() - start_time
    
    print(f"总执行时间: {total_time:.2f}s")  # 约3秒，而不是6秒
    print(f"结果: {results}")

# 自定义事件循环任务
class CustomTask:
    def __init__(self, name):
        self.name = name
        self.completed = False
    
    async def run(self):
        print(f"{self.name} 开始")
        await asyncio.sleep(1)
        self.completed = True
        print(f"{self.name} 完成")

async def task_manager():
    tasks = [CustomTask(f"自定义任务{i}") for i in range(3)]
    
    # 创建协程任务
    coroutines = [task.run() for task in tasks]
    
    # 等待所有任务完成
    await asyncio.gather(*coroutines)
    
    # 检查完成状态
    for task in tasks:
        print(f"{task.name} 状态: {'完成' if task.completed else '未完成'}")

# 异步上下文管理器
class AsyncDatabase:
    async def __aenter__(self):
        print("连接数据库")
        await asyncio.sleep(0.1)  # 模拟连接时间
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print("关闭数据库连接")
        await asyncio.sleep(0.1)  # 模拟关闭时间
    
    async def query(self, sql):
        print(f"执行查询: {sql}")
        await asyncio.sleep(0.5)  # 模拟查询时间
        return f"查询结果: {sql}"

async def database_operations():
    async with AsyncDatabase() as db:
        result1 = await db.query("SELECT * FROM users")
        result2 = await db.query("SELECT * FROM orders")
        return [result1, result2]

# 运行示例
if __name__ == "__main__":
    asyncio.run(demonstrate_event_loop())
    asyncio.run(task_manager())
    results = asyncio.run(database_operations())
    print(results)
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

**追问点：**

**Q1: Python 的垃圾回收机制是如何工作的？**
A: Python 使用引用计数作为主要垃圾回收机制，配合循环垃圾收集器处理循环引用。分为三代收集，新对象在第0代，存活时间长的对象晋升到更高代。

```python
import gc
import sys

# 引用计数示例
def reference_counting_demo():
    a = [1, 2, 3]
    print(f"创建后引用计数: {sys.getrefcount(a)}")  # 2（a + getrefcount参数）
    
    b = a  # 增加引用
    print(f"赋值后引用计数: {sys.getrefcount(a)}")  # 3
    
    del b  # 减少引用
    print(f"删除后引用计数: {sys.getrefcount(a)}")  # 2
    
    # 引用计数为0时立即回收
    class TestClass:
        def __del__(self):
            print("对象被回收")
    
    obj = TestClass()
    del obj  # 立即输出"对象被回收"

# 循环引用问题
def circular_reference_demo():
    # 创建循环引用
    class Node:
        def __init__(self, name):
            self.name = name
            self.ref = None
        
        def __del__(self):
            print(f"Node {self.name} 被回收")
    
    # 循环引用
    node1 = Node("A")
    node2 = Node("B")
    node1.ref = node2
    node2.ref = node1
    
    print(f"循环引用前垃圾对象数: {len(gc.get_objects())}")
    
    # 删除引用，但对象不会立即回收（循环引用）
    del node1, node2
    
    print(f"删除引用后垃圾对象数: {len(gc.get_objects())}")
    
    # 手动触发垃圾回收
    collected = gc.collect()
    print(f"垃圾回收清理了 {collected} 个对象")

# 分代垃圾回收
def generational_gc_demo():
    print("=== 分代垃圾回收统计 ===")
    print(f"GC 阈值: {gc.get_threshold()}")  # (700, 10, 10)
    print(f"各代对象数量: {gc.get_count()}")
    
    # 创建大量对象
    objects = []
    for i in range(1000):
        objects.append([i] * 100)
    
    print(f"创建对象后各代数量: {gc.get_count()}")
    
    # 触发垃圾回收
    for generation in range(3):
        collected = gc.collect(generation)
        print(f"第{generation}代回收了 {collected} 个对象")
    
    print(f"回收后各代数量: {gc.get_count()}")

reference_counting_demo()
circular_reference_demo()
generational_gc_demo()
```

**Q2: __slots__ 如何节省内存，有什么限制？**
A: __slots__ 使用固定大小的数组存储属性，而不是字典，节省内存并提高访问速度。但限制了动态添加属性，且不支持某些特性如弱引用。

```python
import sys

# 普通类（使用 __dict__）
class RegularClass:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# 使用 __slots__ 的类
class SlottedClass:
    __slots__ = ['x', 'y']
    
    def __init__(self, x, y):
        self.x = x
        self.y = y

# 内存使用对比
def memory_comparison():
    regular_obj = RegularClass(1, 2)
    slotted_obj = SlottedClass(1, 2)
    
    print(f"普通对象大小: {sys.getsizeof(regular_obj)} 字节")
    print(f"__slots__ 对象大小: {sys.getsizeof(slotted_obj)} 字节")
    
    # __dict__ 的额外开销
    print(f"__dict__ 大小: {sys.getsizeof(regular_obj.__dict__)} 字节")
    
    # 大量对象的内存差异
    regular_objects = [RegularClass(i, i+1) for i in range(10000)]
    slotted_objects = [SlottedClass(i, i+1) for i in range(10000)]
    
    regular_total = sum(sys.getsizeof(obj) + sys.getsizeof(obj.__dict__) 
                       for obj in regular_objects)
    slotted_total = sum(sys.getsizeof(obj) for obj in slotted_objects)
    
    print(f"10000个普通对象总内存: {regular_total} 字节")
    print(f"10000个__slots__对象总内存: {slotted_total} 字节")
    print(f"节省内存: {(regular_total - slotted_total) / regular_total * 100:.1f}%")

# __slots__ 的限制
def slots_limitations():
    class SlottedClass:
        __slots__ = ['x', 'y']
        
        def __init__(self, x, y):
            self.x = x
            self.y = y
    
    obj = SlottedClass(1, 2)
    
    # 1. 不能动态添加属性
    try:
        obj.z = 3  # AttributeError
    except AttributeError as e:
        print(f"限制1 - 不能动态添加属性: {e}")
    
    # 2. 没有 __dict__
    try:
        print(obj.__dict__)  # AttributeError
    except AttributeError as e:
        print(f"限制2 - 没有 __dict__: {e}")
    
    # 3. 不支持弱引用（除非显式添加）
    import weakref
    try:
        weak_ref = weakref.ref(obj)  # TypeError
    except TypeError as e:
        print(f"限制3 - 不支持弱引用: {e}")
    
    # 解决方案：添加 __weakref__ 到 __slots__
    class WeakRefSlottedClass:
        __slots__ = ['x', 'y', '__weakref__']
        
        def __init__(self, x, y):
            self.x = x
            self.y = y
    
    obj2 = WeakRefSlottedClass(1, 2)
    weak_ref = weakref.ref(obj2)  # 现在可以工作
    print(f"弱引用创建成功: {weak_ref}")

memory_comparison()
slots_limitations()
```

**Q3: 如何检测和避免内存泄漏？**
A: 使用 gc 模块检测循环引用，tracemalloc 追踪内存分配，weakref 避免强引用循环。定期检查对象数量增长，使用内存分析工具如 memory_profiler。

```python
import gc
import tracemalloc
import weakref
import sys

# 内存泄漏检测
def detect_memory_leaks():
    # 启用内存追踪
    tracemalloc.start()
    
    # 记录初始状态
    initial_objects = len(gc.get_objects())
    initial_snapshot = tracemalloc.take_snapshot()
    
    # 模拟可能的内存泄漏
    leaked_objects = []
    
    class LeakyClass:
        def __init__(self, data):
            self.data = data
            self.circular_ref = self  # 循环引用
            leaked_objects.append(self)  # 全局引用
    
    # 创建对象
    for i in range(1000):
        LeakyClass(f"data_{i}")
    
    # 检查对象数量增长
    current_objects = len(gc.get_objects())
    print(f"对象数量增长: {current_objects - initial_objects}")
    
    # 内存使用分析
    current_snapshot = tracemalloc.take_snapshot()
    top_stats = current_snapshot.compare_to(initial_snapshot, 'lineno')
    
    print("内存增长最多的前3个位置:")
    for stat in top_stats[:3]:
        print(stat)
    
    # 查找循环引用
    gc.collect()  # 触发垃圾回收
    if gc.garbage:
        print(f"发现 {len(gc.garbage)} 个无法回收的对象")
        for obj in gc.garbage[:5]:  # 显示前5个
            print(f"  {type(obj)}: {obj}")
    
    tracemalloc.stop()

# 使用弱引用避免循环引用
def weak_reference_solution():
    class Parent:
        def __init__(self, name):
            self.name = name
            self.children = []
        
        def add_child(self, child):
            self.children.append(child)
            child.parent_ref = weakref.ref(self)  # 使用弱引用
        
        def __del__(self):
            print(f"Parent {self.name} 被回收")
    
    class Child:
        def __init__(self, name):
            self.name = name
            self.parent_ref = None
        
        def get_parent(self):
            if self.parent_ref:
                parent = self.parent_ref()  # 获取弱引用的对象
                return parent if parent else None
            return None
        
        def __del__(self):
            print(f"Child {self.name} 被回收")
    
    # 创建父子关系
    parent = Parent("父对象")
    child = Child("子对象")
    parent.add_child(child)
    
    print(f"子对象的父对象: {child.get_parent().name}")
    
    # 删除父对象
    del parent
    print("删除父对象后...")
    
    # 子对象仍然可以检查父对象是否存在
    parent_obj = child.get_parent()
    print(f"父对象是否存在: {parent_obj is not None}")
    
    del child

# 内存监控工具
class MemoryMonitor:
    def __init__(self):
        self.initial_objects = len(gc.get_objects())
    
    def check_growth(self, operation_name="操作"):
        current_objects = len(gc.get_objects())
        growth = current_objects - self.initial_objects
        print(f"{operation_name}后对象增长: {growth}")
        
        if growth > 1000:  # 阈值检查
            print("⚠️  警告：对象数量增长过快，可能存在内存泄漏")
            
            # 强制垃圾回收
            collected = gc.collect()
            print(f"垃圾回收清理了 {collected} 个对象")
            
            # 重新检查
            final_objects = len(gc.get_objects())
            final_growth = final_objects - self.initial_objects
            print(f"垃圾回收后对象增长: {final_growth}")

# 使用示例
monitor = MemoryMonitor()
detect_memory_leaks()
monitor.check_growth("内存泄漏测试")

weak_reference_solution()
monitor.check_growth("弱引用测试")
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
