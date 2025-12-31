# JavaScript 核心面试题集

> JavaScript 核心概念、ES6+ 特性与高频面试题

## A. 面试宝典

### 基础题

#### 1. 数据类型

```
┌─────────────────────────────────────────────────────────────┐
│                    JavaScript 数据类型                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  基本类型（值类型）：                                        │
│  ──────────────────────────────────────────────────────────│
│  number      数字（包含 NaN、Infinity）                     │
│  string      字符串                                         │
│  boolean     布尔值                                         │
│  undefined   未定义                                         │
│  null        空值                                           │
│  symbol      符号（ES6）                                    │
│  bigint      大整数（ES2020）                               │
│                                                              │
│  引用类型：                                                  │
│  ──────────────────────────────────────────────────────────│
│  object      对象（包括数组、函数、Date、RegExp 等）        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**类型判断：**
```javascript
// typeof（判断基本类型）
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

// instanceof（判断引用类型）
[] instanceof Array    // true
{} instanceof Object   // true
(function(){}) instanceof Function  // true

// Object.prototype.toString（最准确）
Object.prototype.toString.call([])     // '[object Array]'
Object.prototype.toString.call({})     // '[object Object]'
Object.prototype.toString.call(null)   // '[object Null]'
Object.prototype.toString.call(undefined) // '[object Undefined]'

// Array.isArray
Array.isArray([])   // true
Array.isArray({})   // false
```

---

#### 2. 类型转换

```javascript
// 隐式转换规则
// ============================================

// 转布尔值（Boolean）
// falsy 值：false, 0, '', null, undefined, NaN
Boolean(0)         // false
Boolean('')        // false
Boolean(null)      // false
Boolean([])        // true (空数组是 truthy)
Boolean({})        // true

// 转数字（Number）
Number('123')      // 123
Number('123abc')   // NaN
Number('')         // 0
Number(true)       // 1
Number(false)      // 0
Number(null)       // 0
Number(undefined)  // NaN
Number([])         // 0
Number([1])        // 1
Number([1,2])      // NaN
Number({})         // NaN

// 转字符串（String）
String(123)        // '123'
String(true)       // 'true'
String(null)       // 'null'
String(undefined)  // 'undefined'
String([1,2,3])    // '1,2,3'
String({})         // '[object Object]'

// 经典陷阱
// ============================================
[] == false        // true  ([] → '' → 0, false → 0)
[] == ![]          // true  (![] → false, [] → 0, false → 0)
{} == '[object Object]'  // true
'0' == false       // true
null == undefined  // true
null === undefined // false

// + 运算符
1 + '2'            // '12' (字符串拼接)
'3' - 1            // 2 (转数字)
'3' * '2'          // 6
+'123'             // 123 (一元加号转数字)
```

---

#### 3. 作用域与闭包

```javascript
// 作用域类型
// ============================================

// 全局作用域
var globalVar = 'global';

// 函数作用域
function fn() {
  var functionVar = 'function';
}

// 块级作用域（ES6 let/const）
{
  let blockVar = 'block';
  const blockConst = 'block';
}

// var vs let vs const
// ============================================
// var：函数作用域，变量提升，可重复声明
// let：块级作用域，暂时性死区，不可重复声明
// const：块级作用域，必须初始化，不可重新赋值

console.log(a);  // undefined（变量提升）
var a = 1;

console.log(b);  // ReferenceError（暂时性死区）
let b = 1;

// 闭包
// ============================================
function outer() {
  let count = 0;

  return function inner() {
    count++;
    return count;
  };
}

const counter = outer();
counter();  // 1
counter();  // 2
counter();  // 3

// 闭包应用
// 1. 数据私有化
function createPerson(name) {
  let _name = name;  // 私有变量

  return {
    getName() { return _name; },
    setName(n) { _name = n; }
  };
}

// 2. 函数柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...args2) {
      return curried.apply(this, args.concat(args2));
    };
  };
}

// 3. 防抖节流（见下文）

// 经典闭包陷阱
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出: 3, 3, 3

// 解决方案1：let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// 解决方案2：IIFE
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
```

---

#### 4. 原型与继承

```
┌─────────────────────────────────────────────────────────────┐
│                    原型链                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  实例           构造函数           原型对象                  │
│  ──────────────────────────────────────────────────────────│
│                                                              │
│  person ───────▶ Person.prototype ───────▶ Object.prototype │
│    │              │                          │              │
│    │ __proto__    │ constructor              │ __proto__    │
│    │              │                          │              │
│    ▼              ▼                          ▼              │
│  Person ◀──────── Person              null                  │
│                                                              │
│  person.__proto__ === Person.prototype  // true             │
│  Person.prototype.constructor === Person // true            │
│  Person.prototype.__proto__ === Object.prototype // true    │
│  Object.prototype.__proto__ === null  // true               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 构造函数
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person('John');
person.sayHello();

// ES6 class（语法糖）
class Person {
  constructor(name) {
    this.name = name;
  }

  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }

  static create(name) {
    return new Person(name);
  }
}

// 继承方式
// ============================================

// 1. 原型链继承
function Child() {}
Child.prototype = new Parent();

// 2. 构造函数继承
function Child() {
  Parent.call(this);
}

// 3. 组合继承（推荐）
function Child(name) {
  Parent.call(this, name);
}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

// 4. ES6 class 继承
class Child extends Parent {
  constructor(name) {
    super(name);
  }
}

// new 操作符原理
function myNew(Constructor, ...args) {
  // 1. 创建新对象，原型指向构造函数原型
  const obj = Object.create(Constructor.prototype);
  // 2. 执行构造函数，绑定 this
  const result = Constructor.apply(obj, args);
  // 3. 返回对象（构造函数返回对象则用该对象）
  return result instanceof Object ? result : obj;
}
```

---

#### 5. this 指向

```javascript
// this 绑定规则（优先级从高到低）
// ============================================

// 1. new 绑定
function Person(name) {
  this.name = name;
}
const p = new Person('John');  // this → p

// 2. 显式绑定（call/apply/bind）
function fn() {
  console.log(this.name);
}
fn.call({ name: 'John' });   // this → { name: 'John' }
fn.apply({ name: 'John' });  // this → { name: 'John' }
const boundFn = fn.bind({ name: 'John' });

// 3. 隐式绑定（对象调用）
const obj = {
  name: 'John',
  fn() { console.log(this.name); }
};
obj.fn();  // this → obj

// 4. 默认绑定
function fn() {
  console.log(this);
}
fn();  // 严格模式: undefined, 非严格模式: window

// 箭头函数（没有自己的 this）
// ============================================
const obj = {
  name: 'John',
  // 普通函数
  normalFn() {
    console.log(this.name);  // 'John'
  },
  // 箭头函数
  arrowFn: () => {
    console.log(this.name);  // undefined (继承外层 this)
  },
  // 嵌套
  nestedFn() {
    setTimeout(() => {
      console.log(this.name);  // 'John' (继承 nestedFn 的 this)
    }, 100);
  }
};

// 手写 call
Function.prototype.myCall = function(context, ...args) {
  context = context || window;
  const fn = Symbol();
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// 手写 apply
Function.prototype.myApply = function(context, args) {
  context = context || window;
  const fn = Symbol();
  context[fn] = this;
  const result = context[fn](...(args || []));
  delete context[fn];
  return result;
};

// 手写 bind
Function.prototype.myBind = function(context, ...args) {
  const fn = this;
  return function bound(...args2) {
    return fn.apply(
      this instanceof bound ? this : context,
      args.concat(args2)
    );
  };
};
```

---

### 进阶题

#### 6. 异步编程

```javascript
// 回调地狱
getData(function(a) {
  getMoreData(a, function(b) {
    getEvenMoreData(b, function(c) {
      // ...
    });
  });
});

// Promise
// ============================================
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
    // reject(new Error('failed'));
  }, 1000);
});

promise
  .then(value => console.log(value))
  .catch(error => console.error(error))
  .finally(() => console.log('done'));

// Promise 静态方法
Promise.resolve(value);  // 返回已解决的 Promise
Promise.reject(error);   // 返回已拒绝的 Promise
Promise.all([p1, p2]);   // 全部成功才成功
Promise.race([p1, p2]);  // 返回最先完成的
Promise.allSettled([p1, p2]); // 返回所有结果
Promise.any([p1, p2]);   // 返回第一个成功的

// async/await
// ============================================
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

// 并行请求
async function parallel() {
  const [data1, data2] = await Promise.all([
    fetch('/api/1'),
    fetch('/api/2')
  ]);
}

// 手写 Promise
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function'
      ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function'
      ? onRejected : error => { throw error; };

    return new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        queueMicrotask(() => {
          try {
            const result = onFulfilled(this.value);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      };

      const handleRejected = () => {
        queueMicrotask(() => {
          try {
            const result = onRejected(this.reason);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      };

      if (this.state === 'fulfilled') {
        handleFulfilled();
      } else if (this.state === 'rejected') {
        handleRejected();
      } else {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });
  }
}
```

---

#### 7. 事件循环（Event Loop）

```
┌─────────────────────────────────────────────────────────────┐
│                    事件循环                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                    调用栈 (Call Stack)              │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▲                                  │
│                          │                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │               微任务队列 (Microtask Queue)          │    │
│  │  Promise.then, queueMicrotask, MutationObserver    │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▲                                  │
│                          │                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │               宏任务队列 (Macrotask Queue)          │    │
│  │  setTimeout, setInterval, setImmediate, I/O        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  执行顺序：                                                 │
│  1. 执行同步代码（调用栈）                                  │
│  2. 调用栈为空，检查微任务队列                              │
│  3. 执行所有微任务                                          │
│  4. 渲染页面（如需要）                                      │
│  5. 执行一个宏任务                                          │
│  6. 重复 2-5                                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```javascript
// 经典面试题
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => {
    console.log('3');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => {
    console.log('5');
  }, 0);
});

console.log('6');

// 输出顺序: 1, 6, 4, 2, 3, 5

// 解析：
// 同步: 1, 6
// 微任务: 4 (在此添加宏任务 5)
// 宏任务: 2 (在此添加微任务 3)
// 微任务: 3
// 宏任务: 5

// async/await 的执行顺序
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');
setTimeout(() => console.log('setTimeout'), 0);
async1();
new Promise(resolve => {
  console.log('promise1');
  resolve();
}).then(() => console.log('promise2'));
console.log('script end');

// 输出:
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

---

#### 8. ES6+ 新特性

```javascript
// 解构赋值
const { name, age = 18 } = person;
const [first, ...rest] = array;

// 展开运算符
const arr = [...arr1, ...arr2];
const obj = { ...obj1, ...obj2 };

// 模板字符串
const str = `Hello, ${name}!`;
const multiline = `
  Line 1
  Line 2
`;

// 箭头函数
const add = (a, b) => a + b;
const square = x => x * x;

// 默认参数
function fn(a, b = 10) {}

// 剩余参数
function fn(...args) {}

// 对象简写
const obj = { name, age, sayHello() {} };

// 计算属性名
const key = 'name';
const obj = { [key]: 'John' };

// Symbol
const sym = Symbol('description');
const obj = { [sym]: 'value' };

// Set / Map
const set = new Set([1, 2, 3]);
set.add(4);
set.has(1);
set.delete(1);

const map = new Map();
map.set('key', 'value');
map.get('key');
map.has('key');

// WeakSet / WeakMap（弱引用，可被垃圾回收）
const weakSet = new WeakSet();
const weakMap = new WeakMap();

// Proxy
const proxy = new Proxy(target, {
  get(target, prop) {
    return target[prop];
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  }
});

// Reflect
Reflect.get(obj, 'name');
Reflect.set(obj, 'name', 'value');
Reflect.has(obj, 'name');

// 可选链 ?.
const name = user?.profile?.name;
const fn = obj?.method?.();

// 空值合并 ??
const value = input ?? 'default';  // 只有 null/undefined 用默认值

// 逻辑赋值
x ||= y;  // x = x || y
x &&= y;  // x = x && y
x ??= y;  // x = x ?? y

// 数字分隔符
const num = 1_000_000;

// BigInt
const big = 9007199254740991n;

// 私有字段（ES2022）
class Person {
  #name;  // 私有字段
  constructor(name) {
    this.#name = name;
  }
}

// 顶层 await（ES2022）
const data = await fetch('/api');
```

---

#### 9. 防抖与节流

```javascript
// 防抖（Debounce）
// 连续触发只执行最后一次
function debounce(fn, delay, immediate = false) {
  let timer = null;

  return function(...args) {
    const callNow = immediate && !timer;

    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    }, delay);

    if (callNow) {
      fn.apply(this, args);
    }
  };
}

// 使用场景：搜索框输入、窗口 resize
const handleSearch = debounce((query) => {
  fetchResults(query);
}, 300);

// 节流（Throttle）
// 固定时间间隔执行一次
function throttle(fn, delay) {
  let lastTime = 0;
  let timer = null;

  return function(...args) {
    const now = Date.now();

    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    } else {
      // 保证最后一次执行
      clearTimeout(timer);
      timer = setTimeout(() => {
        lastTime = now;
        fn.apply(this, args);
      }, delay - (now - lastTime));
    }
  };
}

// 使用场景：滚动事件、鼠标移动
const handleScroll = throttle(() => {
  console.log('scrolling');
}, 100);
```

---

#### 10. 深拷贝

```javascript
// 浅拷贝
const shallowCopy = { ...obj };
const shallowCopy = Object.assign({}, obj);

// 深拷贝（JSON 方法，有限制）
const deepCopy = JSON.parse(JSON.stringify(obj));
// 限制：无法处理函数、undefined、Symbol、循环引用

// 完整深拷贝
function deepClone(obj, map = new WeakMap()) {
  // 基本类型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理循环引用
  if (map.has(obj)) {
    return map.get(obj);
  }

  // 处理特殊对象
  if (obj instanceof Date) {
    return new Date(obj);
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  if (obj instanceof Map) {
    const clone = new Map();
    map.set(obj, clone);
    obj.forEach((value, key) => {
      clone.set(deepClone(key, map), deepClone(value, map));
    });
    return clone;
  }
  if (obj instanceof Set) {
    const clone = new Set();
    map.set(obj, clone);
    obj.forEach(value => {
      clone.add(deepClone(value, map));
    });
    return clone;
  }

  // 处理数组和普通对象
  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);

  // 复制自身属性（包括 Symbol）
  Reflect.ownKeys(obj).forEach(key => {
    clone[key] = deepClone(obj[key], map);
  });

  return clone;
}

// 使用 structuredClone（现代浏览器）
const copy = structuredClone(obj);
```

---

### 避坑指南

| 陷阱 | 正确理解 |
|------|----------|
| typeof null === 'object' | 历史 bug，用 === null 判断 |
| [] == false | true，因为类型转换 |
| 0.1 + 0.2 !== 0.3 | 浮点精度问题 |
| let 没有变量提升 | 有提升，但有暂时性死区 |
| 箭头函数没有 this | 继承外层 this，不能用 call 改变 |

---

## B. 实战文档

### 常用工具函数

```javascript
// 类型判断
const getType = (obj) =>
  Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();

// 数组去重
const unique = (arr) => [...new Set(arr)];

// 数组扁平化
const flatten = (arr) => arr.flat(Infinity);

// 对象扁平化
const flattenObj = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(acc, flattenObj(obj[key], newKey));
    } else {
      acc[newKey] = obj[key];
    }
    return acc;
  }, {});
};

// 生成随机字符串
const randomString = (len = 8) =>
  Math.random().toString(36).slice(2, 2 + len);

// 生成 UUID
const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

// 解析 URL 参数
const parseQuery = (url) => {
  const query = url.split('?')[1] || '';
  return Object.fromEntries(new URLSearchParams(query));
};

// 格式化日期
const formatDate = (date, fmt = 'YYYY-MM-DD HH:mm:ss') => {
  const d = new Date(date);
  const map = {
    YYYY: d.getFullYear(),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    DD: String(d.getDate()).padStart(2, '0'),
    HH: String(d.getHours()).padStart(2, '0'),
    mm: String(d.getMinutes()).padStart(2, '0'),
    ss: String(d.getSeconds()).padStart(2, '0'),
  };
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, (m) => map[m]);
};

// 金额格式化
const formatMoney = (num) =>
  Number(num).toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  });

// 手机号脱敏
const maskPhone = (phone) =>
  phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
```

### 发布订阅模式

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
    return this;
  }

  off(event, callback) {
    if (!this.events.has(event)) return this;
    if (!callback) {
      this.events.delete(event);
    } else {
      const callbacks = this.events.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
    return this;
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return this;
    this.events.get(event).forEach(callback => {
      callback.apply(this, args);
    });
    return this;
  }
}
```

### 常见正则表达式

```javascript
// 手机号（简单版）
const phoneReg = /^1[3-9]\d{9}$/;

// 邮箱
const emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;

// 身份证
const idCardReg = /^\d{17}[\dXx]$/;

// URL
const urlReg = /^https?:\/\/[^\s]+$/;

// 中文
const chineseReg = /[\u4e00-\u9fa5]/;

// 密码（8-20位，包含字母和数字）
const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
```
