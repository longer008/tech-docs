# JavaScript 核心面试题集

> 更新时间：2025-02

## 目录导航

- [数据类型](#数据类型)
- [类型转换](#类型转换)
- [作用域与闭包](#作用域与闭包)
- [this 关键字](#this-关键字)
- [原型与继承](#原型与继承)
- [异步编程](#异步编程)
- [事件循环](#事件循环)
- [ES6+ 特性](#es6-特性)
- [常见面试题](#常见面试题)

## 数据类型

### 基本类型与引用类型

JavaScript 有 7 种基本类型和 1 种引用类型：

**基本类型（Primitive Types）**：
- `number`：数字（包含 NaN、Infinity）
- `string`：字符串
- `boolean`：布尔值
- `undefined`：未定义
- `null`：空值
- `symbol`：符号（ES6）
- `bigint`：大整数（ES2020）

**引用类型（Reference Types）**：
- `object`：对象（包括数组、函数、Date、RegExp 等）

**代码示例**：

```javascript
// 基本类型
let num = 123
let str = 'hello'
let bool = true
let undef = undefined
let nul = null
let sym = Symbol('id')
let bigInt = 123n

// 引用类型
let obj = { name: 'John' }
let arr = [1, 2, 3]
let func = function() {}
let date = new Date()
let regex = /abc/
```

### 类型判断

**1. typeof 操作符**

```javascript
// 基本类型
typeof 123          // 'number'
typeof 'abc'        // 'string'
typeof true         // 'boolean'
typeof undefined    // 'undefined'
typeof Symbol()     // 'symbol'
typeof 123n         // 'bigint'

// typeof 的坑
typeof null         // 'object' (历史遗留 bug)
typeof []           // 'object'
typeof {}           // 'object'
typeof function(){} // 'function'
```

**2. instanceof 操作符**

```javascript
// 判断引用类型
[] instanceof Array    // true
{} instanceof Object   // true
(function(){}) instanceof Function  // true

// 原型链判断
class Animal {}
class Dog extends Animal {}
const dog = new Dog()

dog instanceof Dog     // true
dog instanceof Animal  // true
dog instanceof Object  // true
```

**3. Object.prototype.toString（最准确）**

```javascript
// 最准确的类型判断方法
Object.prototype.toString.call([])        // '[object Array]'
Object.prototype.toString.call({})        // '[object Object]'
Object.prototype.toString.call(null)      // '[object Null]'
Object.prototype.toString.call(undefined) // '[object Undefined]'
Object.prototype.toString.call(123)       // '[object Number]'
Object.prototype.toString.call('abc')     // '[object String]'
Object.prototype.toString.call(true)      // '[object Boolean]'
Object.prototype.toString.call(Symbol())  // '[object Symbol]'
Object.prototype.toString.call(123n)      // '[object BigInt]'
Object.prototype.toString.call(function(){}) // '[object Function]'
Object.prototype.toString.call(new Date())   // '[object Date]'
Object.prototype.toString.call(/abc/)        // '[object RegExp]'

// 封装通用类型判断函数
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}

getType([])        // 'array'
getType({})        // 'object'
getType(null)      // 'null'
getType(undefined) // 'undefined'
```

**4. Array.isArray**

```javascript
// 专门判断数组
Array.isArray([])        // true
Array.isArray({})        // false
Array.isArray('array')   // false
Array.isArray(null)      // false
```

### 值类型与引用类型的区别

**存储方式**：
- 值类型：存储在栈（Stack）中，直接存储值
- 引用类型：存储在堆（Heap）中，栈中存储引用地址

**赋值行为**：

```javascript
// 值类型：复制值
let a = 10
let b = a
b = 20
console.log(a)  // 10（a 不受影响）

// 引用类型

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false
  }
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (let key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false
    }
  }
  
  return true
}

deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })  // true
deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })  // false
```

## 类型转换

### 隐式类型转换

JavaScript 是弱类型语言，会在运算时自动进行类型转换。

**转布尔值（Boolean）**

```javascript
// Falsy 值（转换为 false）
Boolean(false)     // false
Boolean(0)         // false
Boolean(-0)        // false
Boolean(0n)        // false
Boolean('')        // false
Boolean(null)      // false
Boolean(undefined) // false
Boolean(NaN)       // false

// Truthy 值（转换为 true）
Boolean(true)      // true
Boolean(1)         // true
Boolean('0')       // true（字符串 '0' 是 truthy）
Boolean('false')   // true（字符串 'false' 是 truthy）
Boolean([])        // true（空数组是 truthy）
Boolean({})        // true（空对象是 truthy）
Boolean(function(){})  // true
```

**转数字（Number）**

```javascript
// 字符串转数字
Number('123')      // 123
Number('123.45')   // 123.45
Number('123abc')   // NaN
Number('')         // 0（空字符串转为 0）
Number('   ')      // 0（空白字符串转为 0）

// 布尔值转数字
Number(true)       // 1
Number(false)      // 0

// null 和 undefined
Number(null)       // 0
Number(undefined)  // NaN

// 数组转数字
Number([])         // 0（空数组）
Number([1])        // 1（单元素数组）
Number([1,2])      // NaN（多元素数组）

// 对象转数字
Number({})         // NaN
Number({ valueOf: () => 42 })  // 42（调用 valueOf）

// 其他转换方法
parseInt('123px')  // 123（解析到非数字字符停止）
parseFloat('3.14')  // 3.14
+'123'             // 123（一元加号）
```

**转字符串（String）**

```javascript
// 基本类型转字符串
String(123)        // '123'
String(true)       // 'true'
String(null)       // 'null'
String(undefined)  // 'undefined'
String(Symbol('id'))  // 'Symbol(id)'

// 数组转字符串
String([1,2,3])    // '1,2,3'
String([])         // ''

// 对象转字符串
String({})         // '[object Object]'
String({ toString: () => 'custom' })  // 'custom'

// 其他转换方法
(123).toString()   // '123'
123 + ''           // '123'（隐式转换）
```

### 常见的隐式转换场景

**1. 算术运算符**

```javascript
// 加号（+）：字符串拼接优先
1 + '2'        // '12'（数字转字符串）
'1' + 2        // '12'
1 + 2 + '3'    // '33'（从左到右：1+2=3，3+'3'='33'）
'1' + 2 + 3    // '123'（从左到右：'1'+2='12'，'12'+3='123'）

// 其他运算符：转数字
'5' - 2        // 3
'5' * '2'      // 10
'10' / '2'     // 5
'5' % 2        // 1
```

**2. 比较运算符**

```javascript
// 相等（==）：会进行类型转换
1 == '1'       // true
0 == false     // true
null == undefined  // true
[] == false    // true（[] 转为 ''，'' 转为 0）
[] == ![]      // true（![] 为 false，[] 转为 0）

// 全等（===）：不进行类型转换
1 === '1'      // false
0 === false    // false
null === undefined  // false

// 大小比较：转数字
'2' > '10'     // true（字符串比较）
'2' > 10       // false（'2' 转为 2）
```

**3. 逻辑运算符**

```javascript
// && 和 ||：返回原值，不转布尔
0 && 1         // 0（返回第一个 falsy 值）
1 && 2         // 2（返回最后一个值）
0 || 1         // 1（返回第一个 truthy 值）
null || undefined || 0 || 'default'  // 'default'

// 短路求值
let user = null
let name = user && user.name  // null（不会报错）
let defaultName = name || 'Guest'  // 'Guest'

// 空值合并运算符（ES2020）
null ?? 'default'      // 'default'
undefined ?? 'default'  // 'default'
0 ?? 'default'         // 0（0 不是 null/undefined）
'' ?? 'default'        // ''（空字符串不是 null/undefined）
```

**4. if 语句和三元运算符**

```javascript
// if 语句：转布尔
if (0) {
  // 不执行
}

if ('0') {
  // 执行（'0' 是 truthy）
}

// 三元运算符
let result = 0 ? 'yes' : 'no'  // 'no'
let result2 = '0' ? 'yes' : 'no'  // 'yes'
```

### 显式类型转换

```javascript
// 转布尔
Boolean(0)     // false
!!0            // false（双重否定）

// 转数字
Number('123')  // 123
+'123'         // 123
parseInt('123px')  // 123
parseFloat('3.14')  // 3.14

// 转字符串
String(123)    // '123'
(123).toString()  // '123'
123 + ''       // '123'
```

## 作用域与闭包

### 作用域

作用域决定了变量的可访问范围。

**1. 全局作用域**

```javascript
// 全局变量
var globalVar = 'global'
let globalLet = 'global'
const globalConst = 'global'

function test() {
  console.log(globalVar)  // 可以访问
}

// 浏览器环境：全局变量挂载到 window
console.log(window.globalVar)  // 'global'（var）
console.log(window.globalLet)  // undefined（let/const 不挂载）
```

**2. 函数作用域**

```javascript
function outer() {
  var funcVar = 'function scope'
  
  function inner() {
    console.log(funcVar)  // 可以访问外层函数变量
  }
  
  inner()
}

outer()
console.log(funcVar)  // ReferenceError: funcVar is not defined
```

**3. 块级作用域（ES6）**

```javascript
// let 和 const 有块级作用域
{
  let blockLet = 'block'
  const blockConst = 'block'
  var blockVar = 'block'
}

console.log(blockVar)  // 'block'（var 没有块级作用域）
console.log(blockLet)  // ReferenceError
console.log(blockConst)  // ReferenceError

// if 语句
if (true) {
  let x = 10
  var y = 20
}
console.log(y)  // 20
console.log(x)  // ReferenceError

// for 循环
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出：0 1 2（每次循环 i 都是新的变量）

for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出：3 3 3（var 没有块级作用域，i 是同一个变量）
```

### 作用域链

```javascript
let global = 'global'

function outer() {
  let outerVar = 'outer'
  
  function middle() {
    let middleVar = 'middle'
    
    function inner() {
      let innerVar = 'inner'
      
      // 作用域链：inner -> middle -> outer -> global
      console.log(innerVar)    // 'inner'
      console.log(middleVar)   // 'middle'
      console.log(outerVar)    // 'outer'
      console.log(global)      // 'global'
    }
    
    inner()
  }
  
  middle()
}

outer()
```

### 闭包

闭包是指函数可以访问其外部作用域的变量，即使外部函数已经执行完毕。

**基础示例**：

```javascript
function createCounter() {
  let count = 0
  
  return function() {
    count++
    return count
  }
}

const counter = createCounter()
console.log(counter())  // 1
console.log(counter())  // 2
console.log(counter())  // 3

// count 变量被闭包保存，不会被垃圾回收
```

**闭包的应用场景**：

**1. 数据私有化**

```javascript
function createPerson(name) {
  // 私有变量
  let _name = name
  let _age = 0
  
  return {
    getName() {
      return _name
    },
    setName(newName) {
      _name = newName
    },
    getAge() {
      return _age
    },
    setAge(newAge) {
      if (newAge >= 0) {
        _age = newAge
      }
    }
  }
}

const person = createPerson('John')
console.log(person.getName())  // 'John'
person.setAge(25)
console.log(person.getAge())   // 25
console.log(person._age)       // undefined（无法直接访问）
```

**2. 函数工厂**

```javascript
function makeAdder(x) {
  return function(y) {
    return x + y
  }
}

const add5 = makeAdder(5)
const add10 = makeAdder(10)

console.log(add5(2))   // 7
console.log(add10(2))  // 12
```

**3. 模块模式**

```javascript
const calculator = (function() {
  // 私有变量和方法
  let result = 0
  
  function add(x) {
    result += x
  }
  
  function subtract(x) {
    result -= x
  }
  
  // 公开接口
  return {
    add,
    subtract,
    getResult() {
      return result
    },
    reset() {
      result = 0
    }
  }
})()

calculator.add(10)
calculator.subtract(3)
console.log(calculator.getResult())  // 7
console.log(calculator.result)       // undefined（私有变量）
```

**4. 防抖和节流**

```javascript
// 防抖：延迟执行，如果在延迟期间再次触发，则重新计时
function debounce(func, delay) {
  let timer = null
  
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// 使用
const handleInput = debounce((e) => {
  console.log('搜索:', e.target.value)
}, 500)

// 节流：固定时间内只执行一次
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

// 使用
const handleScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY)
}, 200)
```

**闭包的注意事项**：

```javascript
// 1. 内存泄漏风险
function createLeak() {
  const largeData = new Array(1000000).fill('data')
  
  return function() {
    // largeData 被闭包引用，无法被垃圾回收
    console.log(largeData.length)
  }
}

// 2. 循环中的闭包陷阱
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i)  // 输出：3 3 3
  }, 100)
}

// 解决方案 1：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i)  // 输出：0 1 2
  }, 100)
}

// 解决方案 2：立即执行函数
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j)  // 输出：0 1 2
    }, 100)
  })(i)
}
```

## this 关键字

`this` 的值取决于函数的调用方式，而不是定义方式。

### this 的绑定规则

**1. 默认绑定**

```javascript
function showThis() {
  console.log(this)
}

showThis()  // 浏览器：window，Node.js：global，严格模式：undefined
```

**2. 隐式绑定**

```javascript
const obj = {
  name: 'John',
  sayName() {
    console.log(this.name)
  }
}

obj.sayName()  // 'John'（this 指向 obj）

// 隐式绑定丢失
const sayName = obj.sayName
sayName()  // undefined（this 指向全局对象）
```

**3. 显式绑定**

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`)
}

const person = { name: 'John' }

// call：立即调用，参数逐个传递
greet.call(person, 'Hello', '!')  // 'Hello, John!'

// apply：立即调用，参数以数组传递
greet.apply(person, ['Hi', '.'])  // 'Hi, John.'

// bind：返回新函数，参数可以分次传递
const boundGreet = greet.bind(person, 'Hey')
boundGreet('?')  // 'Hey, John?'
```

**4. new 绑定**

```javascript
function Person(name) {
  this.name = name
  this.sayName = function() {
    console.log(this.name)
  }
}

const person = new Person('John')
person.sayName()  // 'John'（this 指向新创建的对象）

// new 的执行过程：
// 1. 创建一个新对象
// 2. 将新对象的 __proto__ 指向构造函数的 prototype
// 3. 将构造函数的 this 绑定到新对象
// 4. 执行构造函数
// 5. 如果构造函数返回对象，则返回该对象；否则返回新对象
```

### 箭头函数的 this

箭头函数没有自己的 `this`，它会捕获定义时所在上下文的 `this`。

```javascript
const obj = {
  name: 'John',
  
  // 普通函数
  sayName1: function() {
    console.log(this.name)
  },
  
  // 箭头函数
  sayName2: () => {
    console.log(this.name)
  },
  
  // 嵌套函数
  sayName3: function() {
    setTimeout(function() {
      console.log(this.name)  // undefined（this 指向全局）
    }, 100)
  },
  
  // 箭头函数解决嵌套问题
  sayName4: function() {
    setTimeout(() => {
      console.log(this.name)  // 'John'（this 指向 obj）
    }, 100)
  }
}

obj.sayName1()  // 'John'
obj.sayName2()  // undefined（箭头函数的 this 指向全局）
obj.sayName3()  // undefined
obj.sayName4()  // 'John'
```

**箭头函数的特点**：

```javascript
// 1. 没有 this
const obj = {
  name: 'John',
  getName: () => this.name
}
obj.getName()  // undefined

// 2. 没有 arguments
const func = () => {
  console.log(arguments)  // ReferenceError
}

// 使用 rest 参数代替
const func2 = (...args) => {
  console.log(args)  // [1, 2, 3]
}
func2(1, 2, 3)

// 3. 不能作为构造函数
const Person = (name) => {
  this.name = name
}
new Person('John')  // TypeError: Person is not a constructor

// 4. 没有 prototype
console.log(func.prototype)  // undefined
```

### this 优先级

new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定

```javascript
function foo() {
  console.log(this.name)
}

const obj1 = { name: 'obj1', foo }
const obj2 = { name: 'obj2' }

// 隐式绑定
obj1.foo()  // 'obj1'

// 显式绑定 > 隐式绑定
obj1.foo.call(obj2)  // 'obj2'

// new 绑定 > 显式绑定
const boundFoo = foo.bind(obj1)
const instance = new boundFoo()  // undefined（this 指向新对象）
```


## 原型与继承

### 原型链

每个对象都有一个内部属性 `[[Prototype]]`（通过 `__proto__` 访问），指向其构造函数的 `prototype`。

```javascript
function Person(name) {
  this.name = name
}

Person.prototype.sayName = function() {
  console.log(this.name)
}

const person = new Person('John')

// 原型链
console.log(person.__proto__ === Person.prototype)  // true
console.log(Person.prototype.__proto__ === Object.prototype)  // true
console.log(Object.prototype.__proto__)  // null

// 属性查找
person.sayName()  // 'John'（在 Person.prototype 上找到）
person.toString()  // '[object Object]'（在 Object.prototype 上找到）
```

**原型链图示**：

```
person
  ↓ __proto__
Person.prototype
  ↓ __proto__
Object.prototype
  ↓ __proto__
null
```

### 继承方式

**1. 原型链继承**

```javascript
function Parent() {
  this.name = 'parent'
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child() {
  this.age = 18
}

// 继承
Child.prototype = new Parent()
Child.prototype.constructor = Child

const child1 = new Child()
const child2 = new Child()

// 问题：引用类型共享
child1.colors.push('green')
console.log(child2.colors)  // ['red', 'blue', 'green']
```

**2. 构造函数继承**

```javascript
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child(name, age) {
  // 继承属性
  Parent.call(this, name)
  this.age = age
}

const child1 = new Child('John', 18)
const child2 = new Child('Jane', 20)

// 优点：引用类型不共享
child1.colors.push('green')
console.log(child2.colors)  // ['red', 'blue']

// 缺点：无法继承原型方法
con
rs)  // ['red', 'blue']
console.log(child1.getName())  // 'John'

// 缺点：调用了两次父类构造函数
```

**4. 寄生组合继承（最优）**

```javascript
function Parent(name) {
  this.name = name
  this.colors = ['red', 'blue']
}

Parent.prototype.getName = function() {
  return this.name
}

function Child(name, age) {
  Parent.call(this, name)
  this.age = age
}

// 关键：使用 Object.create 避免调用父类构造函数
Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child

const child = new Child('John', 18)
console.log(child.getName())  // 'John'
```

**5. ES6 Class 继承**

```javascript
class Parent {
  constructor(name) {
    this.name = name
    this.colors = ['red', 'blue']
  }
  
  getName() {
    return this.name
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name)  // 调用父类构造函数
    this.age = age
  }
  
  getAge() {
    return this.age
  }
}

const child = new Child('John', 18)
console.log(child.getName())  // 'John'
console.log(child.getAge())   // 18
```

## 异步编程

### 回调函数

```javascript
// 回调地狱（Callback Hell）
setTimeout(() => {
  console.log('1')
  setTimeout(() => {
    console.log('2')
    setTimeout(() => {
      console.log('3')
    }, 1000)
  }, 1000)
}, 1000)

// 错误处理困难
function getData(callback) {
  setTimeout(() => {
    const error = Math.random() > 0.5 ? new Error('Failed') : null
    const data = error ? null : { id: 1, name: 'John' }
    callback(error, data)
  }, 1000)
}

getData((error, data) => {
  if (error) {
    console.error(error)
  } else {
    console.log(data)
  }
})
```

### Promise

Promise 是异步编程的解决方案，代表一个异步操作的最终完成或失败。

**基础用法**：

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = Math.random() > 0.5
    if (success) {
      resolve('Success!')
    } else {
      reject(new Error('Failed!'))
    }
  }, 1000)
})

// 使用 Promise
promise
  .then(result => {
    console.log(result)
    return 'Next step'
  })
  .then(result => {
    console.log(result)
  })
  .catch(error => {
    console.error(error)
  })
  .finally(() => {
    console.log('Cleanup')
  })
```

**Promise 状态**：
- `pending`：初始状态
- `fulfilled`：操作成功
- `rejected`：操作失败

**Promise 链式调用**：

```javascript
function fetchUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: 'John' })
    }, 1000)
  })
}

function fetchPosts(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ])
    }, 1000)
  })
}

// 链式调用
fetchUser(1)
  .then(user => {
    console.log('User:', user)
    return fetchPosts(user.id)
  })
  .then(posts => {
    console.log('Posts:', posts)
  })
  .catch(error => {
    console.error('Error:', error)
  })
```

**Promise 静态方法**：

```javascript
// Promise.all：所有 Promise 都成功才成功
Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => {
  console.log(results)  // [1, 2, 3]
})

// 任意一个失败就失败
Promise.all([
  Promise.resolve(1),
  Promise.reject(new Error('Failed')),
  Promise.resolve(3)
]).catch(error => {
  console.error(error)  // Error: Failed
})

// Promise.race：第一个完成的 Promise 决定结果
Promise.race([
  new Promise(resolve => setTimeout(() => resolve(1), 100)),
  new Promise(resolve => setTimeout(() => resolve(2), 50))
]).then(result => {
  console.log(result)  // 2
})

// Promise.allSettled：等待所有 Promise 完成（无论成功或失败）
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject(new Error('Failed')),
  Promise.resolve(3)
]).then(results => {
  console.log(results)
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: Error: Failed },
  //   { status: 'fulfilled', value: 3 }
  // ]
})

// Promise.any：第一个成功的 Promise 决定结果
Promise.any([
  Promise.reject(new Error('Error 1')),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(result => {
  console.log(result)  // 2
})
```

### async/await

async/await 是 Promise 的语法糖，让异步代码看起来像同步代码。

**基础用法**：

```javascript
// async 函数返回 Promise
async function fetchData() {
  return 'data'
}

fetchData().then(data => console.log(data))  // 'data'

// await 等待 Promise 完成
async function getData() {
  const data = await fetchData()
  console.log(data)  // 'data'
}

// 错误处理
async function fetchUser() {
  try {
    const response = await fetch('/api/user')
    const user = await response.json()
    return user
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
```

**并发执行**：

```javascript
// 串行执行（慢）
async function sequential() {
  const user = await fetchUser(1)      // 等待 1 秒
  const posts = await fetchPosts(1)    // 等待 1 秒
  return { user, posts }                // 总共 2 秒
}

// 并发执行（快）
async function concurrent() {
  const [user, posts] = await Promise.all([
    fetchUser(1),
    fetchPosts(1)
  ])
  return { user, posts }  // 总共 1 秒
}

// 使用 Promise.allSettled 处理部分失败
async function fetchAllData() {
  const results = await Promise.allSettled([
    fetchUser(1),
    fetchPosts(1),
    fetchComments(1)
  ])
  
  const [userResult, postsResult, commentsResult] = results
  
  return {
    user: userResult.status === 'fulfilled' ? userResult.value : null,
    posts: postsResult.status === 'fulfilled' ? postsResult.value : [],
    comments: commentsResult.status === 'fulfilled' ? commentsResult.value : []
  }
}
```

**循环中的 async/await**：

```javascript
const ids = [1, 2, 3, 4, 5]

// 串行执行
async function processSequential() {
  for (const id of ids) {
    const user = await fetchUser(id)
    console.log(user)
  }
}

// 并发执行
async function processConcurrent() {
  const promises = ids.map(id => fetchUser(id))
  const users = await Promise.all(promises)
  users.forEach(user => console.log(user))
}

// 限制并发数
async function processWithLimit(limit = 2) {
  const results = []
  for (let i = 0; i < ids.length; i += limit) {
    const batch = ids.slice(i, i + limit)
    const batchResults = await Promise.all(
      batch.map(id => fetchUser(id))
    )
    results.push(...batchResults)
  }
  return results
}
```

## 事件循环

JavaScript 是单线程的，通过事件循环（Event Loop）实现异步操作。

### 执行栈与任务队列

```
┌─────────────────────────────────────┐
│         Call Stack（执行栈）         │
│  ┌─────────────────────────────┐   │
│  │   当前执行的同步代码         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Microtask Queue（微任务队列）   │
│  Promise.then, queueMicrotask       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Macrotask Queue（宏任务队列）   │
│  setTimeout, setInterval, I/O       │
└─────────────────────────────────────┘
```

### 宏任务与微任务

**宏任务（Macrotask）**：
- `setTimeout`
- `setInterval`
- `setImmediate`（Node.js）
- I/O 操作
- UI 渲染

**微任务（Microtask）**：
- `Promise.then/catch/finally`
- `queueMicrotask`
- `MutationObserver`
- `process.nextTick`（Node.js）

**执行顺序**：

```javascript
console.log('1')  // 同步代码

setTimeout(() => {
  console.log('2')  // 宏任务
}, 0)

Promise.resolve().then(() => {
  console.log('3')  // 微任务
})

console.log('4')  // 同步代码

// 输出顺序：1 4 3 2
```

**复杂示例**：

```javascript
console.log('start')

setTimeout(() => {
  console.log('setTimeout 1')
  Promise.resolve().then(() => {
    console.log('promise 1')
  })
}, 0)

Promise.resolve().then(() => {
  console.log('promise 2')
  setTimeout(() => {
    console.log('setTimeout 2')
  }, 0)
})

console.log('end')

// 输出顺序：
// start
// end
// promise 2
// setTimeout 1
// promise 1
// setTimeout 2
```

**事件循环流程**：

1. 执行同步代码
2. 执行所有微任务
3. 执行一个宏任务
4. 执行所有微任务
5. 重复步骤 3-4

```javascript
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')

setTimeout(() => {
  console.log('setTimeout')
}, 0)

async1()

new Promise(resolve => {
  console.log('promise1')
  resolve()
}).then(() => {
  console.log('promise2')
})

console.log('script end')

// 输出顺序：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```


## ES6+ 特性

### 解构赋值

**数组解构**：

```javascript
// 基础用法
const [a, b, c] = [1, 2, 3]
console.log(a, b, c)  // 1 2 3

// 跳过元素
const [first, , third] = [1, 2, 3]
console.log(first, third)  // 1 3

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4, 5]
console.log(head)  // 1
console.log(tail)  // [2, 3, 4, 5]

// 默认值
const [x = 1, y = 2] = [10]
console.log(x, y)  // 10 2

// 交换变量
let a = 1, b = 2
;[a, b] = [b, a]
console.log(a, b)  // 2 1
```

**对象解构**：

```javascript
// 基础用法
const { name, age } = { name: 'John', age: 25 }
console.log(name, age)  // 'John' 25

// 重命名
const { name: userName, age: userAge } = { name: 'John', age: 25 }
console.log(userName, userAge)  // 'John' 25

// 默认值
const { name = 'Guest', age = 18 } = { name: 'John' }
console.log(name, age)  // 'John' 18

// 嵌套解构
const user = {
