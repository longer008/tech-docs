# 常见面试陷阱汇总

> 面试中的常见误区与正确理解

## 前端陷阱

### JavaScript 基础

| 陷阱问题 | 错误回答 | 正确理解 |
|---------|---------|---------|
| typeof null 返回什么 | "null" | "object"（历史遗留 bug） |
| [] == false | false | true（类型转换） |
| 0.1 + 0.2 == 0.3 | true | false（浮点精度问题） |
| typeof NaN | "NaN" | "number" |
| let 和 const 有变量提升吗 | 没有 | 有，但存在暂时性死区 |

```javascript
// 经典陷阱
console.log(typeof null);  // "object"
console.log([] == false);  // true
console.log(0.1 + 0.2);    // 0.30000000000000004

// 变量提升与暂时性死区
console.log(x);  // ReferenceError
let x = 1;

// this 指向
const obj = {
  name: 'test',
  getName: () => this.name  // 箭头函数 this 指向外层
};
console.log(obj.getName());  // undefined（非 obj.name）

// 闭包陷阱
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出：3, 3, 3（不是 0, 1, 2）
```

### Vue 相关

| 陷阱问题 | 错误回答 | 正确理解 |
|---------|---------|---------|
| Vue 2 数组变化检测 | 所有数组方法都能检测 | 只有 7 个变异方法能检测 |
| computed 和 methods 区别 | 只是写法不同 | computed 有缓存 |
| v-if 和 v-show 性能 | v-if 性能更好 | 频繁切换用 v-show |
| props 能直接修改吗 | 可以 | 不应该，会破坏单向数据流 |
| watch 能监听对象深层变化吗 | 可以 | 需要设置 deep: true |

```javascript
// Vue 2 数组检测陷阱
this.items[0] = newValue;  // 不能触发响应式
this.items.length = 0;     // 不能触发响应式

// 正确做法
this.$set(this.items, 0, newValue);
this.items.splice(0);

// Vue 3 已修复，Proxy 可以检测所有变化
```

### React 相关

| 陷阱问题 | 错误回答 | 正确理解 |
|---------|---------|---------|
| setState 是同步还是异步 | 异步 | 在合成事件中是批处理，setTimeout 中是同步 |
| key 的作用 | 消除警告 | 帮助 diff 算法识别节点 |
| useEffect 第二个参数空数组 | 只执行一次 | 模拟 componentDidMount，但不完全相同 |
| 函数组件每次渲染都创建新函数 | 是 | 是的，所以需要 useCallback |
| Redux 的 state 能直接修改吗 | 不能 | 必须返回新对象，保持不可变性 |

```javascript
// setState 批处理陷阱
this.setState({ count: this.state.count + 1 });
this.setState({ count: this.state.count + 1 });
// count 只增加 1，不是 2

// 正确做法
this.setState(prev => ({ count: prev.count + 1 }));
this.setState(prev => ({ count: prev.count + 1 }));

// useEffect 依赖陷阱
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1);  // 闭包问题，count 永远是初始值
  }, 1000);
  return () => clearInterval(timer);
}, []);

// 正确做法
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);  // 使用函数式更新
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

---

## 后端陷阱

### Java 基础

| 陷阱问题 | 错误回答 | 正确理解 |
|---------|---------|---------|
| String 是基本类型吗 | 是 | 不是，是引用类型 |
| == 和 equals 区别 | 一样 | == 比较引用，equals 比较内容 |
| Integer 缓存范围 | 没有缓存 | -128 到 127 缓存 |
| finally 一定会执行吗 | 一定 | System.exit() 或 JVM 崩溃时不会 |
| HashMap 线程安全吗 | 安全 | 不安全，需要 ConcurrentHashMap |

```java
// Integer 缓存陷阱
Integer a = 127;
Integer b = 127;
System.out.println(a == b);  // true

Integer c = 128;
Integer d = 128;
System.out.println(c == d);  // false

// String 陷阱
String s1 = "hello";
String s2 = "hello";
String s3 = new String("hello");
System.out.println(s1 == s2);  // true（字符串常量池）
System.out.println(s1 == s3);  // false
System.out.println(s1.equals(s3));  // true

// try-finally 陷阱
try {
    return 1;
} finally {
    return 2;  // 返回 2，finally 覆盖 try 的返回值
}
```

### Spring 相关

| 陷阱问题 | 错误回答 | 正确理解 |
|---------|---------|---------|
| @Transactional 失效场景 | 没有 | 自调用、非 public、异常类型不匹配等 |
| Bean 默认是单例吗 | 不是 | 是单例（singleton） |
| AOP 能拦截私有方法吗 | 可以 | Spring AOP 基于代理，不能拦截私有方法 |
| @Autowired 按什么注入 | 按名称 | 按类型，多个时按名称 |
| 循环依赖能解决吗 | 不能 | 构造器注入不行，setter 注入可以 |

```java
// @Transactional 自调用失效
@Service
public class UserService {
    public void methodA() {
        this.methodB();  // 事务不生效！
    }

    @Transactional
    public void methodB() {
        // ...
    }
}

// 解决方案
@Autowired
private UserService self;  // 注入自己

public void methodA() {
    self.methodB();  // 通过代理调用
}
```

### Python 相关

| 陷阱问题 | 错误回答 | 正确理解 |
|---------|---------|---------|
| 列表作为默认参数 | 每次调用创建新列表 | 同一个列表对象被复用 |
| is 和 == 区别 | 一样 | is 比较 id，== 比较值 |
| 多线程能利用多核吗 | 能 | GIL 限制，CPU 密集型用多进程 |
| 深拷贝和浅拷贝 | 一样 | 浅拷贝只复制一层，深拷贝递归复制 |
| 闭包中修改外部变量 | 直接修改 | 需要 nonlocal 声明 |

```python
# 默认参数陷阱
def append_to(element, to=[]):
    to.append(element)
    return to

append_to(1)  # [1]
append_to(2)  # [1, 2]  不是 [2]！

# 正确做法
def append_to(element, to=None):
    if to is None:
        to = []
    to.append(element)
    return to

# 整数缓存陷阱
a = 256
b = 256
print(a is b)  # True

a = 257
b = 257
print(a is b)  # False（可能，取决于实现）

# 闭包陷阱
def create_multipliers():
    return [lambda x: i * x for i in range(5)]

for m in create_multipliers():
    print(m(2))  # 全部输出 8，不是 0,2,4,6,8

# 正确做法
def create_multipliers():
    return [lambda x, i=i: i * x for i in range(5)]
```

---

## 数据库陷阱

### MySQL

| 陷阱问题 | 错误回答 | 正确理解 |
|---------|---------|---------|
| 索引越多越好 | 是 | 影响写入性能，增加存储空间 |
| NULL 能用索引吗 | 不能 | 可以，但语义复杂 |
| COUNT(*) 和 COUNT(1) | COUNT(1) 更快 | MySQL 优化后性能相同 |
| 事务开启就加锁吗 | 是 | 只有执行 SQL 时才加锁 |
| 外键保证数据一致性 | 总是能 | 需要选择合适的约束动作 |

```sql
-- NULL 值比较陷阱
SELECT * FROM users WHERE age = NULL;   -- 错误，返回空
SELECT * FROM users WHERE age IS NULL;  -- 正确

-- OR 导致索引失效
SELECT * FROM users WHERE name = 'Tom' OR age = 25;
-- 优化：分别查询后 UNION

-- 隐式类型转换
SELECT * FROM users WHERE phone = 13800138000;
-- phone 是 varchar，会导致全表扫描
-- 正确：WHERE phone = '13800138000'

-- LIMIT 深分页问题
SELECT * FROM orders ORDER BY id LIMIT 1000000, 10;
-- 优化：
SELECT * FROM orders WHERE id > 1000000 ORDER BY id LIMIT 10;
```

### Redis

| 陷阱问题 | 错误回答 | 正确理解 |
|---------|---------|---------|
| Redis 是单线程的 | 完全单线程 | 6.0+ 网络 I/O 多线程 |
| 持久化不会丢数据 | 不会 | RDB 有丢失风险，AOF 也可能丢 |
| 分布式锁用 SETNX | 足够了 | 需要过期时间、锁续期、释放验证 |
| 缓存击穿是什么 | 和穿透一样 | 穿透是查不存在的，击穿是热点过期 |
| Pipeline 能保证原子性 | 能 | 不能，只是批量发送 |

```python
# 分布式锁的正确实现
def acquire_lock(key, value, expire=10):
    # 原子操作：SET key value NX EX expire
    return redis.set(key, value, nx=True, ex=expire)

def release_lock(key, value):
    # Lua 脚本保证原子性
    script = """
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    """
    return redis.eval(script, 1, key, value)

# 常见错误：先 GET 再 DEL，不是原子操作
# if redis.get(key) == value:
#     redis.delete(key)  # 这两步之间可能被其他客户端修改
```

---

## 系统设计陷阱

| 陷阱问题 | 错误回答 | 正确理解 |
|---------|---------|---------|
| 微服务一定比单体好 | 是 | 取决于团队规模和业务复杂度 |
| 加机器就能解决性能问题 | 是 | 数据库往往是瓶颈 |
| 消息队列解决一切异步问题 | 是 | 引入复杂性、需要保证可靠性 |
| CAP 三个只能选两个 | 可以都要 | 分布式系统必须容忍分区，只能 CP 或 AP |
| 读写分离提升性能 | 总是能 | 需要考虑主从延迟 |

```
CAP 理论正确理解：

P（分区容错）是必须的，因为网络分区不可避免

所以实际选择是：
- CP：保证一致性，牺牲可用性（如 ZooKeeper）
- AP：保证可用性，牺牲强一致性（如 Cassandra）

BASE 理论：
- Basically Available（基本可用）
- Soft State（软状态）
- Eventually Consistent（最终一致）
```

---

## 面试技巧

### 遇到不会的问题

1. **承认不知道**：诚实比瞎猜好
2. **展示思路**：说明你会怎么去了解
3. **关联已知**：从相关知识推导

### 回答问题的结构

```
STAR 法则：
- Situation（情境）
- Task（任务）
- Action（行动）
- Result（结果）

技术问题回答：
1. 先给结论
2. 再解释原因
3. 举例说明
4. 延伸思考
```

### 常见追问

- "为什么这样设计？"
- "有什么缺点？"
- "还有其他方案吗？"
- "在你的项目中是怎么用的？"
- "遇到过什么问题？怎么解决的？"
