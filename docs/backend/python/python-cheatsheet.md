# Python 速查手册

> Python 开发常用代码片段与 API 速查

## 基础语法

### 数据类型操作

```python
# 字符串
s = "  Hello World  "
s.strip()                  # 去除首尾空白
s.lower()                  # 转小写
s.upper()                  # 转大写
s.capitalize()             # 首字母大写
s.title()                  # 每个单词首字母大写
s.split()                  # 分割
s.split(',')               # 按指定字符分割
s.replace('o', '0')        # 替换
s.startswith('He')         # 开头判断
s.endswith('ld')           # 结尾判断
s.find('o')                # 查找位置，不存在返回 -1
s.index('o')               # 查找位置，不存在抛异常
s.count('o')               # 计数
s.isdigit()                # 是否全是数字
s.isalpha()                # 是否全是字母
s.isalnum()                # 是否字母或数字
''.join(['a', 'b', 'c'])   # 连接
f"Name: {name}, Age: {age}"  # f-string
"{} {}".format('Hello', 'World')  # format

# 列表
lst = [1, 2, 3, 4, 5]
lst.append(6)              # 添加元素
lst.extend([7, 8])         # 扩展列表
lst.insert(0, 0)           # 插入
lst.pop()                  # 弹出最后一个
lst.pop(0)                 # 弹出指定位置
lst.remove(3)              # 移除第一个匹配项
lst.index(2)               # 查找索引
lst.count(2)               # 计数
lst.sort()                 # 排序（原地）
lst.sort(reverse=True)     # 降序
lst.reverse()              # 反转
sorted(lst)                # 排序（返回新列表）
lst[1:4]                   # 切片
lst[::2]                   # 步长切片
lst[::-1]                  # 反转
[x**2 for x in lst]        # 列表推导式

# 字典
d = {'a': 1, 'b': 2}
d['c'] = 3                 # 添加/修改
d.get('d', 0)              # 获取，默认值
d.keys()                   # 所有键
d.values()                 # 所有值
d.items()                  # 所有键值对
d.pop('a')                 # 弹出
d.update({'e': 5})         # 更新
d.setdefault('f', 6)       # 设置默认值
{k: v for k, v in d.items()}  # 字典推导式

# 集合
s = {1, 2, 3}
s.add(4)                   # 添加
s.remove(1)                # 移除（不存在抛异常）
s.discard(1)               # 移除（不存在不报错）
s.union({4, 5})            # 并集
s.intersection({2, 3})     # 交集
s.difference({2, 3})       # 差集
s.symmetric_difference({2, 4})  # 对称差集
```

### 控制流

```python
# 条件表达式
result = a if condition else b

# for 循环
for i in range(10):
    pass

for i, item in enumerate(lst):
    print(i, item)

for k, v in d.items():
    print(k, v)

for a, b in zip(lst1, lst2):
    print(a, b)

# while 循环
while condition:
    if should_skip:
        continue
    if should_stop:
        break
else:
    # 正常结束时执行
    pass

# 异常处理
try:
    risky_operation()
except ValueError as e:
    handle_error(e)
except (TypeError, KeyError):
    handle_multiple()
except Exception as e:
    handle_any(e)
else:
    # 无异常时执行
    pass
finally:
    # 总是执行
    cleanup()
```

---

## 常用函数

### 内置函数

```python
# 序列操作
len(obj)                   # 长度
max(iterable)              # 最大值
min(iterable)              # 最小值
sum(iterable)              # 求和
sorted(iterable)           # 排序
reversed(sequence)         # 反转
enumerate(iterable)        # 枚举
zip(*iterables)            # 打包
all(iterable)              # 全为真
any(iterable)              # 任一为真

# 类型转换
int(x)
float(x)
str(x)
bool(x)
list(x)
tuple(x)
set(x)
dict(x)

# 函数式
map(func, iterable)        # 映射
filter(func, iterable)     # 过滤
reduce(func, iterable)     # 归约（需导入）

# 示例
list(map(lambda x: x**2, [1, 2, 3]))  # [1, 4, 9]
list(filter(lambda x: x > 0, [-1, 0, 1, 2]))  # [1, 2]

from functools import reduce
reduce(lambda x, y: x + y, [1, 2, 3, 4])  # 10

# 其他
abs(x)                     # 绝对值
round(x, n)                # 四舍五入
pow(x, y)                  # 幂运算
divmod(x, y)               # 商和余数
isinstance(obj, type)      # 类型检查
hasattr(obj, name)         # 属性检查
getattr(obj, name, default)  # 获取属性
setattr(obj, name, value)  # 设置属性
callable(obj)              # 是否可调用
dir(obj)                   # 对象属性列表
vars(obj)                  # 对象 __dict__
id(obj)                    # 对象 ID
hash(obj)                  # 哈希值
```

---

## 常用模块

### os 模块

```python
import os

# 路径操作
os.getcwd()                    # 当前目录
os.chdir('/path')              # 切换目录
os.listdir('.')                # 列出目录
os.makedirs('a/b/c', exist_ok=True)  # 创建目录
os.remove('file.txt')          # 删除文件
os.rmdir('dir')                # 删除空目录
os.rename('old', 'new')        # 重命名

# 路径
os.path.exists('path')         # 是否存在
os.path.isfile('path')         # 是否文件
os.path.isdir('path')          # 是否目录
os.path.join('a', 'b', 'c')    # 路径拼接
os.path.split('a/b/c.txt')     # 分割路径
os.path.dirname('a/b/c.txt')   # 目录名
os.path.basename('a/b/c.txt')  # 文件名
os.path.splitext('file.txt')   # 分割扩展名
os.path.abspath('.')           # 绝对路径
os.path.getsize('file')        # 文件大小

# 环境变量
os.environ.get('HOME')
os.environ['MY_VAR'] = 'value'

# 执行命令
os.system('ls -la')
```

### pathlib 模块（推荐）

```python
from pathlib import Path

# 路径操作
p = Path('.')
p = Path.home()                # 用户目录
p = Path.cwd()                 # 当前目录

# 路径组合
p = Path('/home') / 'user' / 'file.txt'

# 属性
p.name                         # 文件名
p.stem                         # 无扩展名
p.suffix                       # 扩展名
p.parent                       # 父目录
p.parts                        # 路径组成部分

# 判断
p.exists()
p.is_file()
p.is_dir()

# 操作
p.mkdir(parents=True, exist_ok=True)
p.rmdir()
p.unlink()                     # 删除文件
p.rename('new_name')

# 遍历
list(p.iterdir())              # 目录内容
list(p.glob('*.py'))           # 匹配文件
list(p.rglob('*.py'))          # 递归匹配

# 读写
p.read_text()
p.read_bytes()
p.write_text('content')
p.write_bytes(b'content')
```

### json 模块

```python
import json

# 序列化
json.dumps(obj)                # 对象 -> JSON 字符串
json.dumps(obj, indent=2)      # 格式化
json.dumps(obj, ensure_ascii=False)  # 支持中文
json.dump(obj, file)           # 写入文件

# 反序列化
json.loads(json_str)           # JSON 字符串 -> 对象
json.load(file)                # 从文件读取

# 自定义编码
class MyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

json.dumps(obj, cls=MyEncoder)
```

### datetime 模块

```python
from datetime import datetime, date, time, timedelta

# 当前时间
now = datetime.now()
today = date.today()
utc_now = datetime.utcnow()

# 创建
dt = datetime(2024, 1, 15, 14, 30, 0)
d = date(2024, 1, 15)
t = time(14, 30, 0)

# 解析
datetime.strptime('2024-01-15', '%Y-%m-%d')
datetime.fromisoformat('2024-01-15T14:30:00')

# 格式化
dt.strftime('%Y-%m-%d %H:%M:%S')
dt.isoformat()

# 属性
dt.year, dt.month, dt.day
dt.hour, dt.minute, dt.second
dt.weekday()                   # 0-6 (周一-周日)
dt.date()                      # 日期部分
dt.time()                      # 时间部分

# 时间运算
dt + timedelta(days=7)
dt - timedelta(hours=1)
(dt2 - dt1).days               # 天数差
(dt2 - dt1).total_seconds()    # 秒数差

# 时间戳
dt.timestamp()                 # datetime -> timestamp
datetime.fromtimestamp(ts)     # timestamp -> datetime
```

### re 正则表达式

```python
import re

# 匹配
re.match(r'^\d+', '123abc')    # 从开头匹配
re.search(r'\d+', 'abc123')    # 搜索
re.findall(r'\d+', 'a1b2c3')   # 查找所有
re.finditer(r'\d+', 'a1b2c3')  # 迭代器

# 替换
re.sub(r'\d+', 'X', 'a1b2c3')  # a X bXcX
re.sub(r'(\d+)', r'[\1]', 'a1b2')  # a[1]b[2]

# 分割
re.split(r'\s+', 'a b  c')     # ['a', 'b', 'c']

# 编译
pattern = re.compile(r'\d+')
pattern.findall('a1b2c3')

# 常用模式
r'\d'      # 数字
r'\D'      # 非数字
r'\w'      # 字母数字下划线
r'\W'      # 非字母数字下划线
r'\s'      # 空白字符
r'\S'      # 非空白字符
r'.'       # 任意字符（除换行）
r'^'       # 开头
r'$'       # 结尾
r'*'       # 0 次或多次
r'+'       # 1 次或多次
r'?'       # 0 次或 1 次
r'{n}'     # n 次
r'{n,m}'   # n 到 m 次
r'(...)'   # 分组
r'(?:...)' # 非捕获分组
r'(?P<name>...)' # 命名分组
```

### collections 模块

```python
from collections import Counter, defaultdict, OrderedDict, deque, namedtuple

# Counter - 计数器
c = Counter(['a', 'b', 'a', 'c', 'a', 'b'])
c['a']                         # 3
c.most_common(2)               # [('a', 3), ('b', 2)]

# defaultdict - 默认值字典
d = defaultdict(list)
d['key'].append(1)             # 自动创建空列表

d = defaultdict(int)
d['key'] += 1                  # 自动初始化为 0

# OrderedDict - 有序字典（Python 3.7+ dict 已有序）
od = OrderedDict()

# deque - 双端队列
dq = deque([1, 2, 3])
dq.append(4)                   # 右端添加
dq.appendleft(0)               # 左端添加
dq.pop()                       # 右端弹出
dq.popleft()                   # 左端弹出
dq.rotate(1)                   # 旋转

# namedtuple - 命名元组
Point = namedtuple('Point', ['x', 'y'])
p = Point(1, 2)
p.x, p.y
```

### itertools 模块

```python
from itertools import (
    chain, combinations, permutations, product,
    groupby, islice, cycle, repeat, count
)

# 连接迭代器
list(chain([1, 2], [3, 4]))    # [1, 2, 3, 4]

# 组合
list(combinations('ABC', 2))   # [('A','B'), ('A','C'), ('B','C')]

# 排列
list(permutations('ABC', 2))   # [('A','B'), ('A','C'), ...]

# 笛卡尔积
list(product('AB', '12'))      # [('A','1'), ('A','2'), ...]

# 分组
data = [('a', 1), ('a', 2), ('b', 3)]
for key, group in groupby(data, key=lambda x: x[0]):
    print(key, list(group))

# 切片
list(islice(range(100), 10, 20))  # [10, 11, ..., 19]

# 无限迭代器
for i in islice(count(10), 5):    # 10, 11, 12, 13, 14
    print(i)
```

---

## 常用代码片段

### 文件操作

```python
# 读取文件
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()
    # 或逐行读取
    lines = f.readlines()
    # 或迭代
    for line in f:
        process(line)

# 写入文件
with open('file.txt', 'w', encoding='utf-8') as f:
    f.write('content')
    f.writelines(['line1\n', 'line2\n'])

# 追加
with open('file.txt', 'a', encoding='utf-8') as f:
    f.write('appended content')
```

### HTTP 请求

```python
import requests

# GET 请求
response = requests.get('https://api.example.com/users')
data = response.json()

# POST 请求
response = requests.post(
    'https://api.example.com/users',
    json={'name': 'John'},
    headers={'Authorization': 'Bearer token'}
)

# 超时和异常处理
try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
except requests.exceptions.RequestException as e:
    print(f"Request failed: {e}")
```

### 日志配置

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
logger.info('Info message')
logger.warning('Warning message')
logger.error('Error message')
```
