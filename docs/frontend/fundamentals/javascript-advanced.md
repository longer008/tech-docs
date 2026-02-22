# JavaScript 进阶与高级特性

> 更新时间：2025-02

## 目录导航

- [Proxy 与 Reflect](#proxy-与-reflect)
- [Symbol 符号类型](#symbol-符号类型)
- [Iterator 与 Generator](#iterator-与-generator)
- [函数式编程](#函数式编程)
- [设计模式](#设计模式)
- [性能优化](#性能优化)
- [内存管理](#内存管理)
- [模块化](#模块化)
- [Web Workers](#web-workers)
- [高级面试题](#高级面试题)

## Proxy 与 Reflect

### Proxy 代理对象

Proxy 用于创建一个对象的代理，从而实现对基本操作的拦截和自定义。

**基础用法**：

```javascript
// 创建代理对象
const target = {
  name: 'John',
  age: 25
}

const handler = {
  // 拦截属性读取
  get(target, prop, receiver) {
    console.log(`读取属性: ${prop}`)
    return Reflect.get(target, prop, receiver)
  },
  
  // 拦截属性设置
  set(target, prop, value, receiver) {
    console.log(`设置属性: ${prop} = ${value}`)
    return Reflect.set(target, prop, value, receiver)
  }
}

const proxy = new Proxy(target, handler)

proxy.name  // 输出: 读取属性: name
proxy.age = 26  // 输出: 设置属性: age = 26
```

**常用的 Proxy 拦截器**：

```javascript
const handler = {
  // 1. get - 拦截属性读取
  get(target, prop, receiver) {
    if (prop === 'secret') {
      return '*** 保密信息 ***'
    }
    return Reflect.get(target, prop, receiver)
  },
  
  // 2. set - 拦截属性设置
  set(target, prop, value, receiver) {
    if (prop === 'age' && typeof value !== 'number') {
      throw new TypeError('年龄必须是数字')
    }
    return Reflect.set(target, prop, value, receiver)
  },
  
  // 3. has - 拦截 in 操作符
  has(target, prop) {
    if (prop.startsWith('_')) {
      return false  // 隐藏私有属性
    }
    return prop in target
  },
  
  // 4. deleteProperty - 拦截 delete 操作
  deleteProperty(target, prop) {
    if (prop.startsWith('_')) {
      throw new Error('不能删除私有属性')
    }
    return Reflect.deleteProperty(target, prop)
  },
  
  // 5. ownKeys - 拦截 Object.keys()
  ownKeys(target) {
    return Reflect.ownKeys(target).filter(key => !key.startsWith('_'))
  },
  
  // 6. apply - 拦截函数调用
  apply(target, thisArg, args) {
    console.log(`调用函数，参数: ${args}`)
    return Reflect.apply(target, thisArg, args)
  },
  
  // 7. construct - 拦截 new 操作符
  construct(target, args) {
    console.log(`创建实例，参数: ${args}`)
    return Reflect.construct(target, args)
  }
}
```

**实战应用场景**：

**1. 数据验证**

```javascript
// 创建数据验证代理
function createValidator(target, validators) {
  return new Proxy(target, {
    set(target, prop, value) {
      const validator = validators[prop]
      if (validator && !validator(value)) {
        throw new Error(`${prop} 验证失败`)
      }
      return Reflect.set(target, prop, value)
    }
  })
}

// 使用示例
const user = createValidator({}, {
  name: value => typeof value === 'string' && value.length > 0,
  age: value => typeof value === 'number' && value >= 0 && value <= 150,
  email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
})

user.name = 'John'  // ✅ 通过
user.age = 25       // ✅ 通过
user.age = -1       // ❌ 抛出错误
user.email = 'invalid'  // ❌ 抛出错误
```

**2. 响应式数据（类似 Vue 3）**

```javascript
// 简化版响应式系统
function reactive(target) {
  const handlers = new Map()
  
  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      // 依赖收集
      track(target, prop)
      return Reflect.get(target, prop, receiver)
    },
    
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver)
      // 触发更新
      trigger(target, prop)
      return result
    }
  })
  
  function track(target, prop) {
    // 收集依赖逻辑
  }
  
  function trigger(target, prop) {
    // 触发更新逻辑
    const deps = handlers.get(prop)
    if (deps) {
      deps.forEach(handler => handler())
    }
  }
  
  return proxy
}

// 使用示例
const state = reactive({
  count: 0,
  message: 'Hello'
})

// 监听变化
watch(() => state.count, (newVal, oldVal) => {
  console.log(`count 从 ${oldVal} 变为 ${newVal}`)
})

state.count++  // 触发更新
```

**3. 私有属性**

```javascript
// 使用 Proxy 实现私有属性
function createPrivate(target) {
  return new Proxy(target, {
    get(target, prop) {
      if (prop.startsWith('_')) {
        throw new Error(`无法访问私有属性: ${prop}`)
      }
      return Reflect.get(target, prop)
    },
    
    set(target, prop, value) {
      if (prop.startsWith('_')) {
        throw new Error(`无法设置私有属性: ${prop}`)
      }
      return Reflect.set(target, prop, value)
    },
    
    has(target, prop) {
      if (prop.startsWith('_')) {
        return false
      }
      return Reflect.has(target, prop)
    },
    
    ownKeys(target) {
      return Reflect.ownKeys(target).filter(key => !key.startsWith('_'))
    }
  })
}

// 使用示例
const obj = createPrivate({
  name: 'John',
  _password: '123456'
})

console.log(obj.name)      // 'John'
console.log(obj._password) // 抛出错误
console.log('_password' in obj)  // false
console.log(Object.keys(obj))    // ['name']
```

**4. 负索引数组**

```javascript
// 支持负索引的数组（类似 Python）
function createNegativeArray(arr) {
  return new Proxy(arr, {
    get(target, prop) {
      const index = Number(prop)
      if (Number.isInteger(index) && index < 0) {
        return target[target.length + index]
      }
      return Reflect.get(target, prop)
    }
  })
}

// 使用示例
const arr = createNegativeArray([1, 2, 3, 4, 5])
console.log(arr[-1])  // 5（最后一个元素）
console.log(arr[-2])  // 4（倒数第二个元素）
```

### Reflect 反射

Reflect 提供了拦截 JavaScript 操作的方法，与 Proxy 的 handler 方法一一对应。

**Reflect 的优势**：

```javascript
// 1. 返回值更合理
// Object.defineProperty 失败会抛出错误
try {
  Object.defineProperty(obj, 'prop', { value: 1 })
} catch (e) {
  // 处理错误
}

// Reflect.defineProperty 失败返回 false
if (Reflect.defineProperty(obj, 'prop', { value: 1 })) {
  console.log('定义成功')
} else {
  console.log('定义失败')
}

// 2. 函数式编程风格
// 传统方式
'name' in obj
delete obj.name

// Reflect 方式
Reflect.has(obj, 'name')
Reflect.deleteProperty(obj, 'name')

// 3. 与 Proxy 配合使用
const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    // 使用 Reflect 保证正确的 this 绑定
    return Reflect.get(target, prop, receiver)
  }
})
```

**常用 Reflect 方法**：

```javascript
const obj = { name: 'John', age: 25 }

// 1. Reflect.get - 获取属性
Reflect.get(obj, 'name')  // 'John'

// 2. Reflect.set - 设置属性
Reflect.set(obj, 'age', 26)  // true

// 3. Reflect.has - 检查属性
Reflect.has(obj, 'name')  // true

// 4. Reflect.deleteProperty - 删除属性
Reflect.deleteProperty(obj, 'age')  // true

// 5. Reflect.ownKeys - 获取所有键
Reflect.ownKeys(obj)  // ['name']

// 6. Reflect.apply - 调用函数
function greet(greeting) {
  return `${greeting}, ${this.name}`
}
Reflect.apply(greet, obj, ['Hello'])  // 'Hello, John'

// 7. Reflect.construct - 创建实例
function Person(name) {
  this.name = name
}
const person = Reflect.construct(Person, ['John'])

// 8. Reflect.getPrototypeOf - 获取原型
Reflect.getPrototypeOf(obj)  // Object.prototype

// 9. Reflect.setPrototypeOf - 设置原型
Reflect.setPrototypeOf(obj, null)
```

## Symbol 符号类型

Symbol 是 ES6 引入的原始数据类型，表示独一无二的值。

**基础用法**：

```javascript
// 创建 Symbol
const sym1 = Symbol()
const sym2 = Symbol()
console.log(sym1 === sym2)  // false（每个 Symbol 都是唯一的）

// 带描述的 Symbol
const sym3 = Symbol('description')
console.log(sym3.toString())  // 'Symbol(description)'
console.log(sym3.description)  // 'description'

// Symbol.for - 全局注册
const sym4 = Symbol.for('global')
const sym5 = Symbol.for('global')
console.log(sym4 === sym5)  // true（相同 key 返回相同 Symbol）

// Symbol.keyFor - 获取全局 Symbol 的 key
console.log(Symbol.keyFor(sym4))  // 'global'
console.log(Symbol.keyFor(sym1))  // undefined（非全局 Symbol）
```

**应用场景**：

**1. 对象的唯一属性名**

```javascript
// 避免属性名冲突
const name = Symbol('name')
const age = Symbol('age')

const person = {
  [name]: 'John',
  [age]: 25,
  name: 'Public Name'  // 不会冲突
}

console.log(person[name])  // 'John'
console.log(person.name)   // 'Public Name'

// Symbol 属性不会被常规方法遍历
console.log(Object.keys(person))  // ['name']
console.log(Object.getOwnPropertyNames(person))  // ['name']

// 需要使用特殊方法获取 Symbol 属性
console.log(Object.getOwnPropertySymbols(person))  // [Symbol(name), Symbol(age)]
console.log(Reflect.ownKeys(person))  // ['name', Symbol(name), Symbol(age)]
```

**2. 私有属性模拟**

```javascript
// 使用 Symbol 创建私有属性
const _private = Symbol('private')

class MyClass {
  constructor() {
    this[_private] = '私有数据'
    this.public = '公开数据'
  }
  
  getPrivate() {
    return this[_private]
  }
}

const instance = new MyClass()
console.log(instance.public)  // '公开数据'
console.log(instance[_private])  // undefined（外部无法直接访问）
console.log(instance.getPrivate())  // '私有数据'
```

**3. 内置 Symbol**

```javascript
// Symbol.iterator - 定义对象的默认迭代器
const iterableObj = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let index = 0
    const data = this.data
    return {
      next() {
        if (index < data.length) {
          return { value: data[index++], done: false }
        }
        return { done: true }
      }
    }
  }
}

for (const item of iterableObj) {
  console.log(item)  // 1, 2, 3
}

// Symbol.toStringTag - 自定义对象的类型标签
class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyClass'
  }
}

const instance = new MyClass()
console.log(Object.prototype.toString.call(instance))  // '[object MyClass]'

// Symbol.hasInstance - 自定义 instanceof 行为
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance)
  }
}

console.log([] instanceof MyArray)  // true

// Symbol.toPrimitive - 自定义类型转换
const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') {
      return 42
    }
    if (hint === 'string') {
      return 'hello'
    }
    return true
  }
}

console.log(+obj)      // 42（转数字）
console.log(`${obj}`)  // 'hello'（转字符串）
console.log(obj + '')  // 'true'（默认）
```

## Iterator 与 Generator

### Iterator 迭代器

迭代器是一种接口，为各种不同的数据结构提供统一的访问机制。

**迭代器协议**：

```javascript
// 手动实现迭代器
function createIterator(array) {
  let index = 0
  
  return {
    next() {
      if (index < array.length) {
        return {
          value: array[index++],
          done: false
        }
      }
      return {
        value: undefined,
        done: true
      }
    }
  }
}

// 使用迭代器
const iterator = createIterator([1, 2, 3])
console.log(iterator.next())  // { value: 1, done: false }
console.log(iterator.next())  // { value: 2, done: false }
console.log(iterator.next())  // { value: 3, done: false }
console.log(iterator.next())  // { value: undefined, done: true }
```

**可迭代对象**：

```javascript
// 实现可迭代对象
const range = {
  from: 1,
  to: 5,
  
  [Symbol.iterator]() {
    let current = this.from
    const last = this.to
    
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false }
        }
        return { done: true }
      }
    }
  }
}

// 使用 for...of 遍历
for (const num of range) {
  console.log(num)  // 1, 2, 3, 4, 5
}

// 使用扩展运算符
console.log([...range])  // [1, 2, 3, 4, 5]

// 使用解构
const [first, second, ...rest] = range
console.log(first, second, rest)  // 1 2 [3, 4, 5]
```

### Generator 生成器

Generator 是一种特殊的函数，可以暂停执行并在需要时恢复。

**基础用法**：

```javascript
// 定义生成器函数
function* numberGenerator() {
  console.log('开始')
  yield 1
  console.log('继续')
  yield 2
  console.log('再继续')
  yield 3
  console.log('结束')
}

// 调用生成器函数返回生成器对象
const gen = numberGenerator()

console.log(gen.next())  // 开始 { value: 1, done: false }
console.log(gen.next())  // 继续 { value: 2, done: false }
console.log(gen.next())  // 再继续 { value: 3, done: false }
console.log(gen.next())  // 结束 { value: undefined, done: true }

// 使用 for...of 遍历生成器
for (const num of numberGenerator()) {
  console.log(num)  // 1, 2, 3
}
```

**Generator 的高级特性**：

```javascript
// 1. 向生成器传值
function* echo() {
  const input1 = yield '请输入第一个值'
  console.log('收到:', input1)
  
  const input2 = yield '请输入第二个值'
  console.log('收到:', input2)
  
  return '完成'
}

const gen = echo()
console.log(gen.next())        // { value: '请输入第一个值', done: false }
console.log(gen.next('Hello')) // 收到: Hello { value: '请输入第二个值', done: false }
console.log(gen.next('World')) // 收到: World { value: '完成', done: true }
```

```javascript
// 2. Generator 实现无限序列
function* fibonacci() {
  let [prev, curr] = [0, 1]
  while (true) {
    yield curr
    ;[prev, curr] = [curr, prev + curr]
  }
}

const fib = fibonacci()
console.log(fib.next().value)  // 1
console.log(fib.next().value)  // 1
console.log(fib.next().value)  // 2
console.log(fib.next().value)  // 3
console.log(fib.next().value)  // 5

// 3. Generator 实现异步流程控制
function* asyncFlow() {
  try {
    const user = yield fetchUser(1)
    console.log('用户:', user)
    
    const posts = yield fetchPosts(user.id)
    console.log('文章:', posts)
    
    const comments = yield fetchComments(posts[0].id)
    console.log('评论:', comments)
  } catch (error) {
    console.error('错误:', error)
  }
}

// 执行生成器（简化版 co 库）
function run(generator) {
  const gen = generator()
  
  function step(value) {
    const result = gen.next(value)
    
    if (result.done) {
      return result.value
    }
    
    // 假设 yield 的值是 Promise
    result.value.then(
      data => step(data),
      error => gen.throw(error)
    )
  }
  
  step()
}

run(asyncFlow)

// 4. yield* 委托给另一个生成器
function* gen1() {
  yield 1
  yield 2
}

function* gen2() {
  yield 'a'
  yield* gen1()  // 委托给 gen1
  yield 'b'
}

console.log([...gen2()])  // ['a', 1, 2, 'b']
```

**实战应用**：

```javascript
// 1. 实现 range 函数
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i
  }
}

console.log([...range(0, 10, 2)])  // [0, 2, 4, 6, 8]

// 2. 实现 take 函数（获取前 n 个元素）
function* take(iterable, n) {
  let count = 0
  for (const item of iterable) {
    if (count++ >= n) break
    yield item
  }
}

const fib = fibonacci()
console.log([...take(fib, 10)])  // 前 10 个斐波那契数

// 3. 实现 filter 函数
function* filter(iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item
    }
  }
}

const numbers = [1, 2, 3, 4, 5, 6]
const evenNumbers = filter(numbers, n => n % 2 === 0)
console.log([...evenNumbers])  // [2, 4, 6]

// 4. 实现 map 函数
function* map(iterable, mapper) {
  for (const item of iterable) {
    yield mapper(item)
  }
}

const doubled = map(numbers, n => n * 2)
console.log([...doubled])  // [2, 4, 6, 8, 10, 12]

// 5. 链式调用
const result = [...take(
  filter(
    map(range(0, 100), n => n * 2),
    n => n % 3 === 0
  ),
  5
)]
console.log(result)  // [0, 6, 12, 18, 24]
```

## 函数式编程

### 纯函数

纯函数是指相同的输入永远得到相同的输出，且没有副作用的函数。

```javascript
// ✅ 纯函数
function add(a, b) {
  return a + b
}

function multiply(arr, factor) {
  return arr.map(x => x * factor)
}

// ❌ 非纯函数（有副作用）
let count = 0
function increment() {
  count++  // 修改外部变量
  return count
}

function addRandom(a) {
  return a + Math.random()  // 输出不确定
}

function modifyArray(arr) {
  arr.push(1)  // 修改输入参数
  return arr
}
```

### 高阶函数

高阶函数是指接收函数作为参数或返回函数的函数。

```javascript
// 1. 接收函数作为参数
function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i)
  }
}

repeat(3, console.log)  // 0 1 2

// 2. 返回函数
function multiplier(factor) {
  return function(number) {
    return number * factor
  }
}

const double = multiplier(2)
const triple = multiplier(3)

console.log(double(5))  // 10
console.log(triple(5))  // 15

// 3. 常用高阶函数
const numbers = [1, 2, 3, 4, 5]

// map - 映射
const doubled = numbers.map(n => n * 2)

// filter - 过滤
const evens = numbers.filter(n => n % 2 === 0)

// reduce - 归约
const sum = numbers.reduce((acc, n) => acc + n, 0)

// some - 是否存在满足条件的元素
const hasEven = numbers.some(n => n % 2 === 0)

// every - 是否所有元素都满足条件
const allPositive = numbers.every(n => n > 0)

// find - 查找第一个满足条件的元素
const firstEven = numbers.find(n => n % 2 === 0)

// findIndex - 查找第一个满足条件的元素的索引
const firstEvenIndex = numbers.findIndex(n => n % 2 === 0)
```

### 柯里化（Currying）

柯里化是把接受多个参数的函数变换成接受一个单一参数的函数，并返回接受余下参数的新函数。

```javascript
// 普通函数
function add(a, b, c) {
  return a + b + c
}

console.log(add(1, 2, 3))  // 6

// 柯里化版本
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c
    }
  }
}

console.log(curriedAdd(1)(2)(3))  // 6

// 箭头函数简化
const curriedAdd2 = a => b => c => a + b + c
console.log(curriedAdd2(1)(2)(3))  // 6

// 通用柯里化函数
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs))
    }
  }
}

// 使用示例
const add3 = (a, b, c) => a + b + c
const curriedAdd3 = curry(add3)

console.log(curriedAdd3(1)(2)(3))     // 6
console.log(curriedAdd3(1, 2)(3))     // 6
console.log(curriedAdd3(1)(2, 3))     // 6
console.log(curriedAdd3(1, 2, 3))     // 6
```

**柯里化的应用**：

```javascript
// 1. 参数复用
const curriedFetch = curry((method, url, data) => {
  return fetch(url, { method, body: JSON.stringify(data) })
})

const get = curriedFetch('GET')
const post = curriedFetch('POST')

get('/api/users')
post('/api/users', { name: 'John' })

// 2. 延迟执行
const log = curry((level, message, data) => {
  console.log(`[${level}] ${message}`, data)
})

const logError = log('ERROR')
const logInfo = log('INFO')

logError('数据库连接失败', { code: 500 })
logInfo('用户登录成功', { userId: 123 })

// 3. 动态创建函数
const match = curry((regex, str) => regex.test(str))
const hasNumber = match(/[0-9]+/)
const hasLetter = match(/[a-zA-Z]+/)

console.log(hasNumber('abc123'))  // true
console.log(hasLetter('123'))     // false
```

### 函数组合（Compose）

函数组合是将多个函数组合成一个函数，从右到左执行。

```javascript
// 基础组合
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x)

// 使用示例
const add1 = x => x + 1
const multiply2 = x => x * 2
const subtract3 = x => x - 3

const calculate = compose(subtract3, multiply2, add1)
console.log(calculate(5))  // (5 + 1) * 2 - 3 = 9

// pipe（从左到右执行）
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x)

const calculate2 = pipe(add1, multiply2, subtract3)
console.log(calculate2(5))  // (5 + 1) * 2 - 3 = 9

// 实战示例：数据处理管道
const users = [
  { name: 'John', age: 25, active: true },
  { name: 'Jane', age: 30, active: false },
  { name: 'Bob', age: 35, active: true }
]

const getActiveUsers = users => users.filter(u => u.active)
const getUserNames = users => users.map(u => u.name)
const sortNames = names => names.sort()
const joinNames = names => names.join(', ')

const processUsers = pipe(
  getActiveUsers,
  getUserNames,
  sortNames,
  joinNames
)

console.log(processUsers(users))  // 'Bob, John'
```

### 偏函数（Partial Application）

偏函数是固定函数的部分参数，返回一个新函数。

```javascript
// 实现偏函数
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs)
  }
}

// 使用示例
function greet(greeting, name) {
  return `${greeting}, ${name}!`
}

const sayHello = partial(greet, 'Hello')
const sayHi = partial(greet, 'Hi')

console.log(sayHello('John'))  // 'Hello, John!'
console.log(sayHi('Jane'))     // 'Hi, Jane!'

// 实战：日志函数
function log(level, module, message) {
  console.log(`[${level}] [${module}] ${message}`)
}

const errorLog = partial(log, 'ERROR')
const userErrorLog = partial(errorLog, 'User')
const dbErrorLog = partial(errorLog, 'Database')

userErrorLog('登录失败')      // [ERROR] [User] 登录失败
dbErrorLog('连接超时')        // [ERROR] [Database] 连接超时
```

## 设计模式

### 单例模式

确保一个类只有一个实例，并提供全局访问点。

```javascript
// 1. 基础单例
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance
    }
    Singleton.instance = this
    this.data = []
  }
  
  getData() {
    return this.data
  }
  
  setData(data) {
    this.data = data
  }
}

const instance1 = new Singleton()
const instance2 = new Singleton()
console.log(instance1 === instance2)  // true

// 2. 闭包实现单例
const Singleton2 = (function() {
  let instance
  
  function createInstance() {
    return {
      data: [],
      getData() { return this.data },
      setData(data) { this.data = data }
    }
  }
  
  return {
    getInstance() {
      if (!instance) {
        instance = createInstance()
      }
      return instance
    }
  }
})()

const inst1 = Singleton2.getInstance()
const inst2 = Singleton2.getInstance()
console.log(inst1 === inst2)  // true

// 3. 实战：全局状态管理
class Store {
  constructor() {
    if (Store.instance) {
      return Store.instance
    }
    this.state = {}
    this.listeners = []
    Store.instance = this
  }
  
  getState() {
    return this.state
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState }
    this.listeners.forEach(listener => listener(this.state))
  }
  
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
}

const store = new Store()
store.subscribe(state => console.log('状态更新:', state))
store.setState({ count: 1 })
```

### 工厂模式

提供创建对象的接口，让子类决定实例化哪个类。

```javascript
// 1. 简单工厂
class User {
  constructor(name, role) {
    this.name = name
    this.role = role
  }
}

class UserFactory {
  static createUser(name, role) {
    switch (role) {
      case 'admin':
        return new User(name, 'admin')
      case 'user':
        return new User(name, 'user')
      case 'guest':
        return new User(name, 'guest')
      default:
        throw new Error('无效的角色')
    }
  }
}

const admin = UserFactory.createUser('John', 'admin')
const user = UserFactory.createUser('Jane', 'user')

// 2. 工厂方法模式
class Product {
  constructor(name) {
    this.name = name
  }
}

class ConcreteProductA extends Product {
  constructor() {
    super('Product A')
  }
}

class ConcreteProductB extends Product {
  constructor() {
    super('Product B')
  }
}

class Creator {
  createProduct() {
    throw new Error('必须实现 createProduct 方法')
  }
}

class ConcreteCreatorA extends Creator {
  createProduct() {
    return new ConcreteProductA()
  }
}

class ConcreteCreatorB extends Creator {
  createProduct() {
    return new ConcreteProductB()
  }
}

// 3. 实战：HTTP 请求工厂
class HttpRequest {
  constructor(url) {
    this.url = url
  }
  
  send() {
    throw new Error('必须实现 send 方法')
  }
}

class GetRequest extends HttpRequest {
  send() {
    return fetch(this.url, { method: 'GET' })
  }
}

class PostRequest extends HttpRequest {
  constructor(url, data) {
    super(url)
    this.data = data
  }
  
  send() {
    return fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(this.data)
    })
  }
}

class RequestFactory {
  static create(type, url, data) {
    switch (type) {
      case 'GET':
        return new GetRequest(url)
      case 'POST':
        return new PostRequest(url, data)
      default:
        throw new Error('不支持的请求类型')
    }
  }
}

const getReq = RequestFactory.create('GET', '/api/users')
const postReq = RequestFactory.create('POST', '/api/users', { name: 'John' })
```

### 观察者模式

定义对象间的一对多依赖关系，当一个对象状态改变时，所有依赖它的对象都会收到通知。

```javascript
// 观察者模式实现
class Subject {
  constructor() {
    this.observers = []
  }
  
  // 添加观察者
  attach(observer) {
    this.observers.push(observer)
  }
  
  // 移除观察者
  detach(observer) {
    this.observers = this.observers.filter(obs => obs !== observer)
  }
  
  // 通知所有观察者
  notify(data) {
    this.observers.forEach(observer => observer.update(data))
  }
}

class Observer {
  constructor(name) {
    this.name = name
  }
  
  update(data) {
    console.log(`${this.name} 收到更新:`, data)
  }
}

// 使用示例
const subject = new Subject()
const observer1 = new Observer('观察者1')
const observer2 = new Observer('观察者2')

subject.attach(observer1)
subject.attach(observer2)

subject.notify({ message: 'Hello' })
// 观察者1 收到更新: { message: 'Hello' }
// 观察者2 收到更新: { message: 'Hello' }

subject.detach(observer1)
subject.notify({ message: 'World' })
// 观察者2 收到更新: { message: 'World' }
```

### 发布-订阅模式

发布者和订阅者通过事件中心解耦，不直接通信。

```javascript
// 发布-订阅模式实现
class EventEmitter {
  constructor() {
    this.events = {}
  }
  
  // 订阅事件
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    
    // 返回取消订阅函数
    return () => this.off(event, callback)
  }
  
  // 订阅一次
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
  }
  
  // 取消订阅
  off(event, callback) {
    if (!this.events[event]) return
    
    if (callback) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    } else {
      delete this.events[event]
    }
  }
  
  // 发布事件
  emit(event, ...args) {
    if (!this.events[event]) return
    
    this.events[event].forEach(callback => {
      callback(...args)
    })
  }
}

// 使用示例
const emitter = new EventEmitter()

// 订阅事件
const unsubscribe = emitter.on('userLogin', (user) => {
  console.log('用户登录:', user)
})

emitter.on('userLogin', (user) => {
  console.log('记录日志:', user)
})

// 发布事件
emitter.emit('userLogin', { name: 'John', id: 1 })
// 用户登录: { name: 'John', id: 1 }
// 记录日志: { name: 'John', id: 1 }

// 取消订阅
unsubscribe()

// 订阅一次
emitter.once('userLogout', (user) => {
  console.log('用户登出:', user)
})

emitter.emit('userLogout', { name: 'John' })  // 触发
emitter.emit('userLogout', { name: 'John' })  // 不触发
```

### 策略模式

定义一系列算法，把它们封装起来，并使它们可以互相替换。

```javascript
// 策略模式实现
class Strategy {
  execute() {
    throw new Error('必须实现 execute 方法')
  }
}

class ConcreteStrategyA extends Strategy {
  execute(data) {
    return data.map(x => x * 2)
  }
}

class ConcreteStrategyB extends Strategy {
  execute(data) {
    return data.filter(x => x % 2 === 0)
  }
}

class Context {
  constructor(strategy) {
    this.strategy = strategy
  }
  
  setStrategy(strategy) {
    this.strategy = strategy
  }
  
  executeStrategy(data) {
    return this.strategy.execute(data)
  }
}

// 使用示例
const data = [1, 2, 3, 4, 5]
const context = new Context(new ConcreteStrategyA())
console.log(context.executeStrategy(data))  // [2, 4, 6, 8, 10]

context.setStrategy(new ConcreteStrategyB())
console.log(context.executeStrategy(data))  // [2, 4]

// 实战：表单验证
const validators = {
  required: (value) => {
    return value !== '' && value !== null && value !== undefined
  },
  email: (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  minLength: (min) => (value) => {
    return value.length >= min
  },
  maxLength: (max) => (value) => {
    return value.length <= max
  },
  pattern: (regex) => (value) => {
    return regex.test(value)
  }
}

class FormValidator {
  constructor() {
    this.rules = {}
  }
  
  addRule(field, validatorName, ...args) {
    if (!this.rules[field]) {
      this.rules[field] = []
    }
    
    const validator = validators[validatorName]
    if (typeof validator === 'function') {
      // 如果验证器需要参数，先调用获取实际验证函数
      const validatorFn = args.length > 0 ? validator(...args) : validator
      this.rules[field].push({
        name: validatorName,
        validate: validatorFn
      })
    }
  }
  
  validate(data) {
    const errors = {}
    
    for (const field in this.rules) {
      const value = data[field]
      const fieldRules = this.rules[field]
      
      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          if (!errors[field]) {
            errors[field] = []
          }
          errors[field].push(`${rule.name} 验证失败`)
        }
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// 使用表单验证
const validator = new FormValidator()
validator.addRule('email', 'required')
validator.addRule('email', 'email')
validator.addRule('password', 'required')
validator.addRule('password', 'minLength', 6)

const result = validator.validate({
  email: 'invalid-email',
  password: '123'
})

console.log(result)
// {
//   valid: false,
//   errors: {
//     email: ['email 验证失败'],
//     password: ['minLength 验证失败']
//   }
// }
```

## 性能优化

### 防抖（Debounce）

防抖是指在事件触发后延迟执行，如果在延迟期间再次触发，则重新计时。

```javascript
// 防抖实现
function debounce(func, delay) {
  let timer = null
  
  return function(...args) {
    // 清除之前的定时器
    clearTimeout(timer)
    
    // 设置新的定时器
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// 使用示例：搜索输入
const searchInput = document.querySelector('#search')
const handleSearch = debounce((e) => {
  console.log('搜索:', e.target.value)
  // 发送 API 请求
}, 500)

searchInput.addEventListener('input', handleSearch)

// 立即执行版本
function debounceImmediate(func, delay) {
  let timer = null
  
  return function(...args) {
    const callNow = !timer
    
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
    }, delay)
    
    if (callNow) {
      func.apply(this, args)
    }
  }
}
```

### 节流（Throttle）

节流是指在固定时间内只执行一次函数。

```javascript
// 节流实现（时间戳版本）
function throttle(func, delay) {
  let lastTime = 0
  
  return function(...args) {
    const now = Date.now()
    
    if (now - lastTime >= delay) {
      func.apply(this, args)
      lastTime = now
    }
  }
}

// 节流实现（定时器版本）
function throttle2(func, delay) {
  let timer = null
  
  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        func.apply(this, args)
        timer = null
      }, delay)
    }
  }
}

// 使用示例：滚动事件
const handleScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY)
}, 200)

window.addEventListener('scroll', handleScroll)

// 完整版本（支持首次立即执行和尾部执行）
function throttleComplete(func, delay, options = {}) {
  let timer = null
  let lastTime = 0
  const { leading = true, trailing = true } = options
  
  return function(...args) {
    const now = Date.now()
    
    // 首次不执行
    if (!leading && !lastTime) {
      lastTime = now
    }
    
    const remaining = delay - (now - lastTime)
    
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      
      lastTime = now
      func.apply(this, args)
    } else if (!timer && trailing) {
      timer = setTimeout(() => {
        lastTime = leading ? Date.now() : 0
        timer = null
        func.apply(this, args)
      }, remaining)
    }
  }
}
```

### 虚拟滚动

虚拟滚动用于优化大列表渲染性能，只渲染可见区域的元素。

```javascript
// 虚拟滚动实现
class VirtualScroll {
  constructor(options) {
    this.container = options.container
    this.itemHeight = options.itemHeight
    this.data = options.data
    this.renderItem = options.renderItem
    
    this.visibleCount = Math.ceil(this.container.clientHeight / this.itemHeight)
    this.startIndex = 0
    this.endIndex = this.visibleCount
    
    this.init()
  }
  
  init() {
    // 创建容器
    this.scrollContainer = document.createElement('div')
    this.scrollContainer.style.height = `${this.data.length * this.itemHeight}px`
    this.scrollContainer.style.position = 'relative'
    
    this.contentContainer = document.createElement('div')
    this.contentContainer.style.position = 'absolute'
    this.contentContainer.style.top = '0'
    this.contentContainer.style.left = '0'
    this.contentContainer.style.right = '0'
    
    this.scrollContainer.appendChild(this.contentContainer)
    this.container.appendChild(this.scrollContainer)
    
    // 监听滚动
    this.container.addEventListener('scroll', () => this.handleScroll())
    
    // 初始渲染
    this.render()
  }
  
  handleScroll() {
    const scrollTop = this.container.scrollTop
    this.startIndex = Math.floor(scrollTop / this.itemHeight)
    this.endIndex = this.startIndex + this.visibleCount
    
    this.render()
  }
  
  render() {
    const visibleData = this.data.slice(this.startIndex, this.endIndex + 1)
    
    this.contentContainer.innerHTML = ''
    this.contentContainer.style.transform = `translateY(${this.startIndex * this.itemHeight}px)`
    
    visibleData.forEach((item, index) => {
      const element = this.renderItem(item, this.startIndex + index)
      element.style.height = `${this.itemHeight}px`
      this.contentContainer.appendChild(element)
    })
  }
}

// 使用示例
const data = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  text: `Item ${i}`
}))

const virtualScroll = new VirtualScroll({
  container: document.querySelector('#list-container'),
  itemHeight: 50,
  data: data,
  renderItem: (item) => {
    const div = document.createElement('div')
    div.textContent = item.text
    div.style.borderBottom = '1px solid #ccc'
    return div
  }
})
```

### 懒加载

懒加载用于延迟加载资源，提升首屏加载速度。

```javascript
// 图片懒加载
class LazyLoad {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.01,
      ...options
    }
    
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.options
    )
  }
  
  observe(elements) {
    elements.forEach(el => this.observer.observe(el))
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const src = img.dataset.src
        
        if (src) {
          img.src = src
          img.removeAttribute('data-src')
          this.observer.unobserve(img)
        }
      }
    })
  }
}

// 使用示例
const lazyLoad = new LazyLoad({
  rootMargin: '50px'  // 提前 50px 开始加载
})

const images = document.querySelectorAll('img[data-src]')
lazyLoad.observe(images)

// 模块懒加载
async function loadModule(moduleName) {
  try {
    const module = await import(`./modules/${moduleName}.js`)
    return module
  } catch (error) {
    console.error('模块加载失败:', error)
  }
}

// 使用示例
document.querySelector('#load-chart').addEventListener('click', async () => {
  const chartModule = await loadModule('chart')
  chartModule.renderChart()
})
```

## 内存管理

### 内存泄漏

常见的内存泄漏场景及解决方案。

```javascript
// 1. 全局变量
// ❌ 错误：意外创建全局变量
function createGlobal() {
  leak = 'I am a global variable'  // 忘记使用 var/let/const
}

// ✅ 正确：使用严格模式
'use strict'
function createLocal() {
  const local = 'I am a local variable'
}

// 2. 定时器未清除
// ❌ 错误：定时器未清除
const timer = setInterval(() => {
  console.log('Running...')
}, 1000)

// ✅ 正确：清除定时器
const timer2 = setInterval(() => {
  console.log('Running...')
}, 1000)

// 在适当时机清除
clearInterval(timer2)

// 3. 事件监听器未移除
// ❌ 错误：事件监听器未移除
const button = document.querySelector('#button')
button.addEventListener('click', handleClick)

// ✅ 正确：移除事件监听器
button.removeEventListener('click', handleClick)

// 或使用 AbortController
const controller = new AbortController()
button.addEventListener('click', handleClick, { signal: controller.signal })
// 取消所有监听器
controller.abort()
```

```javascript
// 4. 闭包引用
// ❌ 错误：闭包持有大对象引用
function createClosure() {
  const largeData = new Array(1000000).fill('data')
  
  return function() {
    // 即使不使用 largeData，它也会被保留在内存中
    console.log('Hello')
  }
}

// ✅ 正确：只保留需要的数据
function createClosure2() {
  const largeData = new Array(1000000).fill('data')
  const summary = largeData.length  // 只保留摘要信息
  
  return function() {
    console.log('Length:', summary)
  }
}

// 5. DOM 引用
// ❌ 错误：保留已删除 DOM 的引用
const elements = []
function addElement() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  elements.push(div)  // 保留引用
}

function removeElement() {
  const div = elements.pop()
  div.remove()  // DOM 已删除，但 elements 数组仍持有引用
}

// ✅ 正确：使用 WeakMap 或及时清理引用
const elementsMap = new WeakMap()
function addElement2() {
  const div = document.createElement('div')
  document.body.appendChild(div)
  elementsMap.set(div, { data: 'some data' })
}

// 6. 循环引用
// ❌ 错误：循环引用
function createCircular() {
  const obj1 = {}
  const obj2 = {}
  obj1.ref = obj2
  obj2.ref = obj1  // 循环引用
  return obj1
}

// ✅ 正确：使用 WeakMap 避免循环引用
const weakMap = new WeakMap()
function createNonCircular() {
  const obj1 = {}
  const obj2 = {}
  weakMap.set(obj1, obj2)
  return obj1
}
```

### WeakMap 和 WeakSet

WeakMap 和 WeakSet 的键是弱引用，不会阻止垃圾回收。

```javascript
// WeakMap 示例
const weakMap = new WeakMap()
let obj = { name: 'John' }

weakMap.set(obj, 'some value')
console.log(weakMap.get(obj))  // 'some value'

// 当 obj 被设置为 null 后，WeakMap 中的条目会被自动回收
obj = null

// WeakSet 示例
const weakSet = new WeakSet()
let obj2 = { id: 1 }

weakSet.add(obj2)
console.log(weakSet.has(obj2))  // true

obj2 = null  // 对象会被自动回收

// 实战：缓存系统
class Cache {
  constructor() {
    this.cache = new WeakMap()
  }
  
  set(key, value) {
    this.cache.set(key, value)
  }
  
  get(key) {
    return this.cache.get(key)
  }
  
  has(key) {
    return this.cache.has(key)
  }
}

// 使用示例
const cache = new Cache()
let user = { id: 1, name: 'John' }

cache.set(user, { posts: [], comments: [] })
console.log(cache.get(user))

// 当 user 不再使用时，缓存会自动清理
user = null
```

## 模块化

### ES Modules

ES6 引入的官方模块系统。

```javascript
// 导出（export）
// 1. 命名导出
export const name = 'John'
export function greet() {
  console.log('Hello')
}
export class Person {
  constructor(name) {
    this.name = name
  }
}

// 2. 批量导出
const age = 25
const city = 'Beijing'
export { age, city }

// 3. 重命名导出
const privateVar = 'secret'
export { privateVar as publicVar }

// 4. 默认导出（每个模块只能有一个）
export default function() {
  console.log('Default export')
}

// 或
export default class MyClass {}

// 导入（import）
// 1. 命名导入
import { name, greet } from './module.js'

// 2. 重命名导入
import { name as userName } from './module.js'

// 3. 导入所有
import * as module from './module.js'
console.log(module.name)
module.greet()

// 4. 导入默认导出
import MyClass from './module.js'

// 5. 混合导入
import MyClass, { name, greet } from './module.js'

// 6. 动态导入
async function loadModule() {
  const module = await import('./module.js')
  module.greet()
}

// 或使用 then
import('./module.js').then(module => {
  module.greet()
})

// 7. 仅执行模块（不导入任何内容）
import './module.js'
```

### CommonJS

Node.js 使用的模块系统。

```javascript
// 导出（module.exports）
// 1. 导出对象
module.exports = {
  name: 'John',
  greet() {
    console.log('Hello')
  }
}

// 2. 导出单个值
module.exports = function() {
  console.log('Function export')
}

// 3. 使用 exports（exports 是 module.exports 的引用）
exports.name = 'John'
exports.greet = function() {
  console.log('Hello')
}

// ⚠️ 注意：不能直接给 exports 赋值
// exports = { name: 'John' }  // ❌ 错误
// module.exports = { name: 'John' }  // ✅ 正确

// 导入（require）
const module1 = require('./module')
const { name, greet } = require('./module')

// 动态导入
const moduleName = './module'
const module2 = require(moduleName)

// 缓存机制
const module3 = require('./module')  // 首次加载
const module4 = require('./module')  // 从缓存读取
console.log(module3 === module4)  // true

// 清除缓存
delete require.cache[require.resolve('./module')]
```

### ES Modules vs CommonJS

```javascript
// 主要区别

// 1. 加载时机
// ES Modules：编译时加载（静态加载）
import { name } from './module.js'  // 在代码执行前就确定依赖关系

// CommonJS：运行时加载（动态加载）
const { name } = require('./module')  // 在代码执行时才加载

// 2. 导出方式
// ES Modules：值的引用
// module.js
export let count = 0
export function increment() {
  count++
}

// main.js
import { count, increment } from './module.js'
console.log(count)  // 0
increment()
console.log(count)  // 1（引用，会更新）

// CommonJS：值的拷贝
// module.js
let count = 0
function increment() {
  count++
}
module.exports = { count, increment }

// main.js
const { count, increment } = require('./module')
console.log(count)  // 0
increment()
console.log(count)  // 0（拷贝，不会更新）

// 3. this 指向
// ES Modules：undefined
console.log(this)  // undefined

// CommonJS：module.exports
console.log(this === module.exports)  // true

// 4. 循环依赖
// ES Modules：可以处理循环依赖
// a.js
import { b } from './b.js'
export const a = 'a'
console.log(b)

// b.js
import { a } from './a.js'
export const b = 'b'
console.log(a)  // undefined（还未初始化）

// CommonJS：可能导致问题
// a.js
const { b } = require('./b')
exports.a = 'a'
console.log(b)

// b.js
const { a } = require('./a')
exports.b = 'b'
console.log(a)  // undefined
```

## Web Workers

Web Workers 允许在后台线程中运行 JavaScript，不阻塞主线程。

### 基础用法

```javascript
// 主线程（main.js）
// 创建 Worker
const worker = new Worker('worker.js')

// 发送消息给 Worker
worker.postMessage({ type: 'start', data: [1, 2, 3, 4, 5] })

// 接收 Worker 的消息
worker.onmessage = (event) => {
  console.log('收到结果:', event.data)
}

// 处理错误
worker.onerror = (error) => {
  console.error('Worker 错误:', error.message)
}

// 终止 Worker
worker.terminate()

// Worker 线程（worker.js）
// 接收主线程的消息
self.onmessage = (event) => {
  const { type, data } = event.data
  
  if (type === 'start') {
    // 执行耗时计算
    const result = data.reduce((sum, num) => sum + num, 0)
    
    // 发送结果给主线程
    self.postMessage({ type: 'result', data: result })
  }
}

// 或使用 addEventListener
self.addEventListener('message', (event) => {
  console.log('收到消息:', event.data)
})
```

### 实战应用

```javascript
// 1. 大数据处理
// main.js
const worker = new Worker('data-processor.js')

const largeData = Array.from({ length: 1000000 }, (_, i) => i)

worker.postMessage({
  action: 'process',
  data: largeData
})

worker.onmessage = (event) => {
  console.log('处理完成:', event.data)
}

// data-processor.js
self.onmessage = (event) => {
  const { action, data } = event.data
  
  if (action === 'process') {
    // 执行复杂计算
    const result = data
      .filter(n => n % 2 === 0)
      .map(n => n * 2)
      .reduce((sum, n) => sum + n, 0)
    
    self.postMessage(result)
  }
}

// 2. 图片处理
// main.js
const imageWorker = new Worker('image-processor.js')

const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

imageWorker.postMessage({
  action: 'grayscale',
  imageData: imageData
}, [imageData.data.buffer])  // 转移所有权，提高性能

imageWorker.onmessage = (event) => {
  ctx.putImageData(event.data, 0, 0)
}

// image-processor.js
self.onmessage = (event) => {
  const { action, imageData } = event.data
  
  if (action === 'grayscale') {
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = avg      // R
      data[i + 1] = avg  // G
      data[i + 2] = avg  // B
    }
    
    self.postMessage(imageData, [imageData.data.buffer])
  }
}

// 3. 定时任务
// main.js
const timerWorker = new Worker('timer-worker.js')

timerWorker.postMessage({ action: 'start', interval: 1000 })

timerWorker.onmessage = (event) => {
  console.log('定时器触发:', event.data)
}

// timer-worker.js
let timer = null

self.onmessage = (event) => {
  const { action, interval } = event.data
  
  if (action === 'start') {
    timer = setInterval(() => {
      self.postMessage({ time: Date.now() })
    }, interval)
  } else if (action === 'stop') {
    clearInterval(timer)
  }
}
```

### Shared Worker

Shared Worker 可以被多个页面共享。

```javascript
// 主页面
const sharedWorker = new SharedWorker('shared-worker.js')

// 发送消息
sharedWorker.port.postMessage({ type: 'connect', id: 'page1' })

// 接收消息
sharedWorker.port.onmessage = (event) => {
  console.log('收到消息:', event.data)
}

// shared-worker.js
const connections = []

self.onconnect = (event) => {
  const port = event.ports[0]
  connections.push(port)
  
  port.onmessage = (event) => {
    const { type, id } = event.data
    
    if (type === 'connect') {
      console.log('新连接:', id)
      
      // 广播给所有连接
      connections.forEach(conn => {
        conn.postMessage({ type: 'broadcast', message: `${id} 已连接` })
      })
    }
  }
}
```

## 高级面试题

### 1. 实现一个深拷贝函数

```javascript
function deepClone(obj, hash = new WeakMap()) {
  // 处理 null 和非对象类型
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  // 处理日期
  if (obj instanceof Date) {
    return new Date(obj)
  }
  
  // 处理正则
  if (obj instanceof RegExp) {
    return new RegExp(obj)
  }
  
  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj)
  }
  
  // 创建新对象
  const cloneObj = Array.isArray(obj) ? [] : {}
  hash.set(obj, cloneObj)
  
  // 处理 Symbol 键
  const symKeys = Object.getOwnPropertySymbols(obj)
  if (symKeys.length) {
    symKeys.forEach(symKey => {
      cloneObj[symKey] = deepClone(obj[symKey], hash)
    })
  }
  
  // 递归拷贝
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash)
    }
  }
  
  return cloneObj
}

// 测试
const obj = {
  name: 'John',
  age: 25,
  hobbies: ['reading', 'coding'],
  address: {
    city: 'Beijing',
    country: 'China'
  },
  date: new Date(),
  regex: /test/g,
  [Symbol('id')]: 123
}

obj.self = obj  // 循环引用

const cloned = deepClone(obj)
console.log(cloned)
console.log(cloned === obj)  // false
console.log(cloned.self === cloned)  // true
```

### 2. 实现 Promise.all

```javascript
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('参数必须是数组'))
    }
    
    const results = []
    let completedCount = 0
    const total = promises.length
    
    if (total === 0) {
      return resolve(results)
    }
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        value => {
          results[index] = value
          completedCount++
          
          if (completedCount === total) {
            resolve(results)
          }
        },
        reason => {
          reject(reason)
        }
      )
    })
  })
}

// 测试
Promise.myAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => {
  console.log(results)  // [1, 2, 3]
})
```

### 3. 实现 Promise.race

```javascript
Promise.myRace = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('参数必须是数组'))
    }
    
    promises.forEach(promise => {
      Promise.resolve(promise).then(resolve, reject)
    })
  })
}

// 测试
Promise.myRace([
  new Promise(resolve => setTimeout(() => resolve(1), 100)),
  new Promise(resolve => setTimeout(() => resolve(2), 50)),
  new Promise(resolve => setTimeout(() => resolve(3), 200))
]).then(result => {
  console.log(result)  // 2
})
```

### 4. 实现 async/await

```javascript
// 使用 Generator 实现 async/await
function asyncToGenerator(generatorFunc) {
  return function(...args) {
    const gen = generatorFunc.apply(this, args)
    
    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let result
        
        try {
          result = gen[key](arg)
        } catch (error) {
          return reject(error)
        }
        
        const { value, done } = result
        
        if (done) {
          return resolve(value)
        }
        
        return Promise.resolve(value).then(
          val => step('next', val),
          err => step('throw', err)
        )
      }
      
      step('next')
    })
  }
}

// 使用示例
function* fetchData() {
  try {
    const user = yield fetch('/api/user').then(r => r.json())
    const posts = yield fetch(`/api/posts/${user.id}`).then(r => r.json())
    return { user, posts }
  } catch (error) {
    console.error(error)
  }
}

const asyncFetchData = asyncToGenerator(fetchData)
asyncFetchData().then(data => console.log(data))
```

### 5. 实现 EventEmitter

```javascript
class EventEmitter {
  constructor() {
    this.events = {}
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
    return this
  }
  
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
    return this
  }
  
  off(event, callback) {
    if (!this.events[event]) return this
    
    if (callback) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    } else {
      delete this.events[event]
    }
    return this
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return this
    
    this.events[event].forEach(callback => {
      callback(...args)
    })
    return this
  }
}

// 测试
const emitter = new EventEmitter()

emitter.on('test', (data) => {
  console.log('事件1:', data)
})

emitter.once('test', (data) => {
  console.log('事件2（只触发一次）:', data)
})

emitter.emit('test', 'Hello')  // 事件1: Hello, 事件2（只触发一次）: Hello
emitter.emit('test', 'World')  // 事件1: World
```

### 6. 实现 LRU 缓存

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }
  
  get(key) {
    if (!this.cache.has(key)) {
      return -1
    }
    
    // 更新访问顺序
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    
    return value
  }
  
  put(key, value) {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    
    // 添加新值
    this.cache.set(key, value)
    
    // 超出容量，删除最久未使用的
    if (this.cache.size > this.capacity) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }
}

// 测试
const cache = new LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
console.log(cache.get(1))  // 1
cache.put(3, 3)  // 移除 key 2
console.log(cache.get(2))  // -1
cache.put(4, 4)  // 移除 key 1
console.log(cache.get(1))  // -1
console.log(cache.get(3))  // 3
console.log(cache.get(4))  // 4
```

### 7. 实现函数柯里化

```javascript
function curry(fn) {
  return functi
of(obj, constructor) {
  // 基本类型返回 false
  if (obj === null || typeof obj !== 'object') {
    return false
  }
  
  // 获取对象的原型
  let proto = Object.getPrototypeOf(obj)
  
  // 沿着原型链查找
  while (proto !== null) {
    if (proto === constructor.prototype) {
      return true
    }
    proto = Object.getPrototypeOf(proto)
  }
  
  return false
}

// 测试
console.log(myInstanceof([], Array))  // true
console.log(myInstanceof([], Object))  // true
console.log(myInstanceof({}, Array))  // false
console.log(myInstanceof(null, Object))  // false
```

### 9. 实现 new 操作符

```javascript
function myNew(constructor, ...args) {
  // 1. 创建一个新对象
  const obj = {}
  
  // 2. 将新对象的 __proto__ 指向构造函数的 prototype
  Object.setPrototypeOf(obj, constructor.prototype)
  
  // 3. 将构造函数的 this 绑定到新对象
  const result = constructor.apply(obj, args)
  
  // 4. 如果构造函数返回对象，则返回该对象；否则返回新对象
  return result instanceof Object ? result : obj
}

// 测试
function Person(name, age) {
  this.name = name
  this.age = age
}

Person.prototype.sayName = function() {
  console.log(this.name)
}

const person = myNew(Person, 'John', 25)
console.log(person.name)  // 'John'
person.sayName()  // 'John'
```

### 10. 实现 call、apply、bind

```javascript
// call 实现
Function.prototype.myCall = function(context, ...args) {
  context = context || window
  const fn = Symbol('fn')
  context[fn] = this
  const result = context[fn](...args)
  delete context[fn]
  return result
}

// apply 实现
Function.prototype.myApply = function(context, args) {
  context = context || window
  const fn = Symbol('fn')
  context[fn] = this
  const result = context[fn](...args)
  delete context[fn]
  return result
}

// bind 实现
Function.prototype.myBind = function(context, ...args) {
  const fn = this
  
  return function(...newArgs) {
    return fn.apply(context, [...args, ...newArgs])
  }
}

// 测试
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`
}

const person = { name: 'John' }

console.log(greet.myCall(person, 'Hello', '!'))  // 'Hello, John!'
console.log(greet.myApply(person, ['Hi', '.']))  // 'Hi, John.'

const boundGreet = greet.myBind(person, 'Hey')
console.log(boundGreet('?'))  // 'Hey, John?'
```

---

## 参考资源

### 官方文档
- [MDN JavaScript 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [ECMAScript 规范](https://tc39.es/ecma262/)
- [JavaScript.info](https://javascript.info/)

### 学习资源
- 《你不知道的 JavaScript》系列
- 《JavaScript 高级程序设计》
- 《深入理解 ES6》
- 《JavaScript 设计模式与开发实践》

### 在线工具
- [Babel REPL](https://babeljs.io/repl) - ES6+ 代码转换
- [TypeScript Playground](https://www.typescriptlang.org/play) - TypeScript 在线编辑器
- [JSBench](https://jsbench.me/) - JavaScript 性能测试

---

> 本文档基于 MDN 官方文档和最新 ECMAScript 规范编写，所有代码示例均可运行。
